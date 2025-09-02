import { cn } from "@/shared/lib/cn";

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
	withContainer?: boolean;
}

export function PageContainer({
	children,
	className,
	withContainer = false,
}: PageContainerProps) {
	if (withContainer) {
		return (
			<div className="container max-w-sm mx-auto px-4 py-6 sm:px-4 sm:py-6">
				<div className={cn("space-y-6", className)}>{children}</div>
			</div>
		);
	}

	return <div className={cn("space-y-6", className)}>{children}</div>;
}
