import { logDebugCheck, logDebugError, logDebugOk } from "chronicle-log";
import { getUserByEmail } from "../users";
import { getCurrentSession } from "./get-session";

import { Result, User } from "@/lib/types";
import { MAX_SESSION_AGE_MS } from "@/app/config";
import { clearSignInTime, getSignInTime, storeSignInTime } from "@/utils";

/**
 * Implementing my own timebox for session expiration.
 * Supabase timebox is only on PRO plan :<
 */
export async function supabaseSession(): Promise<Result<User>> {

  logDebugCheck("Checking if session exists");
  const sessionResult = await getCurrentSession();

  if (!sessionResult.ok) {
    logDebugError("Session does not exist");
    clearSignInTime();
    
    return { ok: false, error: new Error("Session does not exist") }
  }

  logDebugOk("Session exists");
  logDebugCheck("Checking if session is fresh");

  const now = Date.now();
  const lastSignInTimeMs = getSignInTime();

  if (isNaN(lastSignInTimeMs)) {
    logDebugOk("Session is new — storing sign-in time");
    storeSignInTime(now);
  }

  const age = now - lastSignInTimeMs;
  if (age > MAX_SESSION_AGE_MS) {
    logDebugError("Session expired");
    clearSignInTime();
    return { ok: false, error: new Error("Session expired") }
  }

  logDebugOk("Session is fresh");
  logDebugCheck("Fetching user profile");

  const { email } = sessionResult.data.user;
  const userResult = await getUserByEmail(email!);

  if (userResult.ok) {
    logDebugOk(`Authenticated as ${email}`);
    return { ok: true, data: userResult.data }
    
  } else {
    logDebugError("User record lookup failed → clearing auth");
    clearSignInTime();
    return { ok: false, error: new Error("User record lookup failed") }
  }
}