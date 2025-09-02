import { PageContainer } from "@/shared/components/page-container";
import { PageHeader } from "@/shared/components/page-header";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/shared/components/ui/accordion";
import { faqData } from "@/shared/constants/faq-data";
import { Home } from "lucide-react";
import Link from "next/link";

export default function FAQPage() {
	return (
		<>
			<PageHeader
				title="FAQ"
				description="Toutes les réponses à tes questions"
				showBackButton={true}
				action={
					<Link
						href="/"
						className="flex items-center justify-center w-10 h-10 rounded-xl bg-card border border-border hover:bg-card/80"
						title="Retour à l'accueil"
					>
						<Home className="w-4 h-4 text-muted-foreground" />
					</Link>
				}
			/>

			<PageContainer className="pt-20 pb-6">
				{/* FAQ Accordion - Mobile First */}
				<Accordion type="single" collapsible className="space-y-3">
					{faqData.map((item) => (
						<AccordionItem
							key={item.id}
							value={item.id}
							className="bg-card rounded-xl border border-border/50 overflow-hidden"
						>
							<AccordionTrigger className="px-4 py-4 text-left font-heading-semibold text-card-foreground hover:bg-card/80 hover:no-underline">
								<span className="text-sm leading-tight pr-2">
									{item.question}
								</span>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<div className="text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
									{item.answer}
								</div>
							</AccordionContent>
						</AccordionItem>
					))}
				</Accordion>

				{/* Contact CTA - Simplified */}
				<div className="mt-6 p-4 bg-primary/5 rounded-xl text-center border border-primary/10">
					<h3 className="font-heading-semibold text-foreground mb-2 text-base">
						Besoin d&apos;aide ?
					</h3>
					<p className="text-sm text-muted-foreground mb-3">
						Contacte-nous directement
					</p>
					<a
						href="mailto:contact@jimboa.com"
						className="inline-block px-5 py-2.5 bg-primary text-primary-foreground font-heading-semibold rounded-lg text-sm"
					>
						Nous écrire
					</a>
				</div>
			</PageContainer>
		</>
	);
}
