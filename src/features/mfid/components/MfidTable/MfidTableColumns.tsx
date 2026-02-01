import { ColumnDef } from "@tanstack/react-table";
import { MfidTableRow } from "../../schemas/mfid-table.schema";
import { StatusCell } from "./cells/Status";

export const mfidTableColumns: ColumnDef<MfidTableRow, any>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => <StatusCell status={info.getValue()} />,
    meta: { size: '3xs' }
  },
  { accessorKey: 'mfid', header: 'MFID', meta: { size: '3xs' } },
  { accessorKey: 'farmer_name', header: 'Farmer', meta: { size: 'sm' } },
  { accessorKey: 'province', header: 'Province', meta: { size: '2xs' } },
  { accessorKey: 'city_municipality', header: 'Municipality / City', meta: { size: 'xs' } },
  { accessorKey: 'barangay', header: 'Barangay', meta: { size: 'xs' } },
]
