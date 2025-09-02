"use client";

import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/cn";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Search } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { useDebouncedCallback } from "use-debounce";
import { z } from "zod";

const searchSchema = z.object({
	search: z.string().trim(),
});

type SearchFormValues = z.infer<typeof searchSchema>;

type SearchFormProps = {
	paramName: string;
	className?: string;
	placeholder?: string;
	paramsToClear?: string[];
};

export function SearchForm({
	paramName,
	className,
	placeholder,
	paramsToClear,
}: SearchFormProps) {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [isPending, startTransition] = useTransition();

	const form = useForm<SearchFormValues>({
		resolver: zodResolver(searchSchema),
		defaultValues: {
			search: searchParams?.get(paramName) || "",
		},
		mode: "onChange",
	});

	const debouncedSearch = useDebouncedCallback((searchValue: string) => {
		const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
		if (searchValue.trim()) {
			newSearchParams.set(paramName, searchValue.trim());
		} else {
			newSearchParams.delete(paramName);
		}
		if (paramsToClear) {
			paramsToClear.forEach((param) => {
				newSearchParams.delete(param);
			});
		}
		startTransition(() => {
			router.replace(`?${newSearchParams.toString()}`, { scroll: false });
		});
	}, 350);

	const handleSubmit = () => {
		// Force immediate search on form submit
		debouncedSearch.flush();
	};

	return (
		<div className="relative group">
			{/* Glow effect */}
			<div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-30 transition-opacity duration-300" />

			<form
				onSubmit={form.handleSubmit(handleSubmit)}
				data-pending={isPending ? "" : undefined}
				className={cn("relative", className)}
			>
				<div className="relative">
					<Input
						{...form.register("search", {
							onChange: (e) => debouncedSearch(e.target.value),
						})}
						autoComplete="off"
						type="search"
						className={cn(
							"pl-12 pr-12 h-12 sm:h-14 rounded-2xl",
							"bg-card/50 backdrop-blur-sm border-border/50",
							"hover:bg-card/80 focus:bg-card/80",
							"transition-all duration-300",
							"text-base sm:text-lg"
						)}
						placeholder={placeholder || "Rechercher..."}
						aria-label="Champ de recherche"
					/>

					{/* Icône de recherche/loader */}
					<div className="absolute left-4 top-1/2 -translate-y-1/2">
						{isPending ? (
							<Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-primary transition-all duration-200" />
						) : (
							<Search className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground transition-all duration-200 group-focus-within:text-primary" />
						)}
					</div>
				</div>
			</form>
		</div>
	);
}
