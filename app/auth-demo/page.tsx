import {
	GoogleOneTap,
	GoogleSignInButton,
} from "@/domains/auth/features/sign-in-social";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function AuthDemoPage() {
	const supabase = await createClient();

	// Vérifier si l'utilisateur est déjà connecté
	const {
		data: { user },
	} = await supabase.auth.getUser();

	if (user) {
		redirect("/groups");
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4">
			<div className="max-w-4xl mx-auto">
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						Démonstration d'authentification Google avec Supabase
					</h1>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Cette page démontre les différentes méthodes d'authentification
						Google disponibles avec Supabase : OAuth classique et Google One
						Tap.
					</p>
				</div>

				<div className="grid md:grid-cols-2 gap-8">
					{/* OAuth classique */}
					<div className="bg-white rounded-lg shadow-lg p-8">
						<div className="text-center mb-6">
							<h2 className="text-2xl font-semibold text-gray-900 mb-2">
								OAuth Classique
							</h2>
							<p className="text-gray-600">
								Méthode traditionnelle avec redirection vers Google
							</p>
						</div>

						<div className="space-y-4">
							<GoogleSignInButton redirectTo="/groups" />

							<div className="text-sm text-gray-500 space-y-2">
								<h3 className="font-medium text-gray-700">Fonctionnalités :</h3>
								<ul className="list-disc list-inside space-y-1">
									<li>Redirection vers Google</li>
									<li>Support des refresh tokens</li>
									<li>Compatible avec tous les navigateurs</li>
									<li>Gestion des erreurs robuste</li>
								</ul>
							</div>
						</div>
					</div>

					{/* Google One Tap */}
					<div className="bg-white rounded-lg shadow-lg p-8">
						<div className="text-center mb-6">
							<h2 className="text-2xl font-semibold text-gray-900 mb-2">
								Google One Tap
							</h2>
							<p className="text-gray-600">
								Expérience moderne sans redirection
							</p>
						</div>

						<div className="space-y-4">
							<GoogleOneTap redirectTo="/groups" autoPrompt={false} />

							<div className="text-sm text-gray-500 space-y-2">
								<h3 className="font-medium text-gray-700">Fonctionnalités :</h3>
								<ul className="list-disc list-inside space-y-1">
									<li>Pas de redirection</li>
									<li>Expérience utilisateur fluide</li>
									<li>Support FedCM (Chrome)</li>
									<li>Sécurité avec nonce</li>
								</ul>
							</div>
						</div>
					</div>
				</div>

				{/* Configuration requise */}
				<div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
					<h3 className="text-lg font-semibold text-blue-900 mb-4">
						Configuration requise
					</h3>
					<div className="grid md:grid-cols-2 gap-6">
						<div>
							<h4 className="font-medium text-blue-800 mb-2">
								Variables d'environnement
							</h4>
							<ul className="text-sm text-blue-700 space-y-1">
								<li>• NEXT_PUBLIC_SUPABASE_URL</li>
								<li>• NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</li>
								<li>• NEXT_PUBLIC_GOOGLE_CLIENT_ID</li>
							</ul>
						</div>
						<div>
							<h4 className="font-medium text-blue-800 mb-2">
								Configuration Supabase
							</h4>
							<ul className="text-sm text-blue-700 space-y-1">
								<li>• Google OAuth activé</li>
								<li>• Client ID et secret configurés</li>
								<li>• URLs de callback autorisées</li>
							</ul>
						</div>
					</div>
				</div>

				{/* Informations techniques */}
				<div className="mt-8 bg-gray-100 rounded-lg p-6">
					<h3 className="text-lg font-semibold text-gray-900 mb-4">
						Informations techniques
					</h3>
					<div className="grid md:grid-cols-3 gap-6 text-sm">
						<div>
							<h4 className="font-medium text-gray-800 mb-2">OAuth Flow</h4>
							<p className="text-gray-600">
								Utilise le flow PKCE avec échange de code sécurisé via
								/auth/callback
							</p>
						</div>
						<div>
							<h4 className="font-medium text-gray-800 mb-2">One Tap</h4>
							<p className="text-gray-600">
								Utilise les ID tokens Google avec validation nonce côté Supabase
							</p>
						</div>
						<div>
							<h4 className="font-medium text-gray-800 mb-2">Sécurité</h4>
							<p className="text-gray-600">
								RLS activé, sessions sécurisées avec cookies httpOnly
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}


