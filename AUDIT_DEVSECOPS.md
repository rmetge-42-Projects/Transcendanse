# Audit DevSecOps — Chi-Fou-Mi

**Date :** 10 octobre 2026  
**Périmètre :** Prometheus et Grafana, exporters et intégrations, tableaux de bord, règles et livraison des alertes, accès Grafana, santé et statut, sauvegardes et reprise après sinistre, Nginx/ModSecurity, HashiCorp Vault et Makefile.  
**Méthode :** lecture des fichiers et contrôles non destructifs sur le stack en cours d’exécution. Aucun secret n’a été lu ou recopié. Seul ce rapport d’audit a été mis à jour.

## Synthèse des notes

| Élément évalué | Note | État constaté |
|---|---:|---|
| Prometheus — collecte | **B+** | Valide. Configuration acceptée ; 9 cibles `up=1`, dont Vault, PostgreSQL et les sondes HTTP. |
| Exporters et intégrations | **B** | Fonctionnels ; limites sur la validation TLS Blackbox et l’exposition hôte de Node Exporter. |
| Dashboard Grafana personnalisé | **B** | JSON et provisioning présents ; santé Grafana valide, mais chargement du dashboard non confirmé par l’API. |
| Règles Prometheus | **A-** | 4 règles chargées et syntaxiquement valides, dont une alerte de fraîcheur des backups. |
| Livraison des alertes | **A-** | Alertmanager configuré avec Gmail ; un test réel a été reçu par l’utilisateur. La délivrabilité externe ne peut pas être garantie par les métriques seules. |
| Contrôle d’accès Grafana | **B+** | Interface liée à `127.0.0.1`, identifiants fournis par Vault, volume persistant. |
| Santé et statut | **B** | Services applicatifs et page de statut répondent ; endpoint public révèle l’état de quelques composants seulement. |
| Sauvegardes automatisées | **C+** | Dumps PostgreSQL chiffrés, frais et retenus localement ; intégrité cryptographique, copie hors machine et uploads manquants. |
| Reprise après sinistre | **C** | Runbook PostgreSQL disponible ; aucune restauration complète vérifiée, uploads/Vault non couverts comme ensemble. |
| WAF / ModSecurity | **B-** | CRS actif (856 règles chargées), configuration Nginx valide ; image non épinglée, vérification TLS désactivée dans Blackbox, rate limiting et en-têtes absents. |
| Vault / gestion des secrets | **C+** | TLS, politiques et volumes dédiés sont en place ; clés Shamir et root token co-stockés, valeurs bootstrap toujours en `.env` et dans la configuration d’environnement du conteneur. |
| Makefile / impact des nettoyages | **B+** | `clean` est limité au projet et conserve les volumes ; `fclean`/`re` suppriment les données des volumes du projet. |

**Note globale : B-.** Les progrès sont réels : le monitoring est actif, les alertes email sont arrivées, Vault alimente plusieurs consommateurs et le nettoyage Docker ne touche plus globalement les autres projets. La note reste plafonnée par la reprise après sinistre et le cycle de vie des secrets Vault. Ce résultat est approprié à un projet d’école en développement, mais ne constitue pas une validation de mise en production.

## 1. Prometheus — collecte — **B+ / valide**

`prometheus/prometheus.yml` collecte Prometheus, Node Exporter, PostgreSQL Exporter, Vault, quatre sondes Blackbox et le backup exporter. L’intervalle de collecte et d’évaluation est de 15 secondes, la rétention TSDB de 15 jours et le volume Prometheus est persistant. Le port hôte `9090` est lié à `127.0.0.1`.

**Vérifications effectuées :** `docker compose config --quiet` réussit ; `promtool check config` valide la configuration. Au moment du contrôle, les neuf séries `up` étaient à `1`; `pg_up=1`, `vault_core_unsealed=1` et les quatre `probe_success=1`.

**À améliorer :** ajouter des métriques métier du backend (latence, taux d’erreur, activité WebSocket) et prévoir l’export ou la sauvegarde des historiques Prometheus si leur perte est importante. Une rétention locale de 15 jours n’est pas une sauvegarde.

## 2. Exporters et intégrations — **B / valides avec réserves**

- **Node Exporter :** version taguée `v1.9.1`, cible active. Il utilise `pid: host` et lit `/proc`, `/sys` et la racine hôte en lecture seule. C’est courant pour les métriques système, mais cela donne à un exporter compromis une visibilité étendue sur l’hôte.
- **PostgreSQL Exporter :** version taguée `v0.20.1`, cible et métrique `pg_up` actives. Ses identifiants proviennent d’un volume Vault séparé monté en lecture seule.
- **Vault :** scrappé en HTTPS avec le certificat CA du projet ; la cible est active et le contrôle a relevé Vault descellé. L’accès non authentifié aux métriques est volontairement activé dans `Vault/vault.conf`, mais limité au réseau Docker `vault_internal` auquel Prometheus et le backend sont connectés.
- **Blackbox Exporter :** version `v0.28.0`; les quatre probes HTTP/HTTPS fonctionnent. Cependant `prometheus/blackbox.yml` définit `insecure_skip_verify: true`. Le probe HTTPS ne valide donc ni la chaîne de confiance ni l’identité du certificat : un certificat invalide peut être présenté comme acceptable.
- **Backup exporter :** exporte le `mtime` du fichier chiffré non vide le plus récent. La cible fonctionne. Ce timestamp confirme uniquement l’existence et l’âge apparent d’un fichier ; il ne prouve ni que le dump est lisible ni qu’il se restaure.

**À faire :** retirer `insecure_skip_verify` et fournir la CA, le nom DNS et les SAN attendus pour la sonde TLS ; conserver l’exposition des métriques limitée au réseau interne ; considérer un utilisateur non privilégié et des montages hôte aussi réduits que possible pour Node Exporter.

## 3. Dashboard Grafana — **B / configuration valide, chargement à confirmer**

`grafana/dashboards/overview.json` contient un dashboard personnalisé de sept panneaux (cibles, probes, PostgreSQL, état Vault, mémoire, latence HTTP et état des cibles). Le datasource Prometheus et le fournisseur de dashboards sont provisionnés depuis les fichiers du dépôt. Le service possède un volume de données persistant.

L’API `/api/health` de Grafana répond `database: ok` sur la version 11.2.2. La santé de l’API ne démontre pas que le dashboard a été importé dans l’interface : le chargement effectif et les requêtes de chaque panneau restent à confirmer.

**À améliorer :** vérifier le dashboard dans l’interface/API après démarrage ; ajouter des graphiques applicatifs et des seuils utiles pour les erreurs, la latence et l’espace disque. Les panneaux actuels sont surtout infrastructure et disponibilité.

## 4. Alertes et livraison — **A- / valides, test réel réussi**

`prometheus/alerts.yml` définit quatre règles : backup absent ou âgé de plus de 20 minutes, cible Prometheus indisponible, sonde HTTP en échec et Vault scellé. `promtool check rules` reconnaît les quatre règles. Prometheus transmet les alertes à Alertmanager ; le récepteur Gmail est défini dans `alertmanager/alertmanager.yml`, avec TLS SMTP obligatoire et le mot de passe lu depuis un fichier de secret projeté par Vault. La configuration d’Alertmanager est acceptée.

Un test synthétique a été envoyé à l’adresse Gmail configurée et l’utilisateur a confirmé l’avoir reçu. Cela valide le chemin SMTP de bout en bout au moment du test. Le test ne prouve pas le comportement de toutes les alertes en panne réelle, ni la remise future chez le fournisseur.

**À améliorer :** conserver un test périodique du canal ; déclencher une alerte contrôlée `BackupMissingOrStale` en environnement de test, puis vérifier le message et la résolution. Vérifier aussi les alertes dans Prometheus/Alertmanager après un redémarrage et documenter la procédure de rotation du mot de passe d’application. Éviter de baser une alerte sur une série absente sans une expression couvrant explicitement cette absence — ici `absent(...)` est déjà prévu pour le backup.

## 5. Accès Grafana — **B+ / plutôt bien limité**

Le port `3005` est lié à `127.0.0.1`, donc l’interface n’est pas publiée directement sur toutes les interfaces réseau. L’entrypoint lit l’utilisateur et le mot de passe dans le volume Grafana alimenté par Vault, monté en lecture seule. La base Grafana est persistée. L’API de santé est accessible dans le conteneur.

**À améliorer :** si un accès distant est requis, passer par VPN ou reverse proxy authentifié avec TLS et ne pas publier Grafana directement. Documenter la récupération et la rotation du compte admin. Aucun healthcheck Compose Grafana dédié n’est défini.

## 6. Santé et page de statut — **B / fonctionnelles, couverture partielle**

Au contrôle, `backend`, `frontend`, `database`, `status_page`, `nginx` et `backup_monitor` étaient `healthy`. L’endpoint de statut a répondu HTTP 200 avec `database`, `frontend` et `backend` à `up`. Nginx et Grafana répondaient également à leurs contrôles. Les exporters n’ont pas tous de healthcheck Docker dédié ; leur disponibilité est suivie par Prometheus.

La page `/api/health` est relayée par Nginx et expose des détails d’état. Elle ne couvre pas Vault, les backups, Alertmanager, Prometheus ou Grafana. C’est une page de santé des dépendances applicatives, pas un statut complet de la plateforme.

**À améliorer :** décider quelles informations peuvent rester visibles publiquement ; ajouter les composants dont l’état doit être présenté ou fournir une page opérationnelle séparée. Garder l’endpoint minimal pour éviter de divulguer des détails internes non nécessaires.

## 7. Backups automatisés — **C+ / utiles, mais non résistants à une perte majeure**

`backup.sh` effectue un `pg_dump` toutes les dix minutes, chiffre avant écriture, utilise un fichier temporaire, échoue explicitement si le pipeline échoue ou produit un fichier vide, puis conserve les six fichiers les plus récents. Les backups sont dans `./backups`, hors des volumes Compose, avec le répertoire en mode `700` et exclu de Git. Le healthcheck de `backup_monitor` recherche un fichier non vide de moins de 20 minutes. Le backup exporter publie l’âge du fichier le plus récent ; sa métrique était fraîche pendant l’audit.

**Risques importants :**

- Les six copies restent sur le même poste/disque que le projet ; cela protège contre certaines erreurs logiques, pas contre la perte du disque ou du poste.
- `openssl enc -aes-256-cbc -pbkdf2` ne fournit pas d’authentification cryptographique du ciphertext. Une altération n’est pas garantie d’être détectée comme telle.
- Le contrôle de présence/taille et le timestamp ne vérifient pas le contenu ni sa restauration. Aucun test de restauration PostgreSQL complet n’a été réalisé ici.
- Seule la base PostgreSQL est sauvegardée. Le volume `vol_back` du backend, susceptible de contenir des uploads, n’est pas inclus.
- La rétention nominale est d’environ une heure (`6 × 10 min`), donc une panne prolongée peut éliminer tous les points de restauration récents.

**À faire :** transférer des copies chiffrées hors machine avec une rétention adaptée ; adopter un chiffrement authentifié qui détecte corruption et falsification ; inclure les uploads si leur conservation est requise ; effectuer et consigner des restaurations complètes sur un environnement séparé.

## 8. Reprise après sinistre — **C / runbook partiel, restauration non éprouvée**

`RESTORE.md` documente la restauration manuelle d’un dump PostgreSQL après `make fclean`, à condition d’avoir préservé `backups/` et la clé. Les dumps sont hors des volumes supprimés par cette cible. Le document précise certaines limites de cette procédure scolaire.

**Ce qui manque :** aucun exercice complet n’a vérifié la base restaurée et le parcours applicatif ; les uploads ne sont pas couverts ; Vault et ses clés ne font pas partie d’une copie de reprise cohérente. Un nouveau Vault peut générer un nouveau secret JWT, ce qui peut invalider les sessions existantes. Les sauvegardes restent locales et la durée de reprise (RTO) ainsi que la perte de données acceptable (RPO) ne sont pas définies.

**À faire :** définir RPO/RTO réalistes ; ajouter uploads et configuration/artefacts nécessaires à une reprise ; documenter les conséquences d’une réinitialisation Vault et la conservation séparée des clés ; répéter un exercice de restauration dans un environnement propre.

## 9. WAF / ModSecurity — **B- / actif, durcissement incomplet**

`nginx/nginx.conf` active `modsecurity on`, TLS 1.2/1.3, reverse proxy vers les services et une limite de corps de requête de 25 Mo. Compose active le moteur ModSecurity en mode `On` et l’inspection du corps. `nginx -t` réussit ; les logs indiquent **856 règles CRS chargées**. Les routes API, statut, santé et Socket.IO ne désactivent pas globalement le WAF.

**Écarts à corriger :**

- `nginx/Dockerfile` utilise `FROM owasp/modsecurity-crs:nginx-alpine`, sans version précise ni digest. Une reconstruction peut donc récupérer une image différente de celle auditée.
- `prometheus/blackbox.yml` ignore les erreurs de vérification TLS comme indiqué plus haut. Cela affaiblit la surveillance TLS, même si Nginx présente actuellement un certificat connu du projet.
- Aucun `limit_req` ou `limit_conn` n’est défini dans la configuration Nginx. Le CRS ne remplace pas une limite de débit adaptée aux endpoints exposés.
- Aucun en-tête HTTP de défense en profondeur tel que HSTS, `X-Content-Type-Options` ou une politique CSP n’apparaît dans la configuration examinée. Une CSP doit être adaptée/testée avec l’application avant activation stricte.
- Le certificat Nginx est auto-signé : adapté au développement local, pas à un service public sans chaîne de confiance gérée.

**À faire :** épingler l’image WAF à une version vérifiée ou un digest ; configurer et tester des limites de débit/connexions par route, en tenant compte des WebSockets et des usages légitimes ; ajouter progressivement les en-têtes pertinents ; tester le CRS en parcours normaux et sur requêtes malveillantes, avec revue des faux positifs et des logs. Corriger la validation TLS Blackbox avec une CA au lieu de l’ignorer.

## 10. Vault et secrets — **C+ / bonne séparation des consommateurs, bootstrap trop exposé**

Vault écoute en TLS (minimum TLS 1.2) et rejoint un réseau Docker interne. Le backend valide le certificat Vault. Des volumes distincts projettent les secrets nécessaires à la base, au backup, à l’exporter PostgreSQL, à Grafana et à Alertmanager ; les consommateurs les montent en lecture seule. La policy backend autorise la lecture d’un seul chemin. Le token backend est dans un volume distinct des clés et le chemin configuré côté backend correspond au volume monté.

**Risques importants :**

- `vol_vault_keys` contient dans un même `keys.txt` les parts d’unseal et le root token. Le fichier est en `0400`, mais le seuil Shamir ne protège plus contre la lecture de ce fichier unique ; une copie ou un accès Docker au volume donne toutes les parts et le token.
- Le démarrage automatique lit ces clés et descelle Vault. La séparation logique de 2 parts sur 3 ne procure pas de séparation entre dépositaires quand le script garde les parts ensemble.
- `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `BACKUP_ENCRYPTION_KEY` et `GMAIL_APP_PASSWORD` sont injectés comme variables d’environnement du conteneur Vault depuis `.env`. Le script les retire de l’environnement du processus Vault après capture, mais l’environnement déclaré dans la configuration Docker reste une source d’exposition aux personnes ayant accès à Docker/`docker inspect`.
- `.env` est ignoré par Git, ce qui évite un commit accidentel mais ne chiffre pas le fichier local. Il reste une copie de bootstrap des secrets en clair.
- Les fichiers runtime projetés sont en `0444`; les volumes sont séparés et montés en lecture seule côté consommateur, ce qui réduit l’accès, sans protéger le secret contre un processus compromis dans ce consommateur.

**À faire :** ne pas conserver ensemble toutes les parts Shamir et le root token ; les garder séparément, hors ligne, avec une procédure de récupération ; retirer les secrets bootstrap des variables Docker persistantes en faveur de fichiers secrets protégés ou d’un mécanisme adapté ; définir rotation/révocation des tokens et mots de passe ; limiter les accès au daemon Docker, qui peut contourner une grande partie de l’isolation des volumes.

## 11. Makefile et portée des nettoyages — **B+ / portée corrigée, destruction de données explicite**

`Makefile` n’utilise plus `docker system prune -f`. `make clean` exécute `docker compose down --rmi local` : l’action porte sur les ressources du projet et conserve ses volumes. `make fclean` exécute `docker compose down -v --rmi all` : cela supprime les volumes Compose du projet, donc notamment PostgreSQL, Vault, uploads, Grafana et l’historique Prometheus. `make re` dépend de `fclean` puis reconstruit ; il est donc destructif pour ces données. Les dumps sous `backups/` restent sur l’hôte, mais ne comprennent pas les uploads.

**À faire :** garder clairement visible dans la documentation que `fclean` et `re` effacent les volumes du projet ; vérifier les sauvegardes nécessaires avant ces cibles ; s’assurer que la procédure de reprise couvre les données que l’on veut conserver. Le nettoyage global affectant d’autres projets a été corrigé.

## Vérifications effectuées le 10 octobre 2026

- `docker compose config --quiet` : succès.
- État Compose : services principaux en cours d’exécution ; backend, backup, base, frontend, Nginx et page de statut indiqués `healthy`.
- `promtool check config` : succès ; `promtool check rules` : 4 règles reconnues.
- Prometheus : 9 cibles `up=1`; `pg_up=1`; `vault_core_unsealed=1`; 4 sondes `probe_success=1`.
- Page de statut : HTTP 200, DB/frontend/backend à `up`.
- Grafana `/api/health` : `database: ok`, version 11.2.2.
- `nginx -t` : succès ; ModSecurity : 856 règles CRS chargées.
- `amtool check-config` : succès ; test email Gmail effectivement reçu par l’utilisateur.
- Backup : healthcheck sain, fichiers récents observés dans `backups/` et répertoire en mode `700`. Pas de restauration complète pendant cet audit.
- Recherche statique : `insecure_skip_verify` présent ; aucune directive `limit_req`, `limit_conn` ou en-tête HTTP de sécurité repéré dans les fichiers Nginx examinés ; image ModSecurity sans version épinglée.

## Priorités recommandées

1. **Reprise :** faire un test de restauration complet et copier les backups hors machine ; inclure `vol_back` si les uploads doivent survivre.
2. **Intégrité :** remplacer AES-CBC sans authentification par un format de chiffrement authentifié et tester la détection d’altération.
3. **Vault :** séparer les parts Shamir et le root token ; réduire les secrets injectés dans l’environnement Docker et les copies bootstrap en `.env`.
4. **WAF/TLS :** épingler l’image WAF ; retirer `insecure_skip_verify`, configurer une CA valide ; ajouter des limites de débit et en-têtes HTTP après tests fonctionnels.
5. **Monitoring :** confirmer le dashboard provisionné dans l’interface et valider périodiquement une alerte de backup manquant de bout en bout.
6. **Makefile :** conserver la portée Compose actuelle et rappeler que `fclean`/`re` suppriment les volumes du projet.
