"use client";

import { api } from "@/convex/_generated/api";
import { Button } from "@/shared/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { joinGroupSchema } from "./join-group-schema";

type JoinGroupFormValues = z.infer<typeof joinGroupSchema>;

export function JoinGroupForm() {
	const joinGroup = useMutation(api.groups.joinWithCode);
	const router = useRouter();

	const form = useForm<JoinGroupFormValues>({
		resolver: zodResolver(joinGroupSchema),
		defaultValues: {
			code: "",
		},
		mode: "onChange",
	});

	const { isSubmitting, isValid } = form.formState;

	const handleSubmit = async (values: JoinGroupFormValues) => {
		try {
			await joinGroup({ code: values.code });

			toast.success("Groupe rejoint !", {
				description: "Bienvenue dans le groupe 🎉",
				duration: 3000,
			});

			form.reset();
			router.push("/groups");
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message === "Invalid invite code"
						? "Code invalide"
						: error.message === "Not authenticated"
							? "Connexion requise"
							: "Erreur inconnue"
					: "Erreur inconnue";

			toast.error("Impossible de rejoindre", {
				description: errorMessage,
				duration: 4000,
			});

			console.error("Erreur rejoindre groupe:", error);
		}
	};

	return (
		<div className="space-y-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					<FormField
						control={form.control}
						name="code"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-base font-medium">
									Code d&apos;invitation
								</FormLabel>
								<FormControl>
									<Input
										placeholder="Ex: ABC123, XYZ789..."
										className="text-base text-center font-mono tracking-wider"
										disabled={isSubmitting}
										maxLength={10}
										{...field}
										onChange={(e) => {
											// Convertir automatiquement en majuscules
											const value = e.target.value.toUpperCase();
											field.onChange(value);
										}}
									/>
								</FormControl>
								<FormMessage />
								{field.value && (
									<p className="text-xs text-muted-foreground text-center">
										{field.value.length}/10 caractères
									</p>
								)}
							</FormItem>
						)}
					/>

					{/* Info sur le processus */}
					<div className="rounded-lg border bg-muted/50 p-4 space-y-2">
						<h4 className="text-sm font-medium text-foreground">
							Comment ça marche :
						</h4>
						<ul className="text-xs text-muted-foreground space-y-1">
							<li>
								• Demandez le code d&apos;invitation à un membre du groupe
							</li>
							<li>• Entrez le code ci-dessus</li>
							<li>• Vous rejoindrez automatiquement le groupe</li>
							<li>• Vous recevrez les notifications du groupe</li>
						</ul>
					</div>

					<div className="pt-4">
						<Button
							type="submit"
							size="lg"
							className="w-full h-14 text-base font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
							disabled={isSubmitting || !isValid}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="w-5 h-5 mr-3 animate-spin" />
									Connexion en cours...
								</>
							) : (
								<>
									<Users className="w-5 h-5 mr-3" />
									Rejoindre le groupe
								</>
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
