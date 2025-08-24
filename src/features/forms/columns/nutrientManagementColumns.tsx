import { UnitCell } from "@/core/components/cells/UnitCell";
import { ColumnDef } from "@tanstack/react-table";
import { FormDataEntry } from "../schemas/formData";
import { defaultColumns } from "./defaults";

export const nutrientManagementColumns: ColumnDef<FormDataEntry, any>[] = [
  ...defaultColumns,
  {
    accessorKey: 'activity.formData.applied_area_sqm',
    header: 'Applied Area',
    cell: (info) => <UnitCell value={info.getValue()} unit="sqm" />,
    meta: { size: '2xs' }
  },
]
