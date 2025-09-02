import { LucideIcon } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
	icon: LucideIcon;
	title: string;
	description: ReactNode;
	className?: string;
}

export function EmptyState({
	icon: Icon,
	title,
	description,
	className = "",
}: EmptyStateProps) {
	return (
		<div className={`py-12 sm:py-16 relative ${className}`}>
			{/* Background glow */}
			<div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-purple-500/5 rounded-3xl blur-xl" />

			<div className="relative text-left">
				<div className="w-20 h-20 sm:w-24 sm:h-24 mb-6 rounded-2xl bg-gradient-to-r from-primary/20 to-purple-500/20 flex items-center justify-center">
					<Icon className="w-10 h-10 sm:w-12 sm:h-12 text-primary" />
				</div>
				<h3 className="text-xl sm:text-2xl font-heading-semibold text-foreground mb-3">
					{title}
				</h3>
				<p className="text-base sm:text-lg font-body text-muted-foreground leading-relaxed max-w-md">
					{description}
				</p>
			</div>
		</div>
	);
}
