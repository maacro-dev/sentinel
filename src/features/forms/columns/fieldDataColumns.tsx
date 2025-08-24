import { UnitCell } from "@/core/components/cells/UnitCell";
import { ColumnDef } from "@tanstack/react-table";
import { FormDataEntry } from "../schemas/formData";
import { defaultColumns } from "./defaults";

export const fieldDataColumns: ColumnDef<FormDataEntry, any>[] = [
  ...defaultColumns,
  {
    accessorKey: 'activity.formData.total_field_area_ha',
    header: 'Field Area',
    cell: (info) => <UnitCell value={info.getValue()} unit="ha" />,
    meta: { size: '2xs' }
  },
]
