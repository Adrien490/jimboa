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
		<div className="space-y-8">
			<Form {...form}>
				<form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
					{/* Type Selection */}
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem>
								<FormLabel className="text-lg font-heading-semibold text-foreground">
									Type de groupe
								</FormLabel>
								<FormControl>
									<div className="grid grid-cols-2 gap-3 sm:gap-4">
										{/* Friends Option */}
										<button
											type="button"
											onClick={() => field.onChange("friends")}
											className={`relative group p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 touch-manipulation ${
												selectedType === "friends"
													? "border-primary bg-primary/5 shadow-lg scale-[1.02]"
													: "border-border bg-card/50 hover:border-primary/30 hover:bg-primary/5 active:scale-[0.98]"
											}`}
											disabled={isSubmitting}
										>
											<div className="flex flex-col items-center space-y-3 sm:space-y-4">
												<div
													className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
														selectedType === "friends"
															? "bg-primary text-primary-foreground shadow-xl"
															: "bg-primary/10 text-primary group-hover:bg-primary/20"
													}`}
												>
													<Users className="w-7 h-7 sm:w-8 sm:h-8" />
												</div>
												<div className="text-center">
													<h3 className="font-heading-semibold text-sm sm:text-base text-card-foreground mb-1">
														Entre amis
													</h3>
													<p className="text-sm text-muted-foreground">
														Jusqu&apos;à 50 membres
													</p>
												</div>
											</div>
											{selectedType === "friends" && (
												<div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/30 rounded-2xl blur-md opacity-50 -z-10" />
											)}
										</button>

										{/* Couple Option */}
										<button
											type="button"
											onClick={() => field.onChange("couple")}
											className={`relative group p-4 sm:p-6 rounded-2xl border-2 transition-all duration-300 touch-manipulation ${
												selectedType === "couple"
													? "border-red-500 bg-red-50 dark:bg-red-950/30 shadow-lg scale-[1.02]"
													: "border-border bg-card/50 hover:border-red-300 hover:bg-red-50/50 dark:hover:bg-red-950/20 active:scale-[0.98]"
											}`}
											disabled={isSubmitting}
										>
											<div className="flex flex-col items-center space-y-3 sm:space-y-4">
												<div
													className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
														selectedType === "couple"
															? "bg-red-500 text-white shadow-xl"
															: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 group-hover:bg-red-200 dark:group-hover:bg-red-900/70"
													}`}
												>
													<Heart className="w-7 h-7 sm:w-8 sm:h-8" />
												</div>
												<div className="text-center">
													<h3 className="font-heading-semibold text-sm sm:text-base text-card-foreground mb-1">
														En couple
													</h3>
													<p className="text-sm text-muted-foreground">
														Maximum 2 membres
													</p>
												</div>
											</div>
											{selectedType === "couple" && (
												<div className="absolute -inset-1 bg-gradient-to-r from-red-400/20 to-red-600/20 rounded-2xl blur-md opacity-50 -z-10" />
											)}
										</button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

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
									Personnalisez votre groupe
								</p>
								<p className="text-sm text-muted-foreground">
									Ajoutez une photo pour rendre votre groupe unique et
									facilement reconnaissable
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
										className="h-14 text-base rounded-2xl border-2 focus:border-primary transition-all duration-300"
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
					{selectedType && (
						<div className="relative">
							<div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary/10 rounded-2xl blur-xl opacity-50" />
							<div className="relative rounded-2xl border bg-card/50 backdrop-blur-sm p-6 space-y-3">
								<h4 className="text-base font-heading-semibold text-foreground flex items-center gap-2">
									<div className="w-2 h-2 bg-primary rounded-full" />
									Configuration automatique
								</h4>
								<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-muted-foreground">
									<div className="flex items-center gap-2">
										<div className="w-1 h-1 bg-primary/60 rounded-full" />
										Code d&apos;invitation unique
									</div>
									<div className="flex items-center gap-2">
										<div className="w-1 h-1 bg-primary/60 rounded-full" />
										Vous serez administrateur
									</div>
									<div className="flex items-center gap-2">
										<div className="w-1 h-1 bg-primary/60 rounded-full" />
										Notifications à 9h00
									</div>
									<div className="flex items-center gap-2">
										<div className="w-1 h-1 bg-primary/60 rounded-full" />
										{selectedType === "couple"
											? "2 membres max"
											: "50 membres max"}
									</div>
								</div>
							</div>
						</div>
					)}

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
									Création en cours...
								</>
							) : (
								<>
									<Plus className="w-6 h-6 mr-3" />
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
