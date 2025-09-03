import { z } from "zod";

export const membershipStatusSchema = z.enum(["ACTIVE", "LEFT", "BANNED"]);
