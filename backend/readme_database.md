# Base de données

Stack : **Prisma v6** (ORM) + **SQLite** (base de données locale, un simple fichier).

## Installation

Depuis `backend/` :

```bash
npm install prisma@6 --save-dev
npm install @prisma/client@6
npm install bcrypt
npm install -D @types/bcrypt
```

Dans le fichier `.env` (à créer soi-même, jamais partagé sur Git) :
```
DATABASE_URL="file:./dev.db"
```

Puis, générer la base de données locale à partir du schéma :
```bash
npx prisma migrate dev
```

## Commandes utiles au quotidien

| Commande | À quoi elle sert |
|---|---|
| `npx prisma studio` | Ouvre une interface graphique (dans le navigateur) pour voir/éditer les données |
| `sqlite3 prisma/dev.db "SELECT * FROM User;"` | Affiche le contenu de la table `User` directement en ligne de commande |
| `sqlite3 prisma/dev.db "SELECT COUNT(*) FROM User;"` | Compte le nombre de lignes dans `User` |
| `sqlite3 prisma/dev.db ".tables"` | Liste toutes les tables existantes |

## Quand modifier le schéma (`prisma/schema.prisma`)

Après **chaque** changement du fichier `schema.prisma` (nouveau champ, nouveau modèle) :
```bash
npx prisma migrate dev --name description_du_changement
```
Cette commande met à jour la vraie base et régénère les fonctions TypeScript. **Pas besoin de la relancer à chaque démarrage du projet** — seulement après une modification du schéma.

## Réinitialiser complètement la base (si besoin, en dev uniquement)

```bash
npx prisma migrate reset
```
⚠️ Supprime toutes les données existantes et recrée la base de zéro à partir des migrations.

## Fichiers importants

- `prisma/schema.prisma` → décrit la structure des données (partagé sur Git)
- `prisma/migrations/` → historique des changements de structure (partagé sur Git)
- `prisma/dev.db` → la vraie base de données locale (**jamais partagée**, dans le `.gitignore`)