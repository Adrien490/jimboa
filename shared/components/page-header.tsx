import { cn } from "@/shared/lib/cn";

interface PageHeaderProps {
	title: string;
	description?: string;
	action?: React.ReactNode;
	className?: string;
}

export function PageHeader({
	title,
	description,
	action,
	className,
}: PageHeaderProps) {
	return (
		<div className={cn("space-y-4 pb-6", className)}>
			<div className="flex items-start space-x-3">
				{action && <div className="flex-shrink-0 pt-1">{action}</div>}
				<div className="flex-1 space-y-1">
					<h1 className="text-2xl font-heading font-bold text-foreground sm:text-3xl">
						{title}
					</h1>
					{description && (
						<p className="text-muted-foreground text-sm sm:text-base">
							{description}
						</p>
					)}
				</div>
			</div>
		</div>
	);
}
