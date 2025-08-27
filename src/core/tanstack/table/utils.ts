import { FormRouteType } from "@/routes/_manager/forms/-config";
import { Path, RouteConfig } from "../router/types";

export function getTableColumns({ formType, config }: {
  formType: FormRouteType;
  config: RouteConfig;
}) {
  const form = config.children?.find(child => child.id === formType);
  return form?.meta?.tableColumns || [];
}

export function getTableColumnsByPath({ path, config }: {
  path: Path,
  config: RouteConfig
}) {
  return config.children?.find(child => child.path === path)?.meta?.tableColumns || [];
}

// helpers

// 1-based index
export function clampPageIndex(index: number | undefined, maxIndex: number) {
  if (typeof index !== 'number') return 1;
  if (index < 1) return 1;
  if (maxIndex < 1) return 1;
  if (index > maxIndex) return maxIndex;
  return index;
}

export function normalizePageSize(size: number | undefined) {
  return [10, 25, 50].includes(size ?? 10) ? size! : 10;
}
