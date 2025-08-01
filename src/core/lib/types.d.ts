
export type TODO = any

export type Awaitable<T> = T | Promise<T>;

export type Flat<T, U> = {
  [K in keyof T | keyof U]: K extends keyof U
    ? U[K]
    : K extends keyof T
      ? T[K]
      : never;
};
