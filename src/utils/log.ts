export const LOG_STATES = [
  "OK",
  "START",
  "DONE",
  "ERROR",
  "INFO",
  "READY",
  "INIT",
  "CHECK",
  "FOUND",
  "REDIRECT",
  "PRELOAD",
  "CALL",
  "EVENT",
  "ROUTE",
  "RENDER",
  "NONE",
] as const;

export type LogState = typeof LOG_STATES[number];

const IS_DEV = import.meta.env.DEV;
const DEBUG = import.meta.env.VITE_DEBUG === "true";
const RENDER = import.meta.env.VITE_RENDER === "true";
const PRELOAD = import.meta.env.VITE_PRELOAD === "true";

const LOG_URL = import.meta.env.VITE_LOG_URL ?? "http://localhost:2003/chronicle/log";
const LOG_TIMEOUT = Number(import.meta.env.VITE_LOG_TIMEOUT_MS) || 2000;

const JSON_HEADERS = { "Content-Type": "application/json" } as const;

export function log(
  state: LogState,
  message: string,
  payload?: unknown,
  client = "Sentinel"
): void {
  if (!IS_DEV) return;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), LOG_TIMEOUT);

  void fetch(LOG_URL, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify({ client, state, message, payload }),
    signal: controller.signal,
  }).finally(() => clearTimeout(timer));
}

export function logOk(message: string, payload?: unknown) {
  log("OK", message, payload);
}

export function logRender(component: string, payload?: unknown) {
  if (RENDER) log("RENDER", component, payload);
}

export function logPreload(route: string, payload?: unknown) {
  if (PRELOAD) log("PRELOAD", route, payload);
}

export function logDebugCheck(message: string, payload?: unknown) {
  if (DEBUG) log("CHECK", message, payload);
}

export function logDebugError(message: string, payload?: unknown) {
  if (DEBUG) log("ERROR", message, payload);
}

export function logDebugOk(message: string, payload?: unknown) {
  if (DEBUG) log("OK", message, payload);
}

export function logDebugCall(message: string, payload?: unknown) {
  if (DEBUG) log("CALL", message, payload);
}
