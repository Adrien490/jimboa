import { CreateGroupForm } from "@/shared/components/create-group-form";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function NewGroupPage() {
	const { userId } = await auth();
	if (!userId) redirect("/");

	return (
		<PageContainer>
			<PageHeader
				showBackButton
				title="Créer un groupe"
				description="Donnez un nom à votre nouveau groupe"
			/>
			<CreateGroupForm />
		</PageContainer>
	);
}
