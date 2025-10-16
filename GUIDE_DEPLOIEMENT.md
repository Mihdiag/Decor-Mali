# Guide de déploiement complet - Decor Mali

Ce guide vous accompagne étape par étape pour déployer votre application Decor Mali sur GitHub et Netlify.

## Table des matières

1. [Préparation](#préparation)
2. [Déploiement sur GitHub](#déploiement-sur-github)
3. [Configuration de la base de données](#configuration-de-la-base-de-données)
4. [Configuration AWS S3](#configuration-aws-s3)
5. [Déploiement sur Netlify](#déploiement-sur-netlify)
6. [Vérification et tests](#vérification-et-tests)
7. [Dépannage](#dépannage)

---

## Préparation

### Comptes nécessaires

Avant de commencer, assurez-vous d'avoir créé les comptes suivants:

- [ ] Compte GitHub (gratuit) - https://github.com
- [ ] Compte Netlify (gratuit) - https://www.netlify.com
- [ ] Compte PlanetScale ou autre hébergeur MySQL (gratuit pour commencer)
- [ ] Compte AWS (pour S3) ou alternative comme Cloudflare R2

### Outils à installer

- [ ] Git - https://git-scm.com/downloads
- [ ] Node.js version 22+ - https://nodejs.org
- [ ] pnpm - `npm install -g pnpm`

---

## Déploiement sur GitHub

### Étape 1: Initialiser Git dans votre projet

Ouvrez un terminal dans le dossier `decor-mali` et exécutez:

```bash
cd decor-mali
git init
```

### Étape 2: Configurer Git (si première utilisation)

```bash
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"
```

### Étape 3: Ajouter tous les fichiers

```bash
git add .
git commit -m "Initial commit - Application Decor Mali"
```

### Étape 4: Créer un dépôt sur GitHub

1. Connectez-vous sur https://github.com
2. Cliquez sur le bouton **"+"** en haut à droite, puis **"New repository"**
3. Remplissez les informations:
   - **Repository name**: `decor-mali`
   - **Description**: "Application de gestion de devis pour services de décoration"
   - **Visibilité**: Choisissez **Private** (recommandé) ou **Public**
   - **NE COCHEZ PAS** "Initialize this repository with a README"
4. Cliquez sur **"Create repository"**

### Étape 5: Lier votre dépôt local à GitHub

GitHub vous affichera des commandes. Copiez et exécutez-les dans votre terminal:

```bash
git remote add origin https://github.com/VOTRE_USERNAME/decor-mali.git
git branch -M main
git push -u origin main
```

Remplacez `VOTRE_USERNAME` par votre nom d'utilisateur GitHub.

**Résultat attendu**: Votre code est maintenant sur GitHub! Vous pouvez le vérifier en rafraîchissant la page de votre dépôt.

---

## Configuration de la base de données

### Option recommandée: PlanetScale (gratuit)

#### Étape 1: Créer un compte PlanetScale

1. Allez sur https://planetscale.com
2. Inscrivez-vous avec votre compte GitHub
3. Créez une nouvelle base de données:
   - **Name**: `decor-mali-db`
   - **Region**: Choisissez la région la plus proche de vos utilisateurs
   - **Plan**: Hobby (gratuit)

#### Étape 2: Obtenir l'URL de connexion

1. Dans votre base de données PlanetScale, allez dans **"Connect"**
2. Sélectionnez **"Connect with: Prisma"** (compatible avec Drizzle)
3. Copiez la valeur de `DATABASE_URL`
4. Elle ressemble à: `mysql://user:password@host.us-east-1.psdb.cloud/decor-mali-db?sslaccept=strict`

#### Étape 3: Exécuter les migrations

Dans votre terminal local:

```bash
# Créer un fichier .env avec votre DATABASE_URL
echo "DATABASE_URL=mysql://..." > .env

# Installer les dépendances
pnpm install

# Exécuter les migrations
pnpm run db:push
```

**Note importante**: Gardez votre `DATABASE_URL` secrète et ne la partagez jamais publiquement.

### Alternatives à PlanetScale

- **Railway**: https://railway.app (simple et gratuit pour commencer)
- **DigitalOcean**: https://www.digitalocean.com/products/managed-databases
- **AWS RDS**: https://aws.amazon.com/rds/

---

## Configuration AWS S3

AWS S3 est utilisé pour stocker les images et fichiers uploadés par les utilisateurs.

### Étape 1: Créer un compte AWS

1. Allez sur https://aws.amazon.com
2. Créez un compte (carte bancaire requise mais niveau gratuit disponible)

### Étape 2: Créer un bucket S3

1. Dans la console AWS, recherchez **"S3"**
2. Cliquez sur **"Create bucket"**
3. Configuration:
   - **Bucket name**: `decor-mali-uploads` (doit être unique globalement)
   - **Region**: `us-east-1` ou votre région préférée
   - **Block Public Access**: Décochez toutes les options (pour permettre l'accès public aux images)
   - Cliquez sur **"Create bucket"**

### Étape 3: Configurer les permissions CORS

1. Sélectionnez votre bucket
2. Allez dans l'onglet **"Permissions"**
3. Descendez jusqu'à **"Cross-origin resource sharing (CORS)"**
4. Cliquez sur **"Edit"** et ajoutez:

```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### Étape 4: Créer des clés d'accès IAM

1. Dans la console AWS, recherchez **"IAM"**
2. Allez dans **"Users"** → **"Create user"**
3. Nom d'utilisateur: `decor-mali-s3-user`
4. Cochez **"Provide user access to the AWS Management Console"** - **NON**
5. Cliquez sur **"Next"**
6. Permissions: Sélectionnez **"Attach policies directly"**
7. Recherchez et cochez **"AmazonS3FullAccess"**
8. Cliquez sur **"Create user"**
9. Sélectionnez l'utilisateur créé
10. Allez dans **"Security credentials"**
11. Cliquez sur **"Create access key"**
12. Sélectionnez **"Application running outside AWS"**
13. **IMPORTANT**: Copiez et sauvegardez:
    - `Access key ID` (commence par AKIA...)
    - `Secret access key` (vous ne pourrez plus le voir après!)

### Alternative à AWS S3: Cloudflare R2

Cloudflare R2 est compatible S3 et moins cher (gratuit jusqu'à 10GB):

1. Créez un compte sur https://cloudflare.com
2. Allez dans **R2** → **Create bucket**
3. Suivez les instructions similaires à S3

---

## Déploiement sur Netlify

### Étape 1: Créer un compte Netlify

1. Allez sur https://www.netlify.com
2. Cliquez sur **"Sign up"**
3. Choisissez **"Sign up with GitHub"** (recommandé)
4. Autorisez Netlify à accéder à votre compte GitHub

### Étape 2: Importer votre projet

1. Sur le tableau de bord Netlify, cliquez sur **"Add new site"**
2. Sélectionnez **"Import an existing project"**
3. Choisissez **"Deploy with GitHub"**
4. Autorisez Netlify à accéder à vos dépôts (si demandé)
5. Sélectionnez le dépôt **`decor-mali`**

### Étape 3: Configurer le build

Netlify devrait détecter automatiquement les paramètres grâce au fichier `netlify.toml`. Vérifiez:

- **Branch to deploy**: `main`
- **Build command**: `pnpm install && pnpm run build`
- **Publish directory**: `dist/public`

Si ce n'est pas le cas, entrez ces valeurs manuellement.

### Étape 4: Configurer les variables d'environnement

**TRÈS IMPORTANT**: Avant de déployer, vous devez configurer les variables d'environnement.

1. Cliquez sur **"Show advanced"** ou **"Add environment variables"**
2. Ajoutez les variables suivantes une par une:

| Variable | Valeur | Où la trouver |
|----------|--------|---------------|
| `DATABASE_URL` | `mysql://user:pass@host:3306/db` | PlanetScale (étape précédente) |
| `JWT_SECRET` | Générez une chaîne aléatoire | Utilisez: `openssl rand -base64 32` |
| `AWS_ACCESS_KEY_ID` | `AKIA...` | AWS IAM (étape précédente) |
| `AWS_SECRET_ACCESS_KEY` | `...` | AWS IAM (étape précédente) |
| `AWS_REGION` | `us-east-1` | Région de votre bucket S3 |
| `AWS_S3_BUCKET` | `decor-mali-uploads` | Nom de votre bucket S3 |
| `NODE_ENV` | `production` | Toujours `production` |
| `OPENAI_API_KEY` | `sk-...` | Optionnel - si vous utilisez OpenAI |

**Pour générer un JWT_SECRET sécurisé**, dans votre terminal:

```bash
openssl rand -base64 32
```

Copiez le résultat et utilisez-le comme valeur pour `JWT_SECRET`.

### Étape 5: Déployer

1. Une fois toutes les variables configurées, cliquez sur **"Deploy decor-mali"**
2. Netlify va:
   - Cloner votre dépôt GitHub
   - Installer les dépendances avec pnpm
   - Builder votre application
   - Déployer le résultat

**Durée estimée**: 3-5 minutes

### Étape 6: Obtenir votre URL

Une fois le déploiement terminé:

1. Netlify vous assignera une URL aléatoire comme: `https://random-name-123456.netlify.app`
2. Vous pouvez la personnaliser dans **"Site settings"** → **"Domain management"** → **"Options"** → **"Edit site name"**
3. Changez-la en: `decor-mali.netlify.app` (si disponible)

---

## Vérification et tests

### Vérifier que le site fonctionne

1. Ouvrez l'URL de votre site: `https://votre-site.netlify.app`
2. Vérifiez que la page d'accueil se charge correctement
3. Testez la navigation entre les pages
4. Testez la création d'un devis (si applicable)

### Vérifier les logs

Si quelque chose ne fonctionne pas:

1. Dans Netlify, allez dans **"Deploys"**
2. Cliquez sur le dernier déploiement
3. Consultez les **"Deploy logs"** pour voir les erreurs de build
4. Consultez les **"Function logs"** pour voir les erreurs runtime

### Vérifier la base de données

1. Dans PlanetScale, allez dans **"Console"**
2. Exécutez une requête pour vérifier les tables:

```sql
SHOW TABLES;
```

Vous devriez voir les tables créées par vos migrations.

---

## Dépannage

### Problème: Le build échoue sur Netlify

**Solution**:

1. Vérifiez les logs de build dans Netlify
2. Assurez-vous que toutes les dépendances sont dans `package.json`
3. Vérifiez que la version de Node.js est correcte (22.13.0)

### Problème: Erreur de connexion à la base de données

**Solution**:

1. Vérifiez que `DATABASE_URL` est correctement configurée dans Netlify
2. Testez la connexion localement avec la même URL
3. Vérifiez que la base de données PlanetScale est active

### Problème: Les images ne s'uploadent pas

**Solution**:

1. Vérifiez que les variables AWS sont correctement configurées
2. Vérifiez les permissions CORS de votre bucket S3
3. Vérifiez que le bucket n'est pas en "Block all public access"

### Problème: Les fonctions serverless ne répondent pas

**Solution**:

1. Vérifiez les logs des fonctions dans Netlify
2. Assurez-vous que le fichier `netlify/functions/server.ts` existe
3. Vérifiez que `serverless-http` est installé:

```bash
pnpm add serverless-http
```

### Problème: Variables d'environnement non reconnues

**Solution**:

1. Redéployez le site après avoir ajouté les variables
2. Dans Netlify, allez dans **"Deploys"** → **"Trigger deploy"** → **"Clear cache and deploy site"**

---

## Mises à jour futures

### Pour déployer des modifications

1. Faites vos modifications localement
2. Testez en local avec `pnpm run dev`
3. Committez et poussez sur GitHub:

```bash
git add .
git commit -m "Description de vos modifications"
git push
```

4. Netlify détectera automatiquement le push et redéploiera votre site

### Désactiver le déploiement automatique

Si vous voulez contrôler quand déployer:

1. Dans Netlify, allez dans **"Site settings"** → **"Build & deploy"**
2. Sous **"Build settings"**, cliquez sur **"Edit settings"**
3. Désactivez **"Auto publishing"**

---

## Ressources utiles

- **Documentation Netlify**: https://docs.netlify.com
- **Documentation PlanetScale**: https://planetscale.com/docs
- **Documentation AWS S3**: https://docs.aws.amazon.com/s3
- **Support Netlify**: https://answers.netlify.com
- **Communauté GitHub**: https://github.community

---

## Checklist finale

Avant de considérer le déploiement comme terminé, vérifiez:

- [ ] Le code est sur GitHub
- [ ] La base de données est créée et les migrations sont exécutées
- [ ] Le bucket S3 est créé et configuré
- [ ] Toutes les variables d'environnement sont configurées dans Netlify
- [ ] Le site est déployé et accessible via l'URL Netlify
- [ ] La page d'accueil se charge correctement
- [ ] Les fonctionnalités principales fonctionnent
- [ ] Les logs ne montrent pas d'erreurs critiques

**Félicitations! Votre application Decor Mali est maintenant en ligne! 🎉**

