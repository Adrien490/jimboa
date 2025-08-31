import { CreateGroupForm } from "@/shared/components/create-group-form";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { auth } from "@clerk/nextjs/server";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function NewGroupPage() {
	const { userId } = await auth();
	if (!userId) redirect("/");

	return (
		<PageContainer>
			<PageHeader
				title="Créer un groupe"
				description="Donnez un nom à votre nouveau groupe"
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
			<CreateGroupForm />
		</PageContainer>
	);
}
