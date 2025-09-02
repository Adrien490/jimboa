# Composant SearchForm

Ce composant fournit un formulaire de recherche avancé avec debouncing, gestion des paramètres URL, et interface utilisateur élégante avec animations.

## Configuration

### Fonctionnalités

Le composant offre :

- Recherche en temps réel avec debouncing (300ms)
- Synchronisation automatique avec les paramètres URL
- Bouton de suppression animé
- Indicateur de chargement
- Gestion des paramètres à effacer lors de la recherche

## Utilisation

### Formulaire de recherche basique

```tsx
import { SearchForm } from "@/shared/components/search-form";

function MyPage() {
	return (
		<div>
			<SearchForm paramName="search" placeholder="Rechercher des éléments..." />
			{/* Résultats de recherche */}
		</div>
	);
}
```

### Avec paramètres à effacer

```tsx
import { SearchForm } from "@/shared/components/search-form";

function MyPage() {
	return (
		<SearchForm
			paramName="search"
			placeholder="Rechercher des utilisateurs..."
			paramsToClear={["page", "filter"]}
		/>
	);
}
```

### Avec styles personnalisés

```tsx
import { SearchForm } from "@/shared/components/search-form";

function MyPage() {
	return (
		<SearchForm
			paramName="q"
			placeholder="Recherche globale..."
			className="max-w-md mx-auto"
		/>
	);
}
```

### Dans une interface de filtrage

```tsx
import { SearchForm } from "@/shared/components/search-form";

function ProductList() {
	return (
		<div className="space-y-4">
			<SearchForm
				paramName="search"
				placeholder="Rechercher des produits..."
				paramsToClear={["category", "page"]}
			/>
			{/* Liste des produits filtrés */}
		</div>
	);
}
```

### Propriétés

| Propriété       | Type                   | Description                                            |
| --------------- | ---------------------- | ------------------------------------------------------ |
| `paramName`     | `string`               | Nom du paramètre URL pour la recherche (requis)        |
| `placeholder`   | `string` (optionnel)   | Texte d'aide dans le champ de recherche                |
| `className`     | `string` (optionnel)   | Classes CSS personnalisées                             |
| `paramsToClear` | `string[]` (optionnel) | Paramètres URL à effacer lors d'une nouvelle recherche |

### Caractéristiques

- **Debouncing** : Évite les requêtes trop fréquentes (délai de 300ms)
- **Synchronisation URL** : Met à jour automatiquement les paramètres de recherche dans l'URL
- **Interface animée** : Transitions fluides pour les icônes et le bouton de suppression
- **Gestion d'état** : Indicateur de chargement pendant les transitions
- **Accessible** : Labels appropriés et support clavier
- **Responsive** : Design adaptatif avec input arrondi
- **Nettoyage intelligent** : Peut effacer d'autres paramètres lors d'une nouvelle recherche
