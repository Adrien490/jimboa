"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { cn } from "@/shared/lib/cn";
import { mergeForm, useForm, useTransform } from "@tanstack/react-form";
import { Camera, Loader2, Save, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { toast } from "sonner";
import { useUpdateGroupForm } from "./use-update-group-form";

interface UpdateGroupFormProps {
	groupId: string;
	defaultValues: {
		name: string;
		imageUrl?: string;
	};
}

export function UpdateGroupForm({
	groupId,
	defaultValues,
}: UpdateGroupFormProps) {
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const { state, dispatch, isPending } = useUpdateGroupForm({
		onSuccess: (message) => {
			toast.success("Groupe mis à jour !", {
				description: message,
				duration: 3000,
			});
			form.reset();
			router.push(`/groups/${groupId}`);
		},
		onError: (error) => {
			toast.error("Échec de la mise à jour", {
				description: error,
				duration: 4000,
			});
		},
	});

	const form = useForm({
		defaultValues: {
			groupId,
			name: defaultValues.name,
			imageUrl: defaultValues.imageUrl || "",
		},
		transform: useTransform(
			(baseForm) => mergeForm(baseForm, (state as unknown) ?? {}),
			[state]
		),
	});

	const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			if (file.size > 5 * 1024 * 1024) {
				// 5MB limit
				toast.error("Image trop lourde", {
					description: "Maximum 5MB",
					duration: 3000,
				});
				return;
			}

			form.setFieldValue("imageUrl", URL.createObjectURL(file));
		}
	};

	const removeImage = () => {
		form.setFieldValue("imageUrl", "");
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	return (
		<div className="space-y-8">
			<form
				action={dispatch}
				onSubmit={form.handleSubmit}
				className="space-y-8"
			>
				{/* Hidden field for groupId */}
				<input type="hidden" name="groupId" value={groupId} />

				{/* Image Upload */}
				<form.Field name="imageUrl">
					{(field) => (
						<div className="space-y-2">
							<Label className="text-lg font-heading-semibold text-foreground">
								Photo du groupe
							</Label>
							<div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
								<div className="relative flex-shrink-0">
									{field.state.value && field.state.value !== "" ? (
										<div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-border shadow-lg">
											<Image
												width={112}
												height={112}
												src={field.state.value}
												alt="Aperçu"
												className="w-full h-full object-cover"
											/>
											<button
												type="button"
												onClick={removeImage}
												className="absolute -top-2 -right-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-lg touch-manipulation"
												disabled={isPending}
											>
												<X className="w-4 h-4" />
											</button>
											{/* Overlay pour changer l'image */}
											<button
												type="button"
												onClick={() => fileInputRef.current?.click()}
												className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl"
												disabled={isPending}
											>
												<Camera className="w-8 h-8 text-white" />
											</button>
										</div>
									) : (
										<button
											type="button"
											onClick={() => fileInputRef.current?.click()}
											className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-muted-foreground/30 rounded-2xl flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 touch-manipulation active:scale-95"
											disabled={isPending}
										>
											<Camera className="w-10 h-10 text-muted-foreground" />
										</button>
									)}
								</div>
								<div className="flex-1 space-y-2">
									<p className="text-base text-card-foreground font-medium">
										Modifier la photo
									</p>
									<p className="text-sm text-muted-foreground">
										{field.state.value && field.state.value !== ""
											? "Cliquez sur l'image pour la changer ou supprimez-la"
											: "Ajoutez une photo pour personnaliser votre groupe"}
									</p>
									<p className="text-xs text-muted-foreground">
										JPG, PNG ou GIF • Maximum 5MB
									</p>
								</div>
							</div>
							<input
								ref={fileInputRef}
								type="file"
								accept="image/*"
								onChange={handleImageSelect}
								className="hidden"
								disabled={isPending}
							/>
						</div>
					)}
				</form.Field>

				{/* Group Name */}
				<form.Field
					name="name"
					validators={{
						onChange: ({ value }) => {
							if (!value?.trim()) {
								return "Le nom du groupe est requis";
							}
							if (value.trim().length < 2) {
								return "Le nom doit contenir au moins 2 caractères";
							}
							if (value.trim().length > 100) {
								return "Le nom ne peut pas dépasser 100 caractères";
							}
							return undefined;
						},
					}}
				>
					{(field) => (
						<div className="space-y-2">
							<Label className="text-lg font-heading-semibold text-foreground">
								Nom du groupe
							</Label>
							<Input
								name={field.name}
								value={field.state.value}
								onChange={(e) => field.handleChange(e.target.value)}
								onBlur={field.handleBlur}
								placeholder="Ex: Mes amis, Équipe projet, Famille..."
								disabled={isPending}
								maxLength={100}
								className={cn(
									!field.state.meta.isValid
										? "border-destructive focus:border-destructive"
										: ""
								)}
							/>
							{!field.state.meta.isValid &&
								field.state.meta.errors.length > 0 && (
									<p className="text-sm text-destructive">
										{field.state.meta.errors.join(", ")}
									</p>
								)}
							{field.state.value && (
								<p className="text-sm text-muted-foreground text-right">
									{field.state.value.length}/100 caractères
								</p>
							)}
						</div>
					)}
				</form.Field>

				{/* Info Card */}
				<div className="relative">
					<div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl blur-xl opacity-50" />
					<div className="relative rounded-2xl border bg-card/50 backdrop-blur-sm p-6 space-y-3">
						<h4 className="text-base font-heading-semibold text-foreground flex items-center gap-2">
							<div className="w-2 h-2 bg-primary rounded-full" />
							Informations
						</h4>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
							<div className="flex items-center gap-2">
								<div className="w-1 h-1 bg-primary/60 rounded-full" />
								Les membres existants restent
							</div>
							<div className="flex items-center gap-2">
								<div className="w-1 h-1 bg-primary/60 rounded-full" />
								Le code d&apos;invitation ne change pas
							</div>
							<div className="flex items-center gap-2">
								<div className="w-1 h-1 bg-primary/60 rounded-full" />
								Seuls les administrateurs peuvent modifier
							</div>
							<div className="flex items-center gap-2">
								<div className="w-1 h-1 bg-primary/60 rounded-full" />
								Les paramètres restent identiques
							</div>
						</div>
					</div>
				</div>

				{/* Submit Button */}
				<div className="pt-6">
					<form.Subscribe selector={(state) => [state.canSubmit]}>
						{([canSubmit]) => (
							<Button
								type="submit"
								size="lg"
								className="w-full h-16 text-lg font-heading-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
								disabled={isPending || !canSubmit}
							>
								{isPending ? (
									<>
										<Loader2 className="w-6 h-6 mr-3 animate-spin" />
										Mise à jour en cours...
									</>
								) : (
									<>
										<Save className="w-6 h-6 mr-3" />
										Sauvegarder les modifications
									</>
								)}
							</Button>
						)}
					</form.Subscribe>
				</div>
			</form>
		</div>
	);
}
