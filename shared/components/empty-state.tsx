import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
	icon?: LucideIcon;
	emoji?: string;
	title: string;
	description: ReactNode;
	action?: ReactNode;
	className?: string;
}

export function EmptyState({
	icon: Icon,
	emoji,
	title,
	description,
	action,
	className = "",
}: EmptyStateProps) {
	return (
		<div className={`py-12 sm:py-16 relative ${className}`}>
			{/* Background glow - plus subtil pour PWA */}
			<div className="absolute inset-0 bg-gradient-to-r from-primary/3 to-purple-500/3 rounded-3xl blur-xl" />

			<div className="relative text-center">
				{/* Icône ou emoji */}
				{emoji ? (
					<div className="text-6xl sm:text-7xl mb-6 animate-bounce">
						{emoji}
					</div>
				) : Icon ? (
					<div className="w-20 h-20 sm:w-24 sm:h-24 mb-6 mx-auto rounded-2xl bg-gradient-to-r from-primary/10 to-purple-500/10 flex items-center justify-center">
						<Icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary/80" />
					</div>
				) : null}

				<h3 className="text-xl sm:text-2xl font-heading-semibold text-foreground mb-3">
					{title}
				</h3>
				<p className="text-base sm:text-lg font-body text-muted-foreground leading-relaxed max-w-md mx-auto mb-6">
					{description}
				</p>

				{/* Action optionnelle */}
				{action && <div className="mt-6">{action}</div>}
			</div>
		</div>
	);
}
