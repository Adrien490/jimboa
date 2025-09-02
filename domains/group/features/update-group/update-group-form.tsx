"use client";

import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
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
import { Camera, Loader2, Save, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { updateGroupSchema } from "./update-group-schema";

type UpdateGroupFormValues = z.infer<typeof updateGroupSchema>;

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
	const updateGroup = useMutation(api.groups.update);
	const generateUploadUrl = useMutation(api.groups.generateUploadUrl);
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<UpdateGroupFormValues>({
		resolver: zodResolver(updateGroupSchema),
		defaultValues: {
			name: defaultValues.name,
			image: undefined,
		},
		mode: "onChange",
	});

	const { isSubmitting, isValid } = form.formState;
	const selectedImage = form.watch("image");

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

			form.setValue("image", file);
		}
	};

	const removeImage = () => {
		form.setValue("image", undefined);
		if (fileInputRef.current) {
			fileInputRef.current.value = "";
		}
	};

	const handleSubmit = async (values: UpdateGroupFormValues) => {
		try {
			let imageId = undefined;

			// Upload image if selected
			if (values.image) {
				const postUrl = await generateUploadUrl();
				const result = await fetch(postUrl, {
					method: "POST",
					headers: { "Content-Type": values.image.type },
					body: values.image,
				});
				const { storageId } = await result.json();
				imageId = storageId;
			}

			await updateGroup({
				id: groupId as Id<"groups">,
				name: values.name,
				imageId,
			});

			toast.success("Groupe mis à jour !", {
				description: `"${values.name}" a été modifié avec succès`,
				duration: 3000,
			});

			router.push(`/groups/${groupId}`);
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Une erreur inattendue s'est produite";

			toast.error("Échec de la mise à jour", {
				description: errorMessage,
				duration: 4000,
			});
		}
	};

	return (
		<div className="space-y-8">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
					{/* Image Upload */}
					<FormItem>
						<FormLabel className="text-lg font-heading-semibold text-foreground">
							Photo du groupe
						</FormLabel>
						<div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
							<div className="relative flex-shrink-0">
								{selectedImage ? (
									<div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-border shadow-lg">
										<Image
											width={112}
											height={112}
											src={URL.createObjectURL(selectedImage)}
											alt="Aperçu"
											className="w-full h-full object-cover"
										/>
										<button
											type="button"
											onClick={removeImage}
											className="absolute -top-2 -right-2 w-7 h-7 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors shadow-lg touch-manipulation"
											disabled={isSubmitting}
										>
											<X className="w-4 h-4" />
										</button>
									</div>
								) : defaultValues.imageUrl ? (
									<div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-border shadow-lg">
										<Image
											width={112}
											height={112}
											src={defaultValues.imageUrl}
											alt="Photo actuelle"
											className="w-full h-full object-cover"
										/>
										<button
											type="button"
											onClick={() => fileInputRef.current?.click()}
											className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-2xl"
											disabled={isSubmitting}
										>
											<Camera className="w-8 h-8 text-white" />
										</button>
									</div>
								) : (
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-muted-foreground/30 rounded-2xl flex items-center justify-center hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 touch-manipulation active:scale-95"
										disabled={isSubmitting}
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
									{selectedImage
										? "Nouvelle photo sélectionnée - elle remplacera l'actuelle"
										: defaultValues.imageUrl
											? "Cliquez sur l'image pour la changer ou ajoutez une nouvelle photo"
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
							disabled={isSubmitting}
						/>
					</FormItem>

					{/* Group Name */}
					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-lg font-heading-semibold text-foreground">
									Nom du groupe
								</FormLabel>
								<FormControl>
									<Input
										placeholder="Ex: Mes amis, Équipe projet, Famille..."
										disabled={isSubmitting}
										maxLength={100}
										{...field}
									/>
								</FormControl>
								<FormMessage />
								{field.value && (
									<p className="text-sm text-muted-foreground text-right">
										{field.value.length}/100 caractères
									</p>
								)}
							</FormItem>
						)}
					/>

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
						<Button
							type="submit"
							size="lg"
							className="w-full h-16 text-lg font-heading-semibold rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] touch-manipulation"
							disabled={isSubmitting || !isValid}
						>
							{isSubmitting ? (
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
					</div>
				</form>
			</Form>
		</div>
	);
}
