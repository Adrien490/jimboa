"use client";

import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useSignIn, useSignUp } from "@clerk/nextjs";
import { Apple } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

type Values = { email: string; formError?: string };

export function SignupEmailForm() {
	const router = useRouter();
	const { isLoaded: inLoaded, signIn } = useSignIn();
	const { isLoaded: upLoaded, signUp } = useSignUp();
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<Values>({ defaultValues: { email: "" } });

	const onSubmit = async ({ email }: Values) => {
		if (!upLoaded) return;
		try {
			await signUp.create({ emailAddress: email });
			await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
			router.push("/sign-in");
		} catch {
			console.warn("Failed to sign up");
		}
	};

	const oauth = async (provider: "oauth_google" | "oauth_apple") => {
		try {
			if (!inLoaded) return;
			await signIn.authenticateWithRedirect({
				strategy: provider,
				fallbackRedirectUrl: "/groups",
			});
		} catch {
			// no-op: handled by Clerk
		}
	};

	return (
		<div className="space-y-6">
			<div className="space-y-3">
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
			</div>

			<div className="flex items-center gap-3">
				<div className="h-px w-full bg-[#262626]" />
				<span className="text-xs text-neutral-400">OR</span>
				<div className="h-px w-full bg-[#262626]" />
			</div>

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
				<div className="space-y-2">
					<Label htmlFor="email" className="text-white">
						Work Email <span className="text-green-500">*</span>
					</Label>
					<Input
						id="email"
						type="email"
						placeholder="hello@company.com"
						className="bg-[#121212] border-[#262626] text-white placeholder:text-neutral-500"
						aria-invalid={!!errors.email}
						{...register("email", { required: "Email requis" })}
					/>
					{errors.email && (
						<p className="text-sm text-red-500">{errors.email.message}</p>
					)}
					{errors.formError?.message && (
						<p className="text-sm text-red-500">{errors.formError.message}</p>
					)}
				</div>
				<Button
					type="submit"
					disabled={isSubmitting}
					className="w-full bg-white text-black hover:bg-white/90"
				>
					Continue with Email
				</Button>
			</form>

			<p className="text-center text-sm text-neutral-400">
				Already have an account{" "}
				<a href="/sign-in" className="text-green-500 hover:underline">
					Login
				</a>
			</p>
		</div>
	);
}
