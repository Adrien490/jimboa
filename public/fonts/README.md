# 🔤 Configuration des polices Jimboa (Next.js 15 - 2025)

## 🎯 Stratégie typographique optimisée

- **Satoshi** : Titres uniquement (identité forte)
- **Inter** : Corps de texte (lisibilité maximale)

## 📥 Fichiers requis

Ajoutez seulement ces 2 fichiers Satoshi dans `app/fonts/` :

```
app/fonts/
├── Satoshi-SemiBold.woff2  ← Titres par défaut
└── Satoshi-Bold.woff2      ← Titres importants
```

> **Inter** est géré automatiquement par `next/font/google`

## 🌐 Où télécharger Satoshi

1. **Site officiel** : [satoshi-font.com](https://www.fontshare.com/fonts/satoshi)
2. **Alternative** : [Cufon Fonts](https://www.cufonfonts.com/font/satoshi)

## ⚡ Configuration actuelle

L'app utilise une approche hybride optimisée :

- **Corps de texte** : Inter Regular (400) & Medium (500) - Google Fonts
- **Titres** : Satoshi SemiBold (600) & Bold (700) - Local
- **Fallback** : `system-ui` → `-apple-system` → `sans-serif`

## 🎯 Classes CSS disponibles

### Corps de texte (Inter)

```css
.font-body          /* Inter Regular (400) */
.font-body-medium   /* Inter Medium (500) */
```

### Titres (Satoshi)

```css
.font-heading           /* Satoshi SemiBold (600) par défaut */
.font-heading-semibold  /* Satoshi SemiBold (600) */
.font-heading-bold      /* Satoshi Bold (700) */
```

## 🚀 Optimisations Next.js 15 (2025)

- ✅ **`next/font/local`** : Gestion automatique par Next.js
- ✅ **Préchargement intelligent** : `preload: true`
- ✅ **Auto-hébergement** : Pas de requêtes externes
- ✅ **Optimisation build** : Compression automatique
- ✅ **Fallbacks système** : `system-ui` → `-apple-system`
- ✅ **Font-display: swap** : Évite le FOIT
- ✅ **CSS Variables** : `--font-satoshi` pour Tailwind

## 🔄 Migration effectuée

✅ **Ancien** : `@font-face` manuel + `next/font/google`  
✅ **Nouveau** : `next/font/local` pur (2025)

L'app utilise maintenant la méthode **Next.js 15 recommandée** pour les polices locales.
