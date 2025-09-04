# 🛠️ Choix technologiques

## 🎯 Stack Frontend

### Framework & Runtime

- **Next.js 15.5.2** : Framework React full-stack avec App Router
- **React 19.1.1** : Bibliothèque UI avec les dernières fonctionnalités
- **TypeScript 5** : Typage statique pour la robustesse du code

### Styling & UI

- **Tailwind CSS 4.1.12** : Framework CSS utility-first moderne
- **Shadcn/ui** : Composants UI réutilisables basés sur Radix UI
- **Radix UI** : Primitives accessibles et non-stylées
- **Lucide React** : Icônes modernes et cohérentes
- **Framer Motion 10** : Animations fluides et performantes

### Gestion des données

- **SWR 2.3.6** : Data fetching avec cache intelligent
- **React Hook Form 7** : Gestion des formulaires performante
- **Zod 4** : Validation de schémas TypeScript-first
- **@tanstack/react-form** : Formulaires complexes avec validation

### Notifications & UX

- **Sonner** : Notifications toast élégantes
- **Vaul** : Drawer/modal components
- **use-debounce** : Optimisation des performances input

## 🗄️ Stack Backend

### Base de données & Auth

- **Supabase** : Backend-as-a-Service PostgreSQL
- **PostgreSQL 17** : Base de données relationnelle robuste
- **Supabase Auth** : Authentification avec Row Level Security (RLS)
- **Google OAuth** : Authentification sociale uniquement

### Sécurité & Validation

- **JOSE** : Gestion des JWT sécurisée
- **Row Level Security** : Contrôle d'accès au niveau base de données
- **Middleware Next.js** : Gestion des sessions et redirections

## 🎨 Design System

### Typographie

- **Satoshi** : Police de titres moderne (SemiBold/Bold)
- **Inter** : Police de corps optimisée pour la lisibilité
- **JetBrains Mono** : Police monospace pour le code

### Thématique

- \*\*Mode sombre : Support natif avec variables CSS
- **Couleurs OKLCH** : Espace colorimétrique moderne et perceptuel
- **Design tokens** : Variables CSS cohérentes

## 🏗️ Architecture

### Organisation du code

- **Domain-Driven Design** : Organisation par domaines métier
- **Feature folders** : Colocation des composants liés
- **Barrel exports** : Points d'entrée unifiés par module

### Performance

- **App Router** : Rendu côté serveur optimisé
- **Server Components** : Composants rendus côté serveur par défaut
- **Image optimization** : Next.js Image avec optimisation automatique
- **Bundle optimization** : Tree-shaking et code splitting automatiques

## 📱 PWA & Mobile

### Expérience mobile

- **Safe area insets** : Support des encoches iOS/Android
- **Viewport dynamique** : Adaptation aux barres d'adresse mobiles
- **Touch optimizations** : Interactions tactiles fluides
- **Manifest PWA** : Installation en tant qu'application native

### Accessibilité

- **Radix UI primitives** : Composants accessibles par défaut
- **ARIA patterns** : Sémantique appropriée
- **Keyboard navigation** : Navigation clavier complète
- **Screen reader support** : Compatibilité lecteurs d'écran

## 🔧 Outils de développement

### Linting & Formatting

- **ESLint 9** : Analyse statique du code
- **Next.js ESLint config** : Règles spécifiques au framework
- **TypeScript strict** : Configuration stricte pour la robustesse

### Build & Deployment

- **Vercel** (recommandé) : Plateforme optimisée pour Next.js
- **PNPM** : Gestionnaire de paquets performant
- **Hot reload** : Rechargement à chaud en développement

## 📊 Monitoring & Analytics

### Développement local

- **Supabase Studio** : Interface d'administration locale
- **Inbucket** : Serveur de test d'emails
- **Edge Runtime** : Environnement d'exécution Deno

### Production

- **Supabase Dashboard** : Monitoring base de données
- **Next.js Analytics** : Métriques de performance
- **Error boundaries** : Gestion d'erreurs robuste

## 🔄 Rationale des choix

### Pourquoi Next.js 15 ?

- **App Router stable** : Architecture moderne et performante
- **Server Components** : Réduction du bundle JavaScript client
- **Optimisations intégrées** : Images, fonts, et bundle automatiquement optimisés
- **Écosystème mature** : Excellent support de l'écosystème React

### Pourquoi Supabase ?

- **PostgreSQL managed** : Base de données relationnelle sans gestion d'infrastructure
- **RLS natif** : Sécurité au niveau base de données pour la visibilité conditionnelle
- **Real-time** : Synchronisation temps réel des données
- **Auth intégré** : Authentification avec providers sociaux prêts à l'emploi

### Pourquoi Tailwind CSS 4 ?

- **Nouvelle architecture** : Performance améliorée et syntaxe modernisée
- **Design tokens natifs** : Variables CSS intégrées
- **Bundle size optimisé** : Seulement les classes utilisées
- **Developer experience** : IntelliSense et debugging améliorés
