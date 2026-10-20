# Guide de tests et de validation des modules

Ce guide permet de vérifier manuellement les fonctions du projet et de réunir des preuves pour la soutenance. Il couvre les modules du barème fournis pour l’audit. Les commandes sont prévues pour un environnement local de démonstration.

> **Précautions**
>
> - Les essais ModSecurity et les essais qui créent ou suppriment des données doivent être effectués uniquement sur l’instance locale de test.
> - Ne partage jamais `.env`, un token JWT, la clé API, le token root Vault ou une capture contenant ces valeurs.
> - `make fclean` et `make re` suppriment les volumes Compose, dont PostgreSQL, Vault, les profils téléversés et les données Prometheus/Grafana. Ne les lance pas pour les tests ordinaires.
> - Les commandes `curl -k` acceptent le certificat TLS local auto-signé. Cela convient à l’environnement de démonstration.

## 1. Préparer l’environnement

À la racine du dépôt, vérifier que Docker Compose, `curl` et `jq` sont disponibles, puis configurer `.env` à partir du modèle si nécessaire. Renseigner les valeurs locales requises sans les commiter.

```bash
test -f .env || cp .env.example .env
docker compose version
curl --version
jq --version
```

Démarrer le projet et attendre que les services soient sains :

```bash
make
docker compose ps
```

Les comptes de démonstration sont initialisés une fois par volume. Le script du projet utilise `maya@gmail.com` et le mot de passe de démonstration `motdepasse123` (voir `create-test-users.sh`). Utiliser de préférence deux comptes de démonstration différents pour les scénarios à deux utilisateurs.

Contrôler les services et les journaux sans afficher `.env` ni les fichiers secrets :

```bash
docker compose ps
docker compose logs --tail=80 backend vault nginx test_users_seed
```

Résultat attendu : les services principaux sont `Up`/`healthy`, Vault est prêt, le backend annonce le chargement des secrets et le seed termine sans erreur. Si le seed a déjà tourné, son message indique que les comptes existent déjà.

URL de l’application : <https://localhost:8443>. Accepter l’avertissement du certificat local dans le navigateur de test.

## 2. Parcours Web et gestion des utilisateurs

### 2.1 Frameworks frontend/backend — Web Major, 2 points

1. Ouvrir l’application dans un navigateur.
2. Parcourir l’inscription/connexion, les profils, la découverte, les matchs et les messages.
3. Contrôler que les pages proviennent du frontend Next.js et que les requêtes `/api/...` sont servies par le backend.

Contrôle de santé HTTP :

```bash
curl -k -i https://localhost:8443/
curl -k -i https://localhost:8443/api/health
```

**Réussite :** la page d’accueil répond correctement et l’endpoint de santé répond sans erreur. Pour la soutenance, expliquer le chemin Navigateur → Nginx → Next.js ou NestJS → PostgreSQL/Prisma.

### 2.2 Gestion standard des utilisateurs — User Management Major, 2 points

Dans l’interface, avec un compte de test :

1. Se connecter et ouvrir son profil.
2. Modifier des champs de profil, enregistrer, recharger et confirmer la persistance.
3. Modifier l’avatar : choisir une image, la recadrer, confirmer, puis recharger le profil.
4. Ouvrir le profil d’un match et vérifier les informations et l’état en ligne/hors ligne.
5. Avec deux comptes, créer un match réciproque, vérifier qu’il apparait dans les contacts/messages, puis le retirer.

**Réussite :** les modifications persistent, l’avatar s’affiche et la relation de match apparait/disparait comme prévu. Présenter le match comme le modèle de contact/« ami » propre à l’application de rencontre.

> Si le jury exige une relation d’amitié indépendante du match, ce point doit être confirmé avec lui : le code de l’application utilise les matchs comme liste de contacts.

### 2.3 ORM — Web Minor, 1 point

Dans l’arborescence, montrer `backend/prisma/schema.prisma` et le service Prisma utilisé par les modules. Pendant les parcours ci-dessus, vérifier que les profils, matchs et messages restent présents après actualisation.

**Réussite :** le schéma décrit les modèles applicatifs et les opérations backend passent par Prisma.

### 2.4 SSR — Web Minor, 1 point

1. Ouvrir une page publique (accueil, confidentialité ou conditions).
2. Afficher le code source de la page (`Ctrl+U`) et confirmer que le contenu principal est présent dans le HTML reçu, sans dépendre uniquement de l’hydratation client.
3. Inspecter les métadonnées et le titre de page.

**Réussite :** le contenu public est rendu côté serveur. Noter toute métadonnée générique ou langue HTML incorrecte à corriger avant de revendiquer un bénéfice SEO complet.

### 2.5 Design system — Web Minor, 1 point

Dans `front/src/composant/ui`, présenter les dix composants réutilisables (Avatar, Badge, Button, Card, EmptyState, IconButton, PageHeader, StatusDot, TextField et TextareaField). Montrer plusieurs usages dans l’application et expliquer la palette, les polices et les icônes réellement utilisées.

**Réussite :** au moins dix composants réutilisables sont identifiables et l’interface partage des choix visuels cohérents. Si la palette ou la typographie n’est pas centralisée, présenter le point comme partiellement abouti.

### 2.6 Upload de fichiers — non compté actuellement

Tester l’avatar avec une image autorisée, trop volumineuse et un fichier non-image. Vérifier les messages d’erreur et que le fichier invalide n’est pas enregistré. Vérifier aussi suppression/remplacement de l’avatar.

Le module du sujet demande plusieurs types de fichiers, validation client et serveur, stockage protégé, aperçu, progression et suppression. Le seul flux d’avatar ne prouve probablement pas le module complet.

## 3. Temps réel et interaction

### 3.1 WebSockets — Web Major, 2 points

1. Ouvrir deux sessions navigateur privées ou deux navigateurs avec deux comptes qui ont un match actif.
2. Se connecter dans les deux sessions et ouvrir la conversation.
3. Envoyer un message depuis la première session et vérifier son apparition dans la seconde sans rechargement.
4. Fermer une session et vérifier la présence hors ligne; reconnecter et vérifier le retour en ligne.
5. Répéter en laissant un autre onglet de ce même compte connecté : la fermeture du premier onglet ne devrait pas le déclarer hors ligne si un socket reste actif.

**Réussite :** messages diffusés en direct, présence mise à jour et déconnexion gérée sans état incohérent.

### 3.2 Interaction entre utilisateurs — Web Major, 2 points

Dans deux comptes de test, démontrer : consultation de profil, like réciproque, apparition du contact, échange de messages et retrait du match.

**Réussite :** les deux utilisateurs peuvent discuter après le match et le contact peut être retiré. Garder une capture avant/après du contact, sans données personnelles réelles.

### 3.3 Chat avancé — Gaming Minor, non compté actuellement

Tester le blocage d’un utilisateur, l’accès à son profil depuis les contacts, l’historique, les accusés de lecture et la suppression/masquage d’un message ou d’une conversation. Le barème demande aussi invitations de jeu, notifications jeu/tournoi et indicateurs de saisie : les fonctions existantes ne suffisent donc pas forcément à valider le module complet.

## 4. API publique

### 4.1 Authentification, documentation et CRUD — Web Major, 2 points

Les exemples ci-dessous récupèrent la clé dans une variable de shell locale, sans l’imprimer. Ils supposent que Docker est démarré et que le compte opérateur local peut lire Vault. Ne pas exécuter avec `set -x` et ne pas capturer l’écran pendant cette étape.

```bash
set +x
API_KEY="$(docker compose exec -T vault sh -c 'export VAULT_TOKEN="$(awk "/Initial Root Token:/ {print \$4}" /vault/keys/keys.txt)"; vault kv get -field=public_api_key secret/backend')"
test "${#API_KEY}" -eq 64 && echo "Clé chargée (valeur masquée)"
```

Vérifier le refus sans clé et l’accès avec clé :

```bash
curl -k -sS -o /dev/null -w 'sans clé: HTTP %{http_code}\n' \
  https://localhost:8443/api/public/users

curl -k -sS -o /tmp/dating-public-docs.json -w 'avec clé: HTTP %{http_code}\n' \
  https://localhost:8443/api/public/docs \
  -H "x-api-key: ${API_KEY}"
jq '.endpoints | length' /tmp/dating-public-docs.json
rm -f /tmp/dating-public-docs.json
```

**Réussite :** la requête sans clé est refusée (401), la requête authentifiée répond (200) et la documentation décrit les routes.

Tester GET, POST, PUT et DELETE sur un utilisateur temporaire. Le `trap` supprime l’utilisateur de test si le script se termine normalement ou sur erreur :

```bash
set -euo pipefail
set +x
API_BASE='https://localhost:8443/api/public'
TEST_EMAIL="codex-test-$(date +%s)@example.invalid"
TEST_ID=''
cleanup_api_test() {
  if [ -n "$TEST_ID" ]; then
    curl -k -sS -X DELETE "$API_BASE/users/$TEST_ID" \
      -H "x-api-key: ${API_KEY}" >/dev/null || true
  fi
  unset API_KEY
}
trap cleanup_api_test EXIT

CREATED="$(curl -k -sS -f -X POST "$API_BASE/users" \
  -H "x-api-key: ${API_KEY}" \
  -H 'Content-Type: application/json' \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"TempPass-2026!\",\"name\":\"API Test\",\"username\":\"apitest$(date +%s)\",\"kind\":\"non_binary\",\"orientation\":\"all\",\"biography\":\"Compte temporaire de test API\"}")"
TEST_ID="$(printf '%s' "$CREATED" | jq -r '.id')"
test "$TEST_ID" != null

curl -k -sS -f "$API_BASE/users/$TEST_ID" \
  -H "x-api-key: ${API_KEY}" | jq '{id, username, biography}'

curl -k -sS -f -X PUT "$API_BASE/users/$TEST_ID" \
  -H "x-api-key: ${API_KEY}" -H 'Content-Type: application/json' \
  -d '{"name":"API Test modifié","biography":"Mise à jour de test"}' \
  | jq '{id, name, biography}'

curl -k -sS -f "$API_BASE/users?limit=5&offset=0" \
  -H "x-api-key: ${API_KEY}" | jq 'length'

curl -k -sS -f -X DELETE "$API_BASE/users/$TEST_ID" \
  -H "x-api-key: ${API_KEY}"
TEST_ID=''
```

Le compte temporaire est un utilisateur de la base : exécuter ce scénario uniquement sur une base de test. Si le terminal est interrompu brutalement, supprimer ensuite ce compte par l’API ou recréer l’environnement de test selon les règles de l’équipe.

### 4.2 Limitation de débit — Web Major, 2 points

À faire en dernier, car la limite par défaut est partagée pour la clé API et de nouvelles requêtes peuvent temporairement être rejetées. Une fois les essais API terminés, lancer au maximum 65 appels rapides :

```bash
set +x
API_KEY="$(docker compose exec -T vault sh -c 'export VAULT_TOKEN="$(awk "/Initial Root Token:/ {print \$4}" /vault/keys/keys.txt)"; vault kv get -field=public_api_key secret/backend')"
for i in $(seq 1 65); do
  curl -k -sS -o /dev/null -w '%{http_code}\n' \
    https://localhost:8443/api/public/users \
    -H "x-api-key: ${API_KEY}"
done
unset API_KEY
```

**Réussite :** après la limite configurée (60/min par défaut), l’API répond `429`; les réponses incluent les en-têtes `X-RateLimit-*`. Attendre au moins une minute avant les appels suivants.

## 5. Authentification, 2FA et sécurité

### 5.1 Authentification et 2FA — User Management Minor, 1 point

Dans l’interface, avec un compte de test :

1. Se connecter avec le mot de passe correct, puis vérifier qu’un mot de passe incorrect est refusé.
2. Activer la 2FA, scanner le QR code avec une application d’authentification et confirmer avec le code courant.
3. Se déconnecter, se reconnecter, puis valider le second facteur.
4. Tester un code erroné et confirmer son refus.
5. Désactiver la 2FA et confirmer qu’une connexion ultérieure suit le parcours attendu.

**Réussite :** le code correct est accepté, le mauvais code est refusé et l’état 2FA persiste. Ne jamais prendre en photo ou partager le secret/QR de production.

### 5.2 WAF/ModSecurity — avec Vault, Cybersecurity Major, 2 points pour le module combiné

Ne lancer ces charges que sur `localhost` et avec le service local. Commencer par une route non destructive. Exemple de sonde SQLi sur la connexion :

```bash
curl -k -i -X POST https://localhost:8443/api/auth/login \
  -H 'Content-Type: application/json' \
  --data '{"email":"test@example.invalid\u0027 OR \u00271\u0027=\u00271","password":"invalid"}'
```

Exemple de sonde XSS inerte (texte uniquement, aucun script n’est exécuté par `curl`) :

```bash
curl -k -i -X POST https://localhost:8443/api/auth/login \
  -H 'Content-Type: application/json' \
  --data '{"email":"<script>alert(1)</script>","password":"invalid"}'
```

Contrôler immédiatement les journaux :

```bash
docker compose logs --since=5m nginx
```

**Réussite :** la charge est bloquée par le WAF (souvent HTTP 403) et un événement de règle apparait dans les logs. Un rejet applicatif seul (400/401) ne prouve pas que ModSecurity a bloqué la requête. Refaire les essais sur les chemins de création/modification de profil et expliquer leurs exclusions ModSecurity : l’inspection du corps y est désactivée dans la configuration actuelle. Vérifier qu’un parcours normal de profil fonctionne après les tests.

### 5.3 Vault et séparation des secrets — même module Cybersecurity Major

Vérifier le démarrage et la stabilité de la clé sans afficher les secrets :

```bash
docker compose logs --tail=80 vault backend
```

À l’aide de la commande de récupération masquée de la section API, enregistrer la clé dans `API_KEY`, redémarrer Vault/backend sans supprimer les volumes, puis récupérer la clé de nouveau dans une autre variable et comparer les longueurs ou les empreintes. Ne jamais afficher la valeur brute. La clé doit persister lors d’un redémarrage simple, et le backend doit la recharger.

**Réussite :** Vault est sain, les secrets backend se chargent, l’API continue de fonctionner après redémarrage et le frontend ne contient pas la clé. Ne pas tester la suppression du volume Vault pendant la validation courante.

### 5.4 CORS — contrôle de configuration

Le backend reçoit une origine CORS définie par Compose. Tester l’origine configurée (ici l’origine publique du projet) et une origine arbitraire :

```bash
curl -k -i -X OPTIONS https://localhost:8443/api/auth/login \
  -H 'Origin: https://transcendance42.fr:8443' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'

curl -k -i -X OPTIONS https://localhost:8443/api/auth/login \
  -H 'Origin: https://origine-inconnue.example' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```

**Réussite :** l’origine autorisée reçoit l’en-tête `Access-Control-Allow-Origin` correspondant; l’origine non autorisée ne le reçoit pas. Si la valeur change, comparer `CORS_ORIGIN` dans `.env.example` avec la valeur réellement transmise dans `docker-compose.yml`.

## 6. Navigateurs et accessibilité

### 6.1 Navigateurs supplémentaires — Accessibility & Internationalization Minor, 1 point

Exécuter la même mini-grille sur Chrome, Firefox et Microsoft Edge, avec les versions et dates consignées :

- connexion/inscription;
- création et modification de profil, avatar et recadrage;
- découverte, like, match et retrait de match;
- chat temps réel dans deux sessions;
- activation et utilisation de la 2FA;
- appels API nécessaires à l’interface;
- vérification de la console développeur et des erreurs réseau.

**Réussite :** les parcours essentiels fonctionnent dans les trois navigateurs, avec une interface cohérente et sans erreur bloquante. Remplir une fiche de preuve : navigateur/version, date, parcours, résultat, capture sans données sensibles. La grille `docs/browser-support.md` nomme actuellement Safari; mettre cette documentation en cohérence avec les navigateurs réellement testés.

### 6.2 WCAG, langues et RTL — non comptés actuellement

Faire un contrôle clavier (Tab/Shift+Tab/Entrée/Espace), vérifier le focus visible, les libellés accessibles, le contraste, les erreurs de formulaire et un lecteur d’écran. Vérifier aussi les traductions et une mise en page RTL si ces fonctions existent.

Le module WCAG demande une conformité complète AA; le module langues demande au moins trois traductions complètes et un sélecteur. Un contrôle manuel ponctuel ne suffit pas à les revendiquer.

## 7. DevOps, monitoring et reprise

### 7.1 Healthchecks et page de statut — DevOps Minor, 1 point

```bash
docker compose ps
curl -k -i https://localhost:8443/api/health
curl -k -i https://localhost:8443/status/
```

**Réussite :** les services requis sont sains et la page de statut présente l’état des dépendances. Pour tester une panne, ne pas arrêter la base de données partagée pendant l’évaluation. Utiliser seulement un environnement isolé, puis remettre le service en marche et constater le retour à l’état sain.

### 7.2 Prometheus, Grafana et alertes — DevOps Major, 2 points

Ouvrir :

- Prometheus : <http://localhost:9090/targets>
- Prometheus règles : <http://localhost:9090/rules>
- Alertmanager : <http://localhost:9093>
- Grafana : <http://localhost:3005>

Dans Prometheus, vérifier que les cibles `prometheus`, `node_exporter`, `postgresql`, `vault`, `blackbox-http` et `backup-exporter` sont UP. Dans Grafana, ouvrir le dashboard fourni et confirmer que les panneaux affichent des données. Vérifier les règles d’alerte et la configuration de notification sans révéler le mot de passe SMTP.

**Réussite :** métriques actualisées, exporters actifs, dashboard chargé et règles d’alertes évaluées. Pour démontrer une alerte, utiliser de préférence une panne simulée en environnement jetable; rétablir ensuite le service.

### 7.3 Sauvegarde et restauration — DevOps Minor, 1 point

Attendre au moins un cycle de sauvegarde, puis vérifier uniquement les noms, dates et tailles des fichiers chiffrés :

```bash
find backups -maxdepth 1 -type f -name 'backup_*.sql.enc' -printf '%TY-%Tm-%Td %TH:%TM %s bytes %f\n' | sort
docker compose ps backup_monitor
docker compose logs --tail=60 backup_monitor
```

Ne pas afficher/déchiffrer le contenu du backup dans une session enregistrée. Pour valider une restauration, suivre `RESTORE.md` sur un environnement jetable avec une copie du backup; cette procédure cible PostgreSQL et peut remplacer une base vierge. Ne pas improviser sur la base partagée de test.

**Réussite :** backup récent, non vide, chiffré; restauration vérifiée sur environnement isolé et application accessible après reprise. Documenter les limites : uploads et état Vault ne sont pas inclus dans la sauvegarde PostgreSQL.

## 8. Modules sans points dans l’état actuel

| Module du barème | Contrôle à faire | Pourquoi aucun point n’est compté ici |
|---|---|---|
| Notifications complètes | Générer chaque création, modification et suppression; vérifier notification UI et persistance. | Pas de preuve d’un système complet couvrant toutes les actions. |
| Collaboration temps réel | Ouvrir un espace partagé et modifier un même contenu depuis plusieurs utilisateurs. | Aucun espace de travail/édition collaborative identifié. |
| PWA | Installer l’application et tester le mode hors ligne après chargement. | Manifest/service worker et stratégie offline non démontrés. |
| Recherche avancée | Tester filtres combinables, tri et pagination dans l’interface. | Pas de recherche avancée complète identifiée. |
| OAuth 2.0 | Connexion réelle via un fournisseur et gestion du retour OAuth. | Aucun fournisseur OAuth identifié. |
| Permissions avancées | Tester rôles et autorisations distinctes (admin/modérateur/utilisateur). | Pas de rôles/actions différenciés démontrés. |
| Organisations | Créer, modifier, supprimer une organisation et gérer ses membres. | Fonctionnalité absente. |
| Statistiques de jeu, IA et gaming | Jouer un jeu fonctionnel, suivre résultats, matchmaking, IA/tournois/spectateurs selon le module. | Application de rencontre sans jeu fonctionnel identifié. |
| ELK | Ingestion Elasticsearch, transformation Logstash, dashboards Kibana, rétention et accès sécurisé. | Stack non présente. |
| Microservices backend | Démontrer plusieurs services applicatifs faiblement couplés communiquant par API/queue. | Les services Compose d’infrastructure/exporters ne constituent pas à eux seuls un backend applicatif microservices. |
| Analytics / export / RGPD | Dashboard interactif exportable; export/import multi-format; demande d’accès/suppression et confirmation. | Aucun ensemble complet de ces fonctions identifié. |
| Blockchain | Enregistrer et relire des scores de tournoi sur chaîne. | Pas de jeu/tournoi ni d’intégration blockchain identifié. |
| Module de choix | Présenter la justification technique et la valeur ajoutée dans le README. | Aucun module distinct justifié comme module de choix. |

## 9. Fiche de résultats à remplir

Pour chaque essai, consigner :

| Date | Module/point | Environnement | Étapes réalisées | Résultat (OK/KO/partiel) | Preuve | Action restante |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

Ne pas inclure de vrais emails, avatars personnels, mots de passe, clés, tokens ou secrets dans les captures remises au jury.

## 10. Arrêt normal

Après les tests, arrêter les conteneurs en gardant les données :

```bash
make down
```

Ne lancer `make fclean`/`make re` que si la suppression complète des données de démonstration est voulue et que les backups nécessaires ont été conservés.
