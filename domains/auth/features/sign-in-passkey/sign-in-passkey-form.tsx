"use client";

import { Button } from "@/shared/components/ui/button";
import { useSearchParams } from "next/navigation";
import { useSignInPasskey } from "./use-sign-in-passkey";

export function SignInPasskeyForm() {
	const searchParams = useSearchParams();
	const callbackURL = searchParams.get("callbackURL") || "/groups";
	const { signInWithPasskey, isPending, error } = useSignInPasskey();

	const handlePasskeySignIn = async () => {
		await signInWithPasskey(callbackURL);
	};

	return (
		<div className="space-y-4">
			<div className="relative group">
				{/* Glow effect */}
				<div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-300"></div>

				<div className="relative p-1">
					{/* Direct Passkey Button */}
					<Button
						type="button"
						onClick={handlePasskeySignIn}
						disabled={isPending}
						className="relative w-full h-14 sm:h-16 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-heading-semibold text-base sm:text-lg rounded-xl shadow-2xl transition-all duration-300 hover:shadow-3xl hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center space-x-3"
					>
						<svg
							className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
							/>
						</svg>
						<span className="font-medium tracking-wide">
							{isPending ? "Connexion..." : "Se connecter avec Passkey"}
						</span>

						{/* Loading spinner overlay */}
						{isPending && (
							<div className="absolute inset-0 bg-gradient-to-r from-indigo-600/80 to-purple-600/80 rounded-xl flex items-center justify-center">
								<div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
							</div>
						)}
					</Button>
				</div>
			</div>

			{error && (
				<div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg">
					{error}
				</div>
			)}
		</div>
	);
}
