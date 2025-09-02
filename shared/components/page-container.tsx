import { cn } from "@/shared/lib/cn";

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
	return (
		<div className="container max-w-md mx-auto px-4 py-6 sm:px-4 sm:py-6">
			<div
				className={cn(
					"min-h-[100dvh] relative bg-gradient-to-br from-background via-background to-background/95 pt-20 sm:pt-24 pb-32 sm:pb-36 space-y-0 flex flex-col",
					className
				)}
			>
				{children}
			</div>
		</div>
	);
}
