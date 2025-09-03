"use client";

import { authClient } from "@/domains/auth/lib/auth-client";
import { Button } from "@/shared/components/ui/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";

interface LogoutButtonProps {
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

export function LogoutButton({
	variant = "destructive",
	size = "default",
	className,
	children,
}: LogoutButtonProps) {
	const router = useRouter();

	const handleSignOut = async () => {
		await authClient.signOut();
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
