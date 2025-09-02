"use client";

import { cn } from "@/shared/lib/cn";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "./ui/button";

interface BackButtonProps {
	className?: string;
	variant?: "default" | "ghost" | "outline";
	children?: React.ReactNode;
}

export function BackButton({
	className,
	variant = "ghost",
	children,
}: BackButtonProps) {
	const router = useRouter();

	const handleClick = () => {
		router.back();
	};

	return (
		<Button
			onClick={handleClick}
			variant={variant}
			size="icon"
			className={cn(
				"h-9 w-9 touch-manipulation tap-target rounded-full transition-all duration-200 hover:scale-105 active:scale-95",
				className
			)}
			aria-label={children ? undefined : "Retour"}
		>
			<ArrowLeft className="h-4 w-4 flex-shrink-0" />
			{children && <span className="sr-only">{children}</span>}
		</Button>
	);
}
