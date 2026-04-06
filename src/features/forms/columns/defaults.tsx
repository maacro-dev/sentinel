import { ColumnDef } from "@tanstack/react-table";
import { FormDataEntry } from "../schemas/formData";
import { SemesterCell } from "@/core/components/cells/SemesterCell";
import { Sanitizer } from "@/core/utils/sanitizer";
import { StatusWithRetakeCell } from "@/core/components/cells/StatusWithRetakeCell";


export const defaultColumns: ColumnDef<FormDataEntry, any>[] = [
  {
    accessorKey: 'activity.verificationStatus',
    header: 'Status',
    cell: ({ row }) => <StatusWithRetakeCell row={row} />,
    meta: { size: '3xs' },
  },
  { accessorKey: 'field.mfid', header: 'MFID', meta: { size: '3xs' } },
  { accessorKey: 'field.province', header: 'Province', meta: { size: '2xs' } },
  { accessorKey: 'field.municipality', header: 'Municipality', meta: { size: '2xs' } },
  { accessorKey: 'field.barangay', header: 'Barangay', meta: { size: '2xs' } },
  { accessorKey: 'season.year', header: 'Year', meta: { size: '2xs' } },
  {
    accessorKey: 'season.semester',
    header: 'Semester',
    cell: (info) => <SemesterCell value={info.getValue()} />,
    meta: { size: '2xs' }
  },
  {
    accessorKey: 'season.syncedAt',
    header: 'Synced At',
    cell: (info) => Sanitizer.value(info.getValue()),
    meta: { size: '3xs' }
  },
]
