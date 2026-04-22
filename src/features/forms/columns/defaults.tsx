import { ColumnDef } from "@tanstack/react-table";
import { FormDataEntry } from "../schemas/formData";
import { StatusWithRetakeCell } from "@/core/components/cells/StatusWithRetakeCell";


export const defaultColumns: ColumnDef<FormDataEntry, any>[] = [
  {
    accessorKey: 'activity.verificationStatus',
    header: 'Status',
    cell: ({ row }) => <StatusWithRetakeCell row={row} />,
    filterFn: 'arrIncludesSome',
    meta: {
      size: '4xs',
      filterVariant: "options",
      filterOptions: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Imported', value: 'unknown' },
      ],
    },
  },
  // { accessorKey: 'season.year', header: 'Year', filterFn: 'equals', meta: { size: '4xs' } },
  {
    accessorKey: 'field.mfid',
    header: 'MFID',
    meta: { size: '3xs' }
  },
  {
    accessorKey: 'field.province',
    header: 'Province',
    filterFn: 'includesString',
    meta: {
      size: '3xs',
      filterVariant: 'options-search'
    }
  },
  {
    accessorKey: 'field.municipality',
    header: 'Municipality',
    meta: {
      size: '2xs',
      filterVariant: 'options-search'
    }
  },
  {
    accessorKey: 'field.barangay',
    header: 'Barangay',
    meta: {
      size: '2xs',
      filterVariant: 'options-search'
    }
  },
  // {
  //   accessorKey: 'season.syncedAt',
  //   header: 'Synced At',
  //   cell: (info) => Sanitizer.value(info.getValue()),
  //   meta: { size: '3xs' }
  // },
]
