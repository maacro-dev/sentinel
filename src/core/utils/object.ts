
export function getKeyPathValue<
  TObj extends object,
  TPath extends string
>( obj: TObj, path: TPath ): unknown {
  return path
    .split(".")
    .reduce((acc: unknown, key) => {
      if (acc && typeof acc === "object" && key in acc) {
        return (acc as Record<string, unknown>)[key];
      }
      return undefined;
    }, obj);
}

type AnyData = Record<string, any> | null | undefined;
export function flatten<TData extends AnyData>(data: TData,formDataKey: string = 'form_data'): [string, any][] {
  if (!data) return [];

  return Object.entries(data).flatMap(([key, value]) => {
    if (
      key === formDataKey &&
      value !== null &&
      value !== undefined &&
      typeof value === 'object'
    ) {
      return Object.entries(value);
    }
    return [[key, value]];
  });
}
