"use client";

import { convex } from "@/lib/auth-client";
import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ReactNode } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
	return <ConvexAuthProvider client={convex}>{children}</ConvexAuthProvider>;
}
