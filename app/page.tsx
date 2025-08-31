import { GoogleSignInButton } from "@/shared/components/google-signin-button";
import { PageContainer } from "@/shared/components/page-container";
import { Particles } from "@/shared/components/particles";

export default function Home() {
	return (
		<PageContainer className="min-h-[calc(100vh-6rem)] flex items-center justify-center relative">
			<Particles />
			<div className="w-full max-w-md space-y-8 relative z-10">
				{/* Header */}
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-heading font-bold text-foreground">
						Jimbao
					</h1>
					<p className="text-muted-foreground">
						Bon, tu vas trainer ici longtemps ? Connecte-toi, bordel !
					</p>
				</div>

				{/* Features */}
				<div className="space-y-4">
					<div className="flex items-center space-x-3 p-4 rounded-lg border bg-card">
						<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
							<svg
								className="w-4 h-4 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
								/>
							</svg>
						</div>
						<div>
							<h3 className="font-medium text-card-foreground">
								Groupes privés
							</h3>
							<p className="text-sm text-muted-foreground">
								Invite tes gars sûrs
							</p>
						</div>
					</div>

					<div className="flex items-center space-x-3 p-4 rounded-lg border bg-card">
						<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
							<svg
								className="w-4 h-4 text-primary"
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
						</div>
						<div>
							<h3 className="font-medium text-card-foreground">
								Code d&apos;invitation
							</h3>
							<p className="text-sm text-muted-foreground">
								Ne le partage pas à ta daronne
							</p>
						</div>
					</div>

					<div className="flex items-center space-x-3 p-4 rounded-lg border bg-card">
						<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
							<svg
								className="w-4 h-4 text-primary"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
						</div>
						<div>
							<h3 className="font-medium text-card-foreground">
								Connexion rapide
							</h3>
							<p className="text-sm text-muted-foreground">
								Ultra précoce, même
							</p>
						</div>
					</div>
				</div>

				{/* CTA */}
				<div className="space-y-4">
					<GoogleSignInButton />
					<p className="text-xs text-center text-muted-foreground">
						En continuant, vous acceptez nos{" "}
						<span className="underline hover:text-foreground cursor-pointer">
							conditions d&apos;utilisation
						</span>
					</p>
				</div>
			</div>
		</PageContainer>
	);
}
