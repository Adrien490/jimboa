import { CreateGroupForm } from "@/domains/group/features/create-group/create-group-form";
import { getServerAuth } from "@/lib/server-auth";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { redirect } from "next/navigation";

export default async function NewGroupPage() {
	const { userId } = await getServerAuth();
	if (!userId) redirect("/");

	return (
		<>
			<PageHeader
				showBackButton
				title="Créer un groupe"
				description="Donnez un nom à votre nouveau groupe"
			/>

			<PageContainer className="pt-20 sm:pt-24 pb-8">
				<CreateGroupForm />
			</PageContainer>
		</>
	);
}
