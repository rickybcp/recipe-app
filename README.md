# 🍳 Mes Recettes

Application mobile-first de gestion de recettes pour les familles. Partagez vos recettes avec votre foyer et planifiez vos repas facilement.

## ✨ Fonctionnalités

- **Gestion des recettes** - Ajoutez, modifiez et supprimez vos recettes
- **Filtres avancés** - Filtrez par saison, tags, cuisine, féculent, difficulté
- **Calendrier de repas** - Planifiez vos repas avec vue semaine/mois
- **Partage en foyer** - Invitez les membres de votre famille par email
- **Tags personnalisables** - Créez vos propres tags (végétarien, rapide, etc.)
- **Féculents personnalisables** - Gérez votre liste de féculents
- **Interface bilingue** - Français et anglais

## 🛠️ Stack technique

- **Frontend** : React 18 + Vite
- **Backend** : Supabase (PostgreSQL, Auth, RLS)
- **Styling** : Inline styles (mobile-first)
- **Date** : date-fns
- **Déploiement** : Vercel

## 🚀 Installation locale

### Prérequis

- Node.js 18+
- Un compte [Supabase](https://supabase.com)

### Étapes

1. **Cloner le repo**
```bash
   git clone https://github.com/VOTRE_USERNAME/recipe-app.git
   cd recipe-app
```

2. **Installer les dépendances**
```bash
   npm install
```

3. **Configurer Supabase**
   - Créer un nouveau projet sur [supabase.com](https://supabase.com)
   - Aller dans **SQL Editor**
   - Exécuter le contenu de `supabase-schema.sql`

4. **Configurer les variables d'environnement**
```bash
   cp .env.example .env
```
   Puis remplir avec vos valeurs Supabase

5. **Lancer le serveur de développement**
```bash
   npm run dev
```

## 📄 Licence

Projet privé - Usage personnel uniquement