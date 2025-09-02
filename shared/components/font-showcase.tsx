/**
 * Composant de démonstration pour les polices Satoshi
 * Utilisé pour tester et visualiser les différentes graisses
 */

export function FontShowcase() {
	return (
		<div className="space-y-6 p-6 bg-card rounded-lg border">
			<div className="space-y-2">
				<h2 className="font-heading-bold text-xl text-card-foreground">
					🔤 Démonstration Typographique
				</h2>
				<p className="font-body text-sm text-muted-foreground">
					Satoshi (titres) + Inter (texte) - Configuration Next.js 15
				</p>
			</div>

			<div className="space-y-4">
				{/* Titres */}
				<div className="space-y-2">
					<h3 className="font-heading-semibold text-lg text-card-foreground">
						📝 Titres
					</h3>
					<div className="space-y-1 pl-4 border-l-2 border-primary/20">
						<h1 className="font-heading-bold text-2xl text-card-foreground text-balance">
							Titre principal - Satoshi Bold (700) ✨
						</h1>
						<h2 className="font-heading-semibold text-xl text-card-foreground text-balance">
							Sous-titre - Satoshi SemiBold (600) ✨
						</h2>
						<h3 className="font-heading text-lg text-card-foreground">
							Titre section - Satoshi SemiBold par défaut (600) ✨
						</h3>
					</div>
				</div>

				{/* Corps de texte */}
				<div className="space-y-2">
					<h3 className="font-heading-semibold text-lg text-card-foreground">
						📄 Corps de texte
					</h3>
					<div className="space-y-2 pl-4 border-l-2 border-accent/20">
						<p className="font-body text-card-foreground text-balance">
							Texte principal avec Inter Regular (400) 🎯. Lorem ipsum dolor sit
							amet, consectetur adipiscing elit. Sed do eiusmod tempor
							incididunt ut labore.
						</p>
						<p className="font-body-medium text-card-foreground text-balance">
							Texte important avec Inter Medium (500) 🎯. Ut enim ad minim
							veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip.
						</p>
						<p className="font-body text-sm text-muted-foreground">
							Texte secondaire plus petit en Inter Regular (400) 🎯.
						</p>
					</div>
				</div>

				{/* Fallbacks */}
				<div className="space-y-2">
					<h3 className="font-heading-semibold text-lg text-card-foreground">
						🔄 Fallbacks système
					</h3>
					<div className="text-sm font-body text-muted-foreground space-y-1">
						<p>
							<strong>Titres :</strong> Satoshi → system-ui → -apple-system →
							sans-serif
						</p>
						<p>
							<strong>Texte :</strong> Inter (Google Fonts) → system-ui →
							sans-serif
						</p>
						<p className="text-xs text-muted-foreground mt-2">
							✅ Inter est déjà actif | ⏳ Ajoutez Satoshi pour les titres
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
