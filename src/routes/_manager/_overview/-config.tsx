import { createRouteConfig } from "@/core/tanstack/router/utils";
import { fieldTableColumns } from "@/features/fields/components/FieldsTable/fieldTableColumns";
import { FormInput, Grid2X2, LayoutDashboard } from "lucide-react";

export const overviewGroupConfig = createRouteConfig("overview", {
  role: "data_manager",
  label: "Overview",
  children: [
    createRouteConfig("dashboard", {
      role: "data_manager",
      label: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    }),
    createRouteConfig({
      role: "data_manager",
      label: "Data Collection",
      path: "/forms-overview",
      icon: FormInput,
    }),
    // createRouteConfig({
    //   role: "data_manager",
    //   label: "Fields",
    //   path: "/monitored-fields",
    //   icon: Grid2X2,
    //   meta: {
    //     tableColumns: fieldTableColumns
    //   }
    // }),
  ]
});
