import { SIGN_IN_TIME_KEY } from "@/app/config";
import { get, remove, store } from "./local-storage";

export function getSignInTime(): number {
  const stored = get<number>(SIGN_IN_TIME_KEY);
  return stored ?? NaN;
}

export function storeSignInTime(t: number) {
  store(SIGN_IN_TIME_KEY, t);
}

export function clearSignInTime() {
  remove(SIGN_IN_TIME_KEY);
}
