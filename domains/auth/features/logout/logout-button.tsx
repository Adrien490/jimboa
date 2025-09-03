"use client";

import { cn } from "@/shared/lib/cn";
import { useTransition } from "react";
import { useLogout } from "./use-logout";

interface LogoutButtonProps {
	className?: string;
	children: React.ReactNode;
}

export function LogoutButton({ className, children }: LogoutButtonProps) {
	const { dispatch } = useLogout();
	const [, startTransition] = useTransition();

	const handleLogout = () => {
		startTransition(() => dispatch());
	};

	return (
		<span onClick={handleLogout} className={cn(className)}>
			{children}
		</span>
	);
}
