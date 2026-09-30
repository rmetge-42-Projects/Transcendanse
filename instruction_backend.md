PS: J'ai fait une partie des instructions.

# Intégration HashiCorp Vault - Instructions pour le Backend

Afin de valider le module de Cybersécurité, le backend ne doit plus utiliser les variables d'environnement locales pour les mots de passe. Les identifiants doivent être récupérés dynamiquement au démarrage de l'application via l'API de Vault.

Voici les 4 étapes exactes à implémenter dans le code du backend (quel que soit le framework ou langage utilisé) avant de démarrer le serveur :

### 1. Lire le Token Vault depuis le volume partagé
Avant d'initialiser la connexion à la base de données, l'application doit lire le token racine généré par Vault.
* **Action :** Écrire une fonction synchrone pour lire le contenu du fichier situé à `/vault/secrets/backend_token.txt`. 
* **Résultat :** Sauvegarder cette chaîne de caractères dans une variable interne (ex: `VAULT_TOKEN`).

### 2. Récupérer les secrets via une requête HTTP GET
En utilisant ce token, le backend doit faire un appel API vers le conteneur Vault présent sur le réseau interne Docker.
* **Action :** Effectuer une requête HTTP GET vers l'URL : `http://vault:8200/v1/secret/data/backend`
* **Header requis :** Vous devez inclure le header d'authentification suivant dans la requête : `X-Vault-Token: <VAULT_TOKEN>`

### 3. Parser les données JSON
L'API de Vault va renvoyer un objet JSON imbriqué. Le code doit parser cette réponse pour extraire les valeurs dont nous avons besoin.
* **Action :** Extraire les deux valeurs suivantes depuis la réponse JSON :
  * L'URL de la DB : `response.data.data.database_url`
  * Le secret JWT : `response.data.data.jwt_secret`

### 4. Injecter l'état et démarrer le serveur
* **Action :** Assigner ces valeurs extraites à la configuration interne de l'application (ou écraser les variables d'environnement du processus programmatiquement). 
* **Important :** Ce n'est qu'une fois ces valeurs configurées en mémoire que le backend doit tenter de se connecter à la base de données PostgreSQL et lancer l'écoute sur le port `3000`.

