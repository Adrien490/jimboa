"use server";

import { auth } from "@/auth";
import { revalidateTag } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
	await auth.api.signOut({ headers: await headers() });

	revalidateTag("is-authenticated");
	redirect("/");
}
