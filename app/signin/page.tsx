import { GoogleOneTap } from "@/domains/auth/features/sign-in-social/google-one-tap";
import { GoogleSignInButton } from "@/domains/auth/features/sign-in-social/google-signin-button";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function SignInPage() {
	const supabase = await createClient();

	// Vérifier si l'utilisateur est déjà connecté
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect("/groups");
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
			<div className="max-w-md w-full space-y-8 p-8">
				<div className="text-center">
					<h2 className="mt-6 text-3xl font-extrabold text-gray-900">
						Connexion à Jimbao
					</h2>
					<p className="mt-2 text-sm text-gray-600">
						Connectez-vous avec votre compte Google
					</p>
				</div>

				<div className="space-y-6">
					{/* Google One Tap - S'affiche automatiquement */}
					<GoogleOneTap redirectTo="/groups" autoPrompt={true} />

					{/* Séparateur */}
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gray-300" />
						</div>
						<div className="relative flex justify-center text-sm">
							<span className="px-2 bg-gray-50 text-gray-500">
								ou continuez avec
							</span>
						</div>
					</div>

					{/* Bouton Google OAuth classique */}
					<GoogleSignInButton redirectTo="/groups" />

					{/* Informations supplémentaires */}
					<div className="text-center">
						<p className="text-xs text-gray-500">
							En vous connectant, vous acceptez nos{" "}
							<a href="/terms" className="text-blue-600 hover:text-blue-500">
								conditions d'utilisation
							</a>{" "}
							et notre{" "}
							<a href="/privacy" className="text-blue-600 hover:text-blue-500">
								politique de confidentialité
							</a>
							.
						</p>
					</div>
				</div>

				{/* Debug info en développement */}
				{process.env.NODE_ENV === "development" && (
					<div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
						<h3 className="text-sm font-medium text-yellow-800 mb-2">
							Mode développement
						</h3>
						<ul className="text-xs text-yellow-700 space-y-1">
							<li>• Google One Tap s'affiche automatiquement</li>
							<li>• Le bouton OAuth est disponible en fallback</li>
							<li>• Redirection vers /groups après connexion</li>
							<li>
								• Variables d'environnement requises :
								NEXT_PUBLIC_GOOGLE_CLIENT_ID
							</li>
						</ul>
					</div>
				)}
			</div>
		</div>
	);
}


