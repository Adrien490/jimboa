import { getServerAuth } from "@/lib/server-auth";
import { LogoutButton } from "@/shared/components/logout-button";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { Card, CardContent, CardHeader } from "@/shared/components/ui/card";
import { ArrowLeft, Mail, Settings, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
	const { user, userId } = await getServerAuth();
	if (!userId) redirect("/");

	return (
		<PageContainer>
			<PageHeader
				title="Profil"
				description="Gérez votre compte et vos paramètres"
				action={
					<Link
						href="/groups"
						className="inline-flex items-center justify-center p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
						title="Retour aux groupes"
					>
						<ArrowLeft className="w-5 h-5" />
					</Link>
				}
			/>

			{/* Informations utilisateur */}
			<Card>
				<CardHeader className="text-center pb-4">
					<div className="flex justify-center mb-4">
						<div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
							{user?.image ? (
								<Image
									src={user.image}
									alt={user?.name || "User"}
									className="w-20 h-20 rounded-full object-cover"
									width={80}
									height={80}
								/>
							) : (
								<User className="w-10 h-10 text-primary" />
							)}
						</div>
					</div>
					{user?.name && <h2 className="text-xl font-semibold">{user.name}</h2>}
					{user?.email && (
						<p className="text-muted-foreground text-sm">{user.email}</p>
					)}
				</CardHeader>
			</Card>

			{/* Options du profil */}
			<div className="space-y-3">
				{/* Informations du compte */}
				<Card className="smooth-hover">
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<Mail className="w-5 h-5 text-primary" />
							</div>
							<div className="flex-1">
								<h3 className="font-medium">Email</h3>
								<p className="text-sm text-muted-foreground">
									{user?.email || "Non défini"}
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Paramètres */}
				<Card className="smooth-hover">
					<CardContent className="p-4">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
								<Settings className="w-5 h-5 text-primary" />
							</div>
							<div className="flex-1">
								<h3 className="font-medium">Paramètres</h3>
								<p className="text-sm text-muted-foreground">
									Gérer votre compte
								</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Bouton de déconnexion */}
			<Card className="border-destructive/20">
				<CardContent className="p-4">
					<LogoutButton className="w-full" />
				</CardContent>
			</Card>

			{/* Informations de l'app */}
			<div className="text-center pt-4">
				<p className="text-xs text-muted-foreground">Jimbao v1.0.0</p>
			</div>
		</PageContainer>
	);
}
