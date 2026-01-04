# 🍳 Mes Recettes

Application de gestion de recettes personnelles.

## Installation
```bash
npm install
```

## Configuration

1. Copie `.env.example` vers `.env`
2. Remplis `VITE_SUPABASE_ANON_KEY` avec ta clé Supabase (Settings → API → anon public)

## Développement
```bash
npm run dev
```

## Déploiement

Push sur GitHub → Vercel déploie automatiquement.

Variables d'environnement à configurer sur Vercel :
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`