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
		<div
			className={cn(
				"fixed top-0 left-0 right-0 z-40 bg-background/80 backdrop-blur-md border-b border-border/30",
				className
			)}
		>
			<div className="container max-w-2xl mx-auto px-4 py-4 sm:px-6 sm:py-6">
				{/* Mobile and desktop: horizontal layout with back button, content, and action */}
				<div className="flex items-start space-x-3 sm:space-x-4">
					{/* Back button section - on the left */}
					{showBackButton && (
						<div className="flex-shrink-0 pt-1">
							<BackButton />
						</div>
					)}

					{/* Title and description section */}
					<div className="flex-1 space-y-1 sm:space-y-2 min-w-0">
						<h1 className="text-xl font-heading-bold text-foreground tracking-tight sm:text-2xl lg:text-3xl">
							{title}
						</h1>
						{description && (
							<p className="font-body text-muted-foreground text-xs leading-relaxed sm:text-sm max-w-2xl">
								{description}
							</p>
						)}
					</div>

					{/* Action section - always on the right */}
					{action && <div className="flex-shrink-0 self-start">{action}</div>}
				</div>
			</div>
		</div>
	);
}
