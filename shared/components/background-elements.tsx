interface BackgroundElementsProps {
	className?: string;
}

export function BackgroundElements({ className }: BackgroundElementsProps) {
	return (
		<div className={className}>
			{/* Background decorative elements */}
			<div className="absolute top-1/4 left-4 w-2 h-2 bg-primary rounded-full opacity-60" />
			<div className="absolute top-1/3 right-8 w-1 h-1 bg-primary/70 rounded-full opacity-40" />
			<div className="absolute bottom-1/4 right-4 w-1.5 h-1.5 bg-primary/60 rounded-full opacity-50" />
		</div>
	);
}
