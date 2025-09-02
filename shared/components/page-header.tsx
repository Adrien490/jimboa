import { cn } from "@/shared/lib/cn";
import { BackButton } from "./back-button";

interface PageHeaderProps {
	title: string;
	description?: string;
	action?: React.ReactNode;
	showBackButton?: boolean;
	className?: string;
}

export function PageHeader({
	title,
	description,
	action,
	showBackButton = false,
	className,
}: PageHeaderProps) {
	return (
		<div className={cn("space-y-4 pb-6 sm:pb-8", className)}>
			{/* Mobile and desktop: horizontal layout with back button, content, and action */}
			<div className="flex items-start space-x-3 sm:space-x-4">
				{/* Back button section - on the left */}
				{showBackButton && (
					<div className="flex-shrink-0 pt-1">
						<BackButton />
					</div>
				)}

				{/* Title and description section */}
				<div className="flex-1 space-y-2 sm:space-y-3 min-w-0">
					<h1 className="text-2xl font-heading-bold text-foreground tracking-tight sm:text-3xl lg:text-4xl">
						{title}
					</h1>
					{description && (
						<p className="font-body text-muted-foreground text-sm leading-relaxed sm:text-base lg:text-lg max-w-2xl">
							{description}
						</p>
					)}
				</div>

				{/* Action section - always on the right */}
				{action && <div className="flex-shrink-0 self-start">{action}</div>}
			</div>
		</div>
	);
}
