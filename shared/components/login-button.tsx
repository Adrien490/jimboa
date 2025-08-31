"use client";

import { Button } from "@/shared/components/ui/button";
import { useClerk } from "@clerk/nextjs";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface LoginButtonProps {
	variant?:
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| "link";
	size?: "default" | "sm" | "lg" | "icon";
	className?: string;
	children?: React.ReactNode;
}

export function LoginButton({
	variant = "destructive",
	size = "default",
	className,
	children,
}: LoginButtonProps) {
	const { signOut } = useClerk();
	const router = useRouter();

	const handleSignOut = async () => {
		await signOut();
		router.push("/");
	};

	return (
		<Button
			onClick={handleSignOut}
			variant={variant}
			size={size}
			className={className}
		>
			{children || (
				<>
					<LogOut className="w-4 h-4 mr-2" />
					Se déconnecter
				</>
			)}
		</Button>
	);
}
