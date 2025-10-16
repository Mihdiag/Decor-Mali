# Commandes de déploiement rapide

Ce fichier contient toutes les commandes nécessaires pour déployer Decor Mali, regroupées pour un copier-coller facile.

## 1. Déploiement sur GitHub

### Configuration initiale de Git

```bash
# Se placer dans le dossier du projet
cd decor-mali

# Initialiser Git
git init

# Configurer votre identité (remplacez par vos informations)
git config --global user.name "Votre Nom"
git config --global user.email "votre.email@example.com"

# Ajouter tous les fichiers
git add .

# Créer le premier commit
git commit -m "Initial commit - Application Decor Mali"
```

### Lier au dépôt GitHub

**IMPORTANT**: Créez d'abord le dépôt sur GitHub (https://github.com/new), puis exécutez:

```bash
# Remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub
git remote add origin https://github.com/VOTRE_USERNAME/decor-mali.git
git branch -M main
git push -u origin main
```

## 2. Installation locale et test

```bash
# Installer les dépendances
pnpm install

# Copier le fichier d'exemple des variables d'environnement
cp .env.example .env

# Éditer le fichier .env avec vos valeurs
# (utilisez votre éditeur préféré: nano, vim, code, etc.)
nano .env

# Exécuter les migrations de base de données
pnpm run db:push

# Lancer en mode développement
pnpm run dev
```

## 3. Générer un JWT Secret sécurisé

```bash
# Sur Linux/Mac
openssl rand -base64 32

# Sur Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copiez le résultat et utilisez-le comme valeur pour `JWT_SECRET` dans Netlify.

## 4. Tester le build de production localement

```bash
# Builder l'application
pnpm run build

# Démarrer en mode production
pnpm start
```

## 5. Déploiement via Netlify CLI (optionnel)

```bash
# Installer Netlify CLI globalement
npm install -g netlify-cli

# Se connecter à Netlify
netlify login

# Initialiser le projet Netlify
netlify init

# Déployer en production
netlify deploy --prod
```

## 6. Commandes pour les mises à jour futures

```bash
# Après avoir fait des modifications dans votre code

# Vérifier les fichiers modifiés
git status

# Ajouter tous les fichiers modifiés
git add .

# Créer un commit avec un message descriptif
git commit -m "Description de vos modifications"

# Pousser sur GitHub (déclenchera automatiquement le déploiement Netlify)
git push
```

## 7. Commandes de dépannage

### Nettoyer et reconstruire

```bash
# Supprimer node_modules et le cache
rm -rf node_modules .pnpm-store dist

# Réinstaller les dépendances
pnpm install

# Rebuilder
pnpm run build
```

### Vérifier les types TypeScript

```bash
pnpm run check
```

### Formater le code

```bash
pnpm run format
```

### Voir les logs Netlify en temps réel

```bash
netlify watch
```

### Ouvrir le site déployé

```bash
netlify open:site
```

### Ouvrir l'interface d'administration Netlify

```bash
netlify open:admin
```

## 8. Variables d'environnement à configurer dans Netlify

Copiez-collez ces variables dans l'interface Netlify (Site settings → Environment variables):

```
DATABASE_URL=mysql://user:password@host:3306/database
JWT_SECRET=VOTRE_SECRET_GENERE_AVEC_OPENSSL
AWS_ACCESS_KEY_ID=VOTRE_ACCESS_KEY_AWS
AWS_SECRET_ACCESS_KEY=VOTRE_SECRET_KEY_AWS
AWS_REGION=us-east-1
AWS_S3_BUCKET=decor-mali-uploads
NODE_ENV=production
OPENAI_API_KEY=sk-VOTRE_CLE_OPENAI
```

**Remplacez les valeurs** par vos vraies clés et informations.

## 9. Commandes SQL utiles (PlanetScale Console)

```sql
-- Voir toutes les tables
SHOW TABLES;

-- Voir la structure d'une table
DESCRIBE quotes;

-- Compter le nombre d'enregistrements
SELECT COUNT(*) FROM quotes;

-- Voir les derniers devis créés
SELECT * FROM quotes ORDER BY created_at DESC LIMIT 10;
```

## 10. Commandes Git utiles

```bash
# Voir l'historique des commits
git log --oneline

# Annuler le dernier commit (garde les modifications)
git reset --soft HEAD~1

# Voir les différences avant de committer
git diff

# Créer une nouvelle branche
git checkout -b nom-de-la-branche

# Revenir à la branche main
git checkout main

# Fusionner une branche
git merge nom-de-la-branche

# Voir toutes les branches
git branch -a
```

## 11. Commandes de monitoring

```bash
# Voir les logs de build Netlify
netlify logs:function server

# Voir les déploiements récents
netlify deploy:list

# Annuler un déploiement
netlify rollback
```

---

## Aide-mémoire des URLs importantes

- **GitHub**: https://github.com/VOTRE_USERNAME/decor-mali
- **Netlify Dashboard**: https://app.netlify.com
- **Votre site**: https://decor-mali.netlify.app (ou votre URL personnalisée)
- **PlanetScale**: https://app.planetscale.com
- **AWS Console**: https://console.aws.amazon.com

---

## En cas de problème

1. Vérifiez les logs de déploiement dans Netlify
2. Vérifiez que toutes les variables d'environnement sont configurées
3. Testez localement avec `pnpm run dev`
4. Consultez le fichier `GUIDE_DEPLOIEMENT.md` pour plus de détails
5. Vérifiez les issues GitHub du projet si applicable

---

**Bon déploiement! 🚀**

