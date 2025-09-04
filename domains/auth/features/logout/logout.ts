"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

export async function logout() {
	const supabase = await createClient();
	await supabase.auth.signOut();

	revalidateTag("is-authenticated");
	redirect("/");
}
