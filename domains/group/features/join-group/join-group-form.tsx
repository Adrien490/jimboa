"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/cn";
import { mergeForm, useForm, useTransform } from "@tanstack/react-form";
import { Loader2, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useJoinGroupForm } from "./use-join-group-form";

export function JoinGroupForm() {
	const router = useRouter();

	const { state, dispatch, isPending } = useJoinGroupForm({
		onSuccess: (message) => {
			toast.success("Groupe rejoint !", {
				description: message,
				duration: 3000,
			});
			form.reset();
			router.push("/groups");
		},
		onError: (error) => {
			toast.error("Impossible de rejoindre", {
				description: error,
				duration: 4000,
			});
		},
	});

	const form = useForm({
		defaultValues: {
			code: "",
		},
		transform: useTransform(
			(baseForm) => mergeForm(baseForm, (state as unknown) ?? {}),
			[state]
		),
	});

	return (
		<form action={dispatch} onSubmit={form.handleSubmit} className="space-y-6">
			<form.Field
				name="code"
				validators={{
					onChange: ({ value }) => {
						if (!value?.trim()) {
							return "Le code d'invitation est requis";
						}
						if (value.trim().length < 6) {
							return "Le code doit contenir au moins 6 caractères";
						}
						if (value.trim().length > 10) {
							return "Le code ne peut pas dépasser 10 caractères";
						}
						if (!/^[A-Z0-9]+$/i.test(value.trim())) {
							return "Le code ne peut contenir que des lettres et des chiffres";
						}
						return undefined;
					},
				}}
			>
				{(field) => (
					<div className="space-y-2">
						<Label className="text-base font-medium">
							Code d&apos;invitation
						</Label>
						<Input
							name={field.name}
							value={field.state.value}
							onChange={(e) => {
								// Convertir automatiquement en majuscules
								const value = e.target.value.toUpperCase();
								field.handleChange(value);
							}}
							onBlur={field.handleBlur}
							placeholder="Ex: ABC123, XYZ789..."
							className={cn(
								"text-base text-center font-mono tracking-wider",
								!field.state.meta.isValid
									? "border-destructive focus:border-destructive"
									: ""
							)}
							disabled={isPending}
							maxLength={10}
						/>
						{!field.state.meta.isValid &&
							field.state.meta.errors.length > 0 && (
								<p className="text-sm text-destructive text-center">
									{field.state.meta.errors.join(", ")}
								</p>
							)}
						{field.state.value && (
							<p className="text-xs text-muted-foreground text-center">
								{field.state.value.length}/10 caractères
							</p>
						)}
					</div>
				)}
			</form.Field>

			{/* Info sur le processus */}
			<div className="rounded-lg border bg-muted/50 p-4 space-y-2">
				<h4 className="text-sm font-medium text-foreground">
					Comment ça marche :
				</h4>
				<ul className="text-xs text-muted-foreground space-y-1">
					<li>• Demandez le code d&apos;invitation à un membre du groupe</li>
					<li>• Entrez le code ci-dessus</li>
					<li>• Vous rejoindrez automatiquement le groupe</li>
					<li>• Vous recevrez les notifications du groupe</li>
				</ul>
			</div>

			<div className="pt-4">
				<form.Subscribe selector={(state) => [state.canSubmit]}>
					{([canSubmit]) => (
						<Button
							type="submit"
							size="lg"
							className="w-full h-14 text-base font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
							disabled={isPending || !canSubmit}
						>
							{isPending ? (
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
					)}
				</form.Subscribe>
			</div>
		</form>
	);
}
