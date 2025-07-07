import { getAllUsers, GetAllUsersParams } from "@/api/users";
import { User } from "@/lib/types";
import { unwrap } from "@/utils";

export async function queryUsers(params: GetAllUsersParams): Promise<User[]> { 
  return unwrap(await getAllUsers(params)); 
}