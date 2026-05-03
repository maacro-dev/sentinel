import { RouteConfigIds } from "@/core/tanstack/router/types";
import { createRouteConfig } from "@/core/tanstack/router/utils";
import { culturalManagementColumns } from "@/features/forms/columns/culturalManagementColumns";
import { damageAssessmentColumns } from "@/features/forms/columns/damageAssessmentColumns";
import { fieldDataColumns } from "@/features/forms/columns/fieldDataColumns";
import { nutrientManagementColumns } from "@/features/forms/columns/nutrientManagementColumns";
import { productionColumns } from "@/features/forms/columns/productionColumns";
import { Cuboid, Folder, Grid2X2, PackagePlus, ShieldHalf } from "lucide-react";

export type FormType = RouteConfigIds<typeof formGroupConfig>
export const formGroupConfig = createRouteConfig({
  role: "data_manager",
  label: "Forms",
  children: [
    createRouteConfig("field-data", {
      role: "data_manager",
      label: 'Field Data',
      path: "/forms/$formType",
      params: { formType: "field-data" },
      icon: Grid2X2,
      meta: {
        tableColumns: fieldDataColumns,
      }
    }),
    createRouteConfig("cultural-management", {
      role: "data_manager",
      label: 'Cultural Management',
      path: "/forms/$formType",
      params: { formType: "cultural-management" },
      icon: Folder,
      meta: {
        tableColumns: culturalManagementColumns,
      }
    }),
    createRouteConfig("nutrient-management", {
      role: "data_manager",
      label: "Nutrient Management",
      path: "/forms/$formType",
      params: { formType: "nutrient-management" },
      icon: Cuboid,
      meta: {
        tableColumns: nutrientManagementColumns,
      },
    }),
    createRouteConfig("production", {
      role: "data_manager",
      label: "Production",
      path: "/forms/$formType",
      params: { formType: "production" },
      icon: PackagePlus,
      meta: {
        tableColumns: productionColumns,
      },
    }),
    createRouteConfig("damage-assessment", {
      role: "data_manager",
      label: "Damage Assessment",
      path: "/forms/$formType",
      params: { formType: "damage-assessment" },
      icon: ShieldHalf,
      meta: {
        tableColumns: damageAssessmentColumns,
      }
    }),
  ]
});





// createRouteConfig("monitoring-visit", {
//   role: "data_manager",
//   label: "Monitoring Visit",
//   path: "/forms/$formType",
//   params: { formType: "monitoring-visit" },
//   icon: Activity,
//   meta: {
//     tableColumns: monitoringVisitColumns,
//   }
// }),
