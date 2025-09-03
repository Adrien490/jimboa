import { JoinGroupForm } from "@/domains/group/features/join-group/join-group-form";
import { getServerAuth } from "@/lib/server-auth";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import { redirect } from "next/navigation";

export default async function JoinGroupPage() {
	const { userId } = await getServerAuth();
	if (!userId) redirect("/");

	return (
		<>
			<PageHeader
				showBackButton
				title="Rejoindre un groupe"
				description="Entrez le code d'invitation pour rejoindre un groupe existant"
			/>

			<PageContainer className="pt-20 sm:pt-24 pb-8">
				<JoinGroupForm />
			</PageContainer>
		</>
	);
}
