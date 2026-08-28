# Intégration HashiCorp Vault - Équipe Backend

Pour valider le module Cybersécurité, notre backend ne doit plus lire de fichier `.env` classique. Le mot de passe de la base de données est désormais stocké et chiffré dans Vault.

## 1. Informations de connexion

Au démarrage de l'application, votre code doit faire une requête HTTP vers Vault pour récupérer la variable `DATABASE_URL` avant d'initialiser Prisma.

*   **Endpoint de l'API :** `http://vault:8200/v1/secret/data/database`
*   **Header d'authentification requis :** `X-Vault-Token`
*   **Votre Token restreint :** `hvs.VOTRE_TOKEN_ICI` *(remplacez par le token que je vous ai transmis)*

## 2. Test de validation manuel

Pour vérifier que la liaison réseau fonctionne, ouvrez un terminal **à l'intérieur de votre conteneur backend** et exécutez cette requête de test :

curl -H "X-Vault-Token: hvs.VOTRE_TOKEN_ICI" -X GET http://vault:8200/v1/secret/data/database

**Réponse attendue :**
Vous recevrez un JSON. L'URL de connexion se trouve dans la structure au chemin : `data.data.DATABASE_URL`.

## 3. Remontée d'erreurs

Si le test échoue :
1. **Connection Refused :** Vérifiez que votre conteneur backend est bien connecté au même réseau Docker que le conteneur `vault`.
2. **403 Permission Denied :** Le token est mal recopié ou la politique de lecture ne s'est pas appliquée.
3. Copiez le retour exact de l'erreur et envoyez-le-moi pour que je corrige l'infrastructure.
