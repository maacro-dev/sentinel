import * as z from "zod/v4";
import { ROLE_METADATA } from "../config";

export type Role = keyof typeof ROLE_METADATA;
export const roleSchema = z.enum(Object.keys(ROLE_METADATA) as Role[]);
