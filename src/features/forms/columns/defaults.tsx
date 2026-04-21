import { ColumnDef } from "@tanstack/react-table";
import { FormDataEntry } from "../schemas/formData";
import { Sanitizer } from "@/core/utils/sanitizer";
import { StatusWithRetakeCell } from "@/core/components/cells/StatusWithRetakeCell";


export const defaultColumns: ColumnDef<FormDataEntry, any>[] = [
  {
    accessorKey: 'activity.verificationStatus',
    header: 'Status',
    cell: ({ row }) => {
      console.log("row", JSON.stringify(row.original, null, 2))
      return <StatusWithRetakeCell row={row} />
    },
    filterFn: 'arrIncludesSome',
    meta: {
      size: '3xs',
      filterVariant: "options",
      filterOptions: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Imported', value: 'unknown' },
      ],
    },
  },
  { accessorKey: 'season.year', header: 'Year', filterFn: 'equals', meta: { size: '3xs' } },
  { accessorKey: 'field.mfid', header: 'MFID', meta: { size: '3xs' } },
  {
    accessorKey: 'field.province',
    header: 'Province',
    filterFn: 'includesString', // fuzzy
    meta: { size: '3xs' }
  },
  { accessorKey: 'field.municipality', header: 'Municipality', meta: { size: '2xs' } },
  { accessorKey: 'field.barangay', header: 'Barangay', meta: { size: '2xs' } },
  {
    accessorKey: 'season.syncedAt',
    header: 'Synced At',
    cell: (info) => Sanitizer.value(info.getValue()),
    meta: { size: '3xs' }
  },
]
