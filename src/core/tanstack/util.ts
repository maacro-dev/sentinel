import { FormRouteType } from "@/routes/_manager/forms/-config";
import { Path, RouteConfig } from "./router/types";

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
