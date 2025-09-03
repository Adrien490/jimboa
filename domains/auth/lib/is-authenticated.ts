"use server";

import { cacheTag } from "next/dist/server/use-cache/cache-tag";
import { headers } from "next/headers";
import { auth } from "../../../auth";

export async function isAuthenticated() {
	"use cache";

	cacheTag("is-authenticated");

	const session = await auth.api.getSession({
		headers: await headers(),
	});

	return !!session;
}
