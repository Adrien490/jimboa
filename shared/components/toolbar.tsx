import { cn } from "@/shared/lib/cn";
import { ReactNode } from "react";

interface ToolbarProps {
	children: ReactNode;
	className?: string;
}

export function Toolbar({ children, className }: ToolbarProps) {
	return (
		<div className="fixed bottom-0 left-0 right-0 z-50 p-4 pb-safe">
			{/* Glow effect background */}
			<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none" />

			<div
				className={cn(
					// Container principal avec design moderne
					"relative mx-auto max-w-sm",
					// Style de la toolbar avec effets visuels
					"bg-card/80 backdrop-blur-xl border border-border/50",
					"rounded-2xl shadow-2xl",
					// Padding et hauteur optimisés
					"px-3 py-3 h-14",
					// Flexbox pour le contenu avec gap
					"flex items-center gap-3",
					// Effets de glow subtils
					"before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/5 before:via-purple-500/5 before:to-pink-500/5 before:rounded-2xl before:blur-xl before:opacity-50",
					// Interactions et transitions
					"hover:shadow-3xl hover:border-border/70",
					"transition-all duration-300 ease-out",
					// Safe area pour mobile
					"mb-safe",
					className
				)}
			>
				{/* Contenu de la toolbar */}
				{children}

				{/* Floating elements décoratifs */}
				<div className="absolute -top-1 -right-1 w-1 h-1 bg-primary rounded-full opacity-40 animate-pulse" />
				<div
					className="absolute -bottom-1 -left-1 w-0.5 h-0.5 bg-purple-500 rounded-full opacity-30 animate-bounce"
					style={{ animationDelay: "1s" }}
				/>
			</div>
		</div>
	);
}
