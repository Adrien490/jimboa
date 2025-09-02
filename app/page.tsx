import { GoogleSignInButton } from "@/shared/components/google-signin-button";
import { Particles } from "@/shared/components/particles";
import { ArrowRight, HelpCircle, Shield, Users, Zap } from "lucide-react";
import Link from "next/link";

const features = [
	{
		icon: Users,
		title: "Groupes privés",
		description: "Invite tes gars sûrs",
		color: "from-blue-500 to-cyan-500",
	},
	{
		icon: Shield,
		title: "Code d'invitation",
		description: "Ne le partage pas à ta daronne",
		color: "from-purple-500 to-pink-500",
	},
	{
		icon: Zap,
		title: "Connexion rapide",
		description: "Ultra précoce, même",
		color: "from-orange-500 to-red-500",
	},
];

export default function Home() {
	return (
		<div className="h-[100dvh] relative overflow-hidden">
			<Particles />

			{/* Hero Section */}
			<div className="relative z-10 flex flex-col h-full max-w-md mx-auto px-4">
				{/* Header */}
				<div className="flex-1 flex flex-col justify-center items-center text-center py-8 sm:py-12">
					{/* Logo/Brand */}
					<div className="mb-8 sm:mb-12">
						<div className="relative">
							<h1 className="text-5xl sm:text-6xl lg:text-7xl font-heading-bold text-foreground mb-4 tracking-tight">
								Jimboa
							</h1>
							<div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-purple-500/20 rounded-full blur-xl opacity-50 animate-pulse" />
						</div>
						<p className="text-lg sm:text-xl font-body text-muted-foreground max-w-md mx-auto leading-relaxed">
							Bon, tu vas traîner ici longtemps ?{" "}
							<span className="text-primary font-medium">
								Connecte-toi, bordel !
							</span>
						</p>
					</div>

					{/* Features Grid */}
					<div className="w-full max-w-md space-y-3 sm:space-y-4 mb-8 sm:mb-12">
						{features.map((feature, index) => {
							const Icon = feature.icon;
							return (
								<div key={index} className="group relative smooth-hover">
									<div
										className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl blur-sm"
										style={{
											backgroundImage: `linear-gradient(to right, ${feature.color.split(" ")[1]}, ${feature.color.split(" ")[3]})`,
										}}
									/>

									<div className="relative flex items-center space-x-4 p-4 sm:p-5 rounded-2xl border bg-card/50 backdrop-blur-sm hover:bg-card/80 transition-all duration-300">
										<div
											className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-gradient-to-r ${feature.color} flex items-center justify-center shadow-lg`}
										>
											<Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
										</div>
										<div className="flex-1 text-left">
											<h3 className="font-heading-semibold text-card-foreground text-base sm:text-lg mb-1">
												{feature.title}
											</h3>
											<p className="text-sm sm:text-base font-body text-muted-foreground">
												{feature.description}
											</p>
										</div>
										<ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									</div>
								</div>
							);
						})}
					</div>

					{/* CTA Section */}
					<div className="w-full max-w-md space-y-4 sm:space-y-6">
						<GoogleSignInButton />

						{/* FAQ Button */}
						<div className="flex justify-center">
							<Link
								href="/faq"
								className="inline-flex items-center space-x-2 px-4 py-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors duration-200 rounded-lg hover:bg-card/50 backdrop-blur-sm"
							>
								<HelpCircle className="w-4 h-4" />
								<span>Des questions ? Consulte la FAQ</span>
							</Link>
						</div>

						<p className="text-xs sm:text-sm text-center text-muted-foreground px-4">
							En continuant, vous acceptez nos{" "}
							<span className="underline hover:text-foreground cursor-pointer transition-colors duration-200">
								conditions d&apos;utilisation
							</span>
						</p>
					</div>
				</div>

				{/* Bottom Safe Area Spacer for Mobile */}
				<div className="h-safe-bottom sm:h-0" />
			</div>

			{/* Floating Elements for Visual Interest - Using CSS animations instead */}
			<div className="absolute top-1/4 left-4 w-2 h-2 bg-primary rounded-full opacity-60 animate-bounce" />
			<div className="absolute top-1/3 right-8 w-1 h-1 bg-purple-500 rounded-full opacity-40 animate-pulse" />
		</div>
	);
}
