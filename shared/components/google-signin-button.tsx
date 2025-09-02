"use client";

import { Button } from "@/shared/components/ui/button";
import { useSignIn } from "@clerk/nextjs";

export function GoogleSignInButton() {
	const { isLoaded, signIn } = useSignIn();

	const handleGoogle = async () => {
		if (!isLoaded) return;
		await signIn?.authenticateWithRedirect({
			strategy: "oauth_google",
			redirectUrl: "/groups",
			redirectUrlComplete: "/groups",
		});
	};

	return (
		<div className="relative group">
			{/* Glow effect */}
			<div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>

			<Button
				onClick={handleGoogle}
				disabled={!isLoaded}
				className="relative w-full h-14 sm:h-16 bg-white text-gray-900 hover:bg-gray-50 font-heading-semibold text-base sm:text-lg rounded-2xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-3 border-2 border-white/20"
			>
				<svg
					className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
					viewBox="0 0 24 24"
				>
					<path
						fill="#4285F4"
						d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
					/>
					<path
						fill="#34A853"
						d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
					/>
					<path
						fill="#FBBC05"
						d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
					/>
					<path
						fill="#EA4335"
						d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
					/>
				</svg>
				<span className="font-medium tracking-wide">Continuer avec Google</span>

				{/* Loading spinner overlay */}
				{!isLoaded && (
					<div className="absolute inset-0 bg-white/80 rounded-2xl flex items-center justify-center">
						<div className="w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
					</div>
				)}
			</Button>
		</div>
	);
}
