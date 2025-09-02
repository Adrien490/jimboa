import { cn } from "@/shared/lib/cn";

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
	withContainer?: boolean;
}

export function PageContainer({ 
	children, 
	className, 
	withContainer = false 
}: PageContainerProps) {
	if (withContainer) {
		return (
			<div className="container max-w-2xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
				<div className={cn("space-y-6", className)}>{children}</div>
			</div>
		);
	}
	
	return <div className={cn("space-y-6", className)}>{children}</div>;
}
