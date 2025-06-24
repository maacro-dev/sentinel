export type Result<T> = {
  data: T | null;
  error: Error | null;
};
