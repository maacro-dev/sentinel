export type Result<T = void> = T extends void
  ? { success: true } | { success: false; error: Error }
  : { success: true; data: T } | { success: false; error: Error };
