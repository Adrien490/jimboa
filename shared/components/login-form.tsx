"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useSignIn } from "@clerk/nextjs";
import { Apple, Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type LoginValues = {
	email: string;
	password: string;
	showPassword: boolean;
	formError?: string;
};

export function LoginForm() {
	const router = useRouter();
	const { isLoaded, signIn, setActive } = useSignIn();
	const {
		register,
		handleSubmit,
		setError,
		setValue,
		watch,
		formState: { errors, isSubmitting },
	} = useForm<LoginValues>({
		defaultValues: { email: "", password: "", showPassword: false },
		mode: "onSubmit",
	});
	const showPassword = watch("showPassword");

	const onSubmit = async (values: LoginValues) => {
		if (!isLoaded) return;
		try {
			const res = await signIn.create({
				identifier: values.email,
				password: values.password,
			});

			if (res.status === "complete") {
				await setActive({ session: res.createdSessionId });
				router.push("/");
				return;
			}

			setError("formError", {
				type: "server",
				message: "Une étape de vérification supplémentaire est requise.",
			});
		} catch {
			console.warn("Failed to sign in");
		}
	};

	const oauth = async (provider: "oauth_google" | "oauth_apple") => {
		try {
			if (!isLoaded) return;
			await signIn.authenticateWithRedirect({
				strategy: provider,
				redirectUrl: "/groups",
				redirectUrlComplete: "/groups",
			});
		} catch (err) {
			console.warn("OAuth error", err);
		}
	};

	return (
		<form
			onSubmit={handleSubmit(onSubmit)}
			className="w-full max-w-sm space-y-5"
		>
			<div className="space-y-2">
				<Label htmlFor="email" className="text-white">
					Email
				</Label>
				<Input
					id="email"
					type="email"
					autoComplete="email"
					aria-invalid={!!errors.email}
					placeholder="hello@company.com"
					className="bg-[#121212] border-[#262626] text-white placeholder:text-neutral-500"
					{...register("email", { required: "Email requis" })}
				/>
				{errors.email && (
					<p className="text-sm text-red-500">{errors.email.message}</p>
				)}
			</div>
			<div className="space-y-2">
				<Label htmlFor="password" className="text-white">
					Password
				</Label>
				<div className="relative">
					<Input
						id="password"
						type={showPassword ? "text" : "password"}
						autoComplete="current-password"
						aria-invalid={!!errors.password}
						placeholder="Your password"
						className="bg-[#121212] border-[#262626] text-white placeholder:text-neutral-500 pr-10"
						{...register("password", { required: "Mot de passe requis" })}
					/>
					<button
						type="button"
						className="absolute inset-y-0 right-0 flex items-center pr-3 text-neutral-400 hover:text-neutral-200"
						onClick={() => setValue("showPassword", !showPassword)}
						aria-label={showPassword ? "Hide password" : "Show password"}
					>
						{showPassword ? (
							<EyeOff className="size-5" />
						) : (
							<Eye className="size-5" />
						)}
					</button>
				</div>
				<div>
					<a
						href="/sign-in#forgot-password"
						className="text-sm text-green-500 hover:underline"
					>
						Forgot Password?
					</a>
				</div>
			</div>
			{errors.formError?.message && (
				<p className="text-sm text-red-500">{errors.formError.message}</p>
			)}
			<Button
				type="submit"
				size="lg"
				disabled={isSubmitting}
				className="w-full h-14 text-base font-semibold bg-white text-black hover:bg-white/90 rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
			>
				{isSubmitting ? (
					<>
						<Loader2 className="w-5 h-5 mr-3 animate-spin" />
						Connexion en cours...
					</>
				) : (
					"Se connecter"
				)}
			</Button>

			<div className="flex items-center gap-3">
				<div className="h-px w-full bg-[#262626]" />
				<span className="text-xs text-neutral-400">OR</span>
				<div className="h-px w-full bg-[#262626]" />
			</div>

			<Button
				type="button"
				variant="outline"
				className="w-full bg-[#121212] border-[#262626] text-white hover:bg-[#1a1a1a]"
				onClick={() => oauth("oauth_apple")}
			>
				<Apple className="mr-2 size-5" />
				Continue with Apple
			</Button>
			<Button
				type="button"
				variant="outline"
				className="w-full bg-[#121212] border-[#262626] text-white hover:bg-[#1a1a1a]"
				onClick={() => oauth("oauth_google")}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 48 48"
					className="mr-2 size-5"
				>
					<path
						fill="#FFC107"
						d="M43.611 20.083H42V20H24v8h11.303C33.731 31.91 29.267 35 24 35c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.152 7.961 3.039l5.657-5.657C33.64 5.053 29.054 3 24 3 12.955 3 4 11.955 4 23s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.651-.389-3.917z"
					/>
					<path
						fill="#FF3D00"
						d="M6.306 14.691l6.571 4.815C14.297 16.177 18.82 13 24 13c3.059 0 5.842 1.152 7.961 3.039l5.657-5.657C33.64 5.053 29.054 3 24 3 16.318 3 9.656 7.337 6.306 14.691z"
					/>
					<path
						fill="#4CAF50"
						d="M24 43c5.186 0 9.738-1.986 13.154-5.214l-6.06-4.934C29.013 34.862 26.671 36 24 36c-5.243 0-9.693-3.36-11.294-8.02l-6.535 5.036C9.5 39.556 16.227 43 24 43z"
					/>
					<path
						fill="#1976D2"
						d="M43.611 20.083H42V20H24v8h11.303c-1.041 3.065-3.179 5.625-5.846 7.171l.004-.003 6.06 4.934C36.36 41.022 44 36 44 23c0-1.341-.138-2.651-.389-3.917z"
					/>
				</svg>
				Continue with Google
			</Button>

			<p className="pt-2 text-center text-[11px] leading-5 text-neutral-500">
				Scale uses cookies for analytics personalized content and ads. By using
				Scale&#39;s services you agree to this use of cookies.{" "}
				<a className="underline" href="#">
					Learn more
				</a>
			</p>
		</form>
	);
}
