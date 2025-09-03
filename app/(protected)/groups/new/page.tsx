import { CreateGroupForm } from "@/domains/group/features/create-group";
import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";

export default function NewGroupPage() {
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
