import { FormRouteType } from "@/routes/_manager/forms/-config";
import { RouteConfig } from "./router/types";

export function getTableColumns({ formType, config }: {
  formType: FormRouteType;
  config: RouteConfig;
}) {
  const form = config.children?.find(child => child.id === formType);
  return form?.meta?.tableColumns || [];
}
