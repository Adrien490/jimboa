import { z } from "zod";

export const groupTypeSchema = z.enum(["FRIENDS", "COUPLE"]);
