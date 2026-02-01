import { createRouteConfig } from "@/core/tanstack/router/utils";
import { mfidTableColumns } from "@/features/mfid/components/MfidTable/MfidTableColumns";
import { FilePlus2, Import } from "lucide-react";

export const dataGroupConfig =
  createRouteConfig("data", {
    role: "data_manager",
    label: "Data",
    children: [

      createRouteConfig("mfid", {
        role: "data_manager",
        label: "Monitoring Field ID",
        path: "/mfid",
        icon: FilePlus2,
        meta: {
          tableColumns: mfidTableColumns
        }
      }),

      createRouteConfig("import-export", {
        role: "data_manager",
        label: "Import",
        path: "/import",
        icon: Import,
      }),
    ]
  })

