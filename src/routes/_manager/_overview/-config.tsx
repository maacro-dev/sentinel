import { createRouteConfig } from "@/core/tanstack/router/utils";
import { collectionTableColumns } from "@/features/collection/components/CollectionTable/CollectionTableColumns";
import { FormInput, LayoutDashboard } from "lucide-react";

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
      path: "/collection",
      icon: FormInput,
      meta: {
        tableColumns: collectionTableColumns,
      },
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
