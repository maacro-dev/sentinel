import { getAllUsers } from "@/api/users";
import { User } from "@/lib/types";
import { unwrap } from "@/utils";

export async function queryUsers(): Promise<User[]> { return unwrap(await getAllUsers()); }