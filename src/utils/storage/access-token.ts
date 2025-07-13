import { AUTH_TOKEN_KEY } from "@/app/config/session";
import { get, remove, store } from "./local-storage";

export function getAccessToken(): string {
  const stored = get<string>(AUTH_TOKEN_KEY);
  return stored ?? "";
}

export function storeAccessToken(t: string) {
  store(AUTH_TOKEN_KEY, t);
}

export function clearAccessToken() {
  remove(AUTH_TOKEN_KEY);
}
