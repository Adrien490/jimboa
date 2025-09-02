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
import { Camera, Heart, Loader2, Plus, Users, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { createGroupSchema } from "./create-group-schema";

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
			type: undefined,
			image: undefined,
		},
		mode: "onChange",
	});

	const { isSubmitting, isValid } = form.formState;
	const selectedImage = form.watch("image");
	const selectedType = form.watch("type");

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

			await createGroup({ name: values.name, type: values.type, imageId });

			toast.success("Groupe créé !", {
				description: `"${values.name}" est prêt 🚀`,
				duration: 3000,
			});

			form.reset();
			router.push("/groups");
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Une erreur inattendue s'est produite";

			toast.error("Échec de création", {
				description: errorMessage,
				duration: 4000,
			});

			console.error("Erreur création groupe:", error);
		}
	};

	return (
		<div className="space-y-6">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
					{/* Type Selection */}
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-base font-medium">
									Type de groupe
								</FormLabel>
								<FormControl>
									<div className="grid grid-cols-2 gap-3">
										{/* Friends Option */}
										<button
											type="button"
											onClick={() => field.onChange("friends")}
											className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 ${
												selectedType === "friends"
													? "border-blue-500 bg-blue-50 dark:bg-blue-950/30 shadow-lg"
													: "border-border bg-card/50 hover:border-blue-300 hover:bg-blue-50/50 dark:hover:bg-blue-950/20"
											}`}
											disabled={isSubmitting}
										>
											<div className="flex flex-col items-center space-y-3">
												<div
													className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
														selectedType === "friends"
															? "bg-blue-500 text-white shadow-lg"
															: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/70"
													}`}
												>
													<Users className="w-7 h-7" />
												</div>
												<div className="text-center">
													<h3 className="font-heading-semibold text-sm text-card-foreground">
														Entre amis
													</h3>
													<p className="text-xs text-muted-foreground">
														Jusqu&apos;à 50 membres
													</p>
												</div>
											</div>
											{selectedType === "friends" && (
												<div className="absolute -inset-0.5 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-2xl blur-sm opacity-50" />
											)}
										</button>

										{/* Couple Option */}
										<button
											type="button"
											onClick={() => field.onChange("couple")}
											className={`relative group p-4 rounded-2xl border-2 transition-all duration-300 ${
												selectedType === "couple"
													? "border-rose-500 bg-rose-50 dark:bg-rose-950/30 shadow-lg"
													: "border-border bg-card/50 hover:border-rose-300 hover:bg-rose-50/50 dark:hover:bg-rose-950/20"
											}`}
											disabled={isSubmitting}
										>
											<div className="flex flex-col items-center space-y-3">
												<div
													className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
														selectedType === "couple"
															? "bg-rose-500 text-white shadow-lg"
															: "bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-400 group-hover:bg-rose-200 dark:group-hover:bg-rose-900/70"
													}`}
												>
													<Heart className="w-7 h-7" />
												</div>
												<div className="text-center">
													<h3 className="font-heading-semibold text-sm text-card-foreground">
														En couple
													</h3>
													<p className="text-xs text-muted-foreground">
														Maximum 2 membres
													</p>
												</div>
											</div>
											{selectedType === "couple" && (
												<div className="absolute -inset-0.5 bg-gradient-to-r from-rose-400/20 to-rose-600/20 rounded-2xl blur-sm opacity-50" />
											)}
										</button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					{/* Image Upload */}
					<div className="space-y-2">
						<FormLabel className="text-base font-medium">
							Photo du groupe (optionnel)
						</FormLabel>
						<div className="flex items-center gap-4">
							<div className="relative">
								{selectedImage ? (
									<div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden border-2 border-border">
										<Image
											width={96}
											height={96}
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
										className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-muted-foreground/25 rounded-xl flex items-center justify-center hover:border-muted-foreground/50 transition-colors"
										disabled={isSubmitting}
									>
										<Camera className="w-10 h-10 sm:w-12 sm:h-12 text-muted-foreground" />
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
					{selectedType && (
						<div className="rounded-lg border bg-muted/50 p-4 space-y-2">
							<h4 className="text-sm font-medium text-foreground">
								Ce qui sera généré automatiquement :
							</h4>
							<ul className="text-xs text-muted-foreground space-y-1">
								<li>• Code d&apos;invitation unique (6 caractères)</li>
								<li>• Vous serez automatiquement administrateur du groupe</li>
								<li>• Heure de notification quotidienne : 9h00</li>
								<li>
									• Limite de membres :{" "}
									{selectedType === "couple" ? "2 personnes" : "50 personnes"}
								</li>
								<li>• Date de création</li>
							</ul>
						</div>
					)}

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
									Création en cours...
								</>
							) : (
								<>
									<Plus className="w-5 h-5 mr-3" />
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
