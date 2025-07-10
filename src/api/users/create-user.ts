import type { Result, UserCreate } from "@/lib/types";
import { invokeFunction } from "@/utils";

export async function createUser(user: UserCreate): Promise<Result<void>> {
  return await invokeFunction("create-user", user)
}