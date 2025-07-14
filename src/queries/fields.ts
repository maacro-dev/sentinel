import { getAllFields } from "@/api/farmer/get-all-fields";
import { Fields } from "@/lib/types";
import { unwrap } from "@/utils";

export async function queryAllFields(): Promise<Fields> {
  return unwrap(await getAllFields());
}
