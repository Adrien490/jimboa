"use client";

import { api } from "@/convex/_generated/api";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/shared/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Camera, Loader2, Plus, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const createGroupSchema = z.object({
	name: z
		.string()
		.trim()
		.min(1, "Le nom du groupe est requis")
		.min(2, "Le nom doit contenir au moins 2 caractères")
		.max(100, "Le nom ne peut pas dépasser 100 caractères")
		.refine(
			(name) => name.length > 0 && name.trim().length > 0,
			"Le nom ne peut pas être vide"
		),
	image: z.instanceof(File).optional(),
});

type CreateGroupFormValues = z.infer<typeof createGroupSchema>;

export function CreateGroupForm() {
	const createGroup = useMutation(api.groups.create);
	const generateUploadUrl = useMutation(api.groups.generateUploadUrl);
	const router = useRouter();
	const fileInputRef = useRef<HTMLInputElement>(null);

	const form = useForm<CreateGroupFormValues>({
		resolver: zodResolver(createGroupSchema),
		defaultValues: {
			name: "",
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
				toast.error("L'image est trop volumineuse", {
					description: "La taille maximale est de 5MB",
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

	const handleSubmit = async (values: CreateGroupFormValues) => {
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

			await createGroup({ name: values.name, imageId });

			toast.success("Groupe créé avec succès !", {
				description: `Le groupe "${values.name}" a été créé.`,
			});

			form.reset();
			router.push("/groups");
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Une erreur inattendue s'est produite";

			toast.error("Erreur lors de la création du groupe", {
				description: errorMessage,
			});

			console.error("Erreur création groupe:", error);
		}
	};

	return (
		<div className="space-y-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					{/* Image Upload */}
					<div className="space-y-2">
						<FormLabel className="text-base font-medium">
							Photo du groupe (optionnel)
						</FormLabel>
						<div className="flex items-center gap-4">
							<div className="relative">
								{selectedImage ? (
									<div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border">
										<Image
											width={80}
											height={80}
											src={URL.createObjectURL(selectedImage)}
											alt="Aperçu"
											className="w-full h-full object-cover"
										/>
										<button
											type="button"
											onClick={removeImage}
											className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center hover:bg-destructive/90 transition-colors"
											disabled={isSubmitting}
										>
											<X className="w-3 h-3" />
										</button>
									</div>
								) : (
									<button
										type="button"
										onClick={() => fileInputRef.current?.click()}
										className="w-20 h-20 border-2 border-dashed border-muted-foreground/25 rounded-lg flex items-center justify-center hover:border-muted-foreground/50 transition-colors"
										disabled={isSubmitting}
									>
										<Camera className="w-6 h-6 text-muted-foreground" />
									</button>
								)}
							</div>
							<div className="flex-1">
								<p className="text-sm text-muted-foreground">
									Ajoutez une photo pour personnaliser votre groupe
								</p>
								<p className="text-xs text-muted-foreground">
									JPG, PNG ou GIF • Max 5MB
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
					</div>

					<FormField
						control={form.control}
						name="name"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-base font-medium">
									Nom du groupe
								</FormLabel>
								<FormControl>
									<Input
										placeholder="Ex: Mes amis, Équipe projet, Famille..."
										className="text-base"
										disabled={isSubmitting}
										maxLength={100}
										{...field}
									/>
								</FormControl>
								<FormMessage />
								{field.value && (
									<p className="text-xs text-muted-foreground">
										{field.value.length}/100 caractères
									</p>
								)}
							</FormItem>
						)}
					/>

					{/* Info sur ce qui sera généré */}
					<div className="rounded-lg border bg-muted/50 p-4 space-y-2">
						<h4 className="text-sm font-medium text-foreground">
							Ce qui sera généré automatiquement :
						</h4>
						<ul className="text-xs text-muted-foreground space-y-1">
							<li>• Code d&apos;invitation unique (6 caractères)</li>
							<li>• Vous serez automatiquement administrateur du groupe</li>
							<li>• Heure de notification quotidienne : 9h00</li>
							<li>• Limite de membres : 50 personnes</li>
							<li>• Date de création</li>
						</ul>
					</div>

					<div className="flex gap-3 pt-2">
						<Button
							type="button"
							variant="outline"
							className="flex-1"
							onClick={() => router.back()}
							disabled={isSubmitting}
						>
							Annuler
						</Button>
						<Button
							type="submit"
							className="flex-1"
							disabled={isSubmitting || !isValid}
						>
							{isSubmitting ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Création...
								</>
							) : (
								<>
									<Plus className="w-4 h-4 mr-2" />
									Créer le groupe
								</>
							)}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
