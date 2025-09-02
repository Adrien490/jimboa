import { cn } from "@/shared/lib/cn";

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
}

export function PageContainer({
	children,
	className,
}: PageContainerProps) {
	return (
		<div className="container max-w-md mx-auto px-4 py-6 sm:px-4 sm:py-6">
			<div className={cn("space-y-6", className)}>{children}</div>
		</div>
	);
}
