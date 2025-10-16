# Decor Mali

Application web full-stack pour la gestion de devis et services de décoration au Mali.

## Technologies utilisées

- **Frontend**: React 19, Tailwind CSS, Radix UI
- **Backend**: Express, tRPC
- **Base de données**: MySQL avec Drizzle ORM
- **Stockage**: AWS S3
- **Build**: Vite, esbuild

## Déploiement sur GitHub

### Prérequis

- Compte GitHub
- Git installé sur votre machine

### Étapes de déploiement

1. **Initialiser un dépôt Git local** (si ce n'est pas déjà fait)

```bash
cd decor-mali
git init
```

2. **Ajouter tous les fichiers au dépôt**

```bash
git add .
git commit -m "Initial commit - Decor Mali application"
```

3. **Créer un nouveau dépôt sur GitHub**

   - Allez sur [GitHub](https://github.com)
   - Cliquez sur le bouton "New repository"
   - Nommez votre dépôt (par exemple: `decor-mali`)
   - Ne cochez pas "Initialize this repository with a README"
   - Cliquez sur "Create repository"

4. **Lier votre dépôt local au dépôt GitHub**

```bash
git remote add origin https://github.com/VOTRE_USERNAME/decor-mali.git
git branch -M main
git push -u origin main
```

## Déploiement sur Netlify

### Option 1: Déploiement via l'interface Netlify (Recommandé)

1. **Créer un compte Netlify**

   - Allez sur [Netlify](https://www.netlify.com)
   - Inscrivez-vous ou connectez-vous avec votre compte GitHub

2. **Importer votre projet**

   - Cliquez sur "Add new site" → "Import an existing project"
   - Sélectionnez "Deploy with GitHub"
   - Autorisez Netlify à accéder à vos dépôts GitHub
   - Sélectionnez le dépôt `decor-mali`

3. **Configurer les paramètres de build**

   Les paramètres suivants devraient être détectés automatiquement grâce au fichier `netlify.toml`:
   
   - **Build command**: `pnpm install && pnpm run build`
   - **Publish directory**: `dist/public`
   - **Node version**: 22.13.0

4. **Configurer les variables d'environnement**

   Dans les paramètres du site Netlify, allez dans "Site settings" → "Environment variables" et ajoutez:

   ```
   DATABASE_URL=mysql://user:password@host:port/database
   JWT_SECRET=votre_secret_jwt_securise
   OPENAI_API_KEY=votre_cle_api_openai
   AWS_ACCESS_KEY_ID=votre_access_key_aws
   AWS_SECRET_ACCESS_KEY=votre_secret_key_aws
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=votre-bucket-s3
   NODE_ENV=production
   ```

   **Important**: Utilisez les mêmes valeurs que dans votre fichier `.env` local.

5. **Déployer**

   - Cliquez sur "Deploy site"
   - Netlify va automatiquement builder et déployer votre application
   - Une fois terminé, vous recevrez une URL (par exemple: `https://decor-mali.netlify.app`)

### Option 2: Déploiement via Netlify CLI

1. **Installer Netlify CLI**

```bash
npm install -g netlify-cli
```

2. **Se connecter à Netlify**

```bash
netlify login
```

3. **Initialiser le projet Netlify**

```bash
netlify init
```

4. **Déployer**

```bash
netlify deploy --prod
```

## Configuration de la base de données

### Pour la production

Vous aurez besoin d'une base de données MySQL hébergée. Options recommandées:

- **PlanetScale**: Base de données MySQL serverless (gratuit pour commencer)
- **AWS RDS**: Service de base de données managé d'Amazon
- **DigitalOcean Managed Databases**: Solution simple et abordable

### Migration de la base de données

Une fois votre base de données créée, exécutez les migrations:

```bash
pnpm run db:push
```

## Variables d'environnement requises

Voici la liste complète des variables d'environnement à configurer dans Netlify:

| Variable | Description | Exemple |
|----------|-------------|---------|
| `DATABASE_URL` | URL de connexion MySQL | `mysql://user:pass@host:3306/db` |
| `JWT_SECRET` | Clé secrète pour JWT | `votre_secret_securise_aleatoire` |
| `OPENAI_API_KEY` | Clé API OpenAI (optionnel) | `sk-...` |
| `AWS_ACCESS_KEY_ID` | ID de clé d'accès AWS | `AKIA...` |
| `AWS_SECRET_ACCESS_KEY` | Clé secrète AWS | `...` |
| `AWS_REGION` | Région AWS | `us-east-1` |
| `AWS_S3_BUCKET` | Nom du bucket S3 | `decor-mali-uploads` |
| `NODE_ENV` | Environnement | `production` |

## Développement local

### Installation

```bash
pnpm install
```

### Configuration

Copiez `.env.example` vers `.env` et configurez vos variables d'environnement:

```bash
cp .env.example .env
```

### Lancer en mode développement

```bash
pnpm run dev
```

L'application sera accessible sur `http://localhost:3000`

### Build de production

```bash
pnpm run build
```

### Démarrer en mode production

```bash
pnpm start
```

## Structure du projet

```
decor-mali/
├── client/              # Code frontend (React)
│   ├── public/         # Assets statiques
│   └── src/            # Code source React
├── server/             # Code backend (Express + tRPC)
│   └── _core/         # Fonctionnalités core du serveur
├── shared/             # Code partagé entre client et serveur
├── drizzle/            # Schémas et migrations de base de données
├── netlify/            # Fonctions serverless Netlify
│   └── functions/     # Handlers des fonctions
├── scripts/            # Scripts utilitaires
├── netlify.toml       # Configuration Netlify
├── vite.config.ts     # Configuration Vite
└── package.json       # Dépendances et scripts

```

## Fonctionnalités principales

- Gestion des devis et demandes de services
- Interface d'administration
- Authentification utilisateur
- Upload et gestion de fichiers (AWS S3)
- API tRPC pour la communication client-serveur
- Interface responsive avec Tailwind CSS

## Support et maintenance

Pour toute question ou problème:

1. Vérifiez les logs de déploiement dans Netlify
2. Consultez la documentation de Netlify: https://docs.netlify.com
3. Vérifiez que toutes les variables d'environnement sont correctement configurées

## Licence

MIT

