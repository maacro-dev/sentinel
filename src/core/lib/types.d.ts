
export type TODO = any

export type Awaitable<T> = T | Promise<T>;

export type Flatten<T> = {
  [K in keyof T]: T[K]
} & {}

export type Onion<T, K extends string> =
  (T extends Record<K, infer V>
    ? (V extends string ? V : never)
    : never) |
  (T extends { children: readonly (infer U)[] }
    ? Onion<U, K>
    : never);

export type Keys<T> =
  T extends object
    ? string & keyof T | { [K in keyof T]: Keys<T[K]> }[keyof T]
    : never

export type KeyPath<T> = {
  [K in keyof T]: T[K] extends object
    ? `${Extract<K, string>}.${DotPath<T[K]>}` | Extract<K, string>
    : Extract<K, string>;
}[keyof T];

export type UnionToIntersection<U> =
  (U extends any ? (x: U)=>void : never) extends ((x: infer I)=>void) ? I : never
