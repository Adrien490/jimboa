"use client";

import { SignInPasskeyForm } from "@/domains/auth/features/sign-in-passkey";

export function PasskeyAuthForm() {
	return (
		<div className="w-full max-w-md space-y-4">
			{/* Form Content */}
			<SignInPasskeyForm />

			{/* Info Text */}
			<div className="text-xs text-center text-gray-500 space-y-2">
				<p>
					Utilisez votre empreinte digitale, Face ID ou votre clé de sécurité
					pour vous connecter.
				</p>
				<div className="flex items-center justify-center space-x-2 text-gray-400">
					<svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
						<path
							fillRule="evenodd"
							d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
							clipRule="evenodd"
						/>
					</svg>
					<span>Authentification sécurisée sans mot de passe</span>
				</div>
			</div>
		</div>
	);
}
