import { Result } from "@/lib/types";

export function unwrap<T>(result: Result<T>): T {
  if (!result.ok) {
    throw result.error;
  }
  return result.data;
}
