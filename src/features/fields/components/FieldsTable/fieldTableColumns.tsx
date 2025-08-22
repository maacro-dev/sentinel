import { ColumnDef } from "@tanstack/react-table";
import { Field } from "../../schemas";
import { ViewActionCell } from "@/core/components/cells/ViewActionCell";

export const fieldTableColumns: ColumnDef<Field, any>[] = [
  { accessorKey: 'mfid', header: 'MFID', meta: { size: '2xs' } },
  { id: 'farmer', accessorFn: (r) => r.farmer_first_name + ' ' + r.farmer_last_name, header: 'Farmer', meta: { size: 'sm' } },
  { accessorKey: 'barangay', header: 'Barangay', meta: { size: 'sm' } },
  { accessorKey: 'municipality', header: 'Municipality', meta: { size: 'sm' } },
  { accessorKey: 'province', header: 'Province', meta: { size: 'sm' } },
  {
    id: "actions",
    header: 'Actions',
    cell: () => <ViewActionCell />,
    meta: { size: '2xs', textAlign: "center" }
  },
]

