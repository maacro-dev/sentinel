import { RouteConfig } from "./types";

export function getParentId(path: string): string {
  const segments = path.split('/').filter(Boolean);
  if (segments.length <= 1) return '/';
  segments.pop();
  return '/' + segments.join('/');
}

export function isDynamicRoute(path: string): boolean {
  return path.includes('$');
}

export function resolveDynamicRoute(path: string, value: string): string {
  if (!isDynamicRoute(path)) return path;
  return path.replace(/\$\w+/g, value);
}

export function createRouteConfig<TKey extends string,TConfig extends Omit<RouteConfig<TKey>, 'id'>>(
  id: TKey,
  config: TConfig
): { id: TKey } & TConfig;

export function createRouteConfig<TConfig extends Omit<RouteConfig<string>, 'id'>>(
  config: TConfig
): { id?: string } & TConfig;

export function createRouteConfig(...args: any[]) {
  if (args.length === 1) {
    const [config] = args;
    return { ...config } as any;
  }

  const [id, config] = args;
  return { id, ...config } as any;
}
