import { cn } from "@/shared/lib/cn";

interface PageContainerProps {
	children: React.ReactNode;
	className?: string;
}

export function PageContainer({ children, className }: PageContainerProps) {
	return <div className={cn("space-y-6", className)}>{children}</div>;
}
