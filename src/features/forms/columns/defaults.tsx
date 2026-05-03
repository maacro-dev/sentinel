import { ColumnDef } from "@tanstack/react-table";
import { FormDataEntry } from "../schemas/formData";
import { StatusWithRetakeCell } from "@/core/components/cells/StatusWithRetakeCell";
import { format } from "date-fns/format";
import { SeasonCell } from "@/core/components/cells/SeasonCell";

export type FormColumnDef = ColumnDef<FormDataEntry, any> & { seasonal?: boolean };

export const defaultColumns: FormColumnDef[] = [
  {
    accessorKey: 'activity.verificationStatus',
    header: 'Status',
    cell: ({ row }) => (
      <StatusWithRetakeCell
        verificationStatus={row.original.activity.verificationStatus}
        isRetake={row.original.activity.is_retake}
        originalId={row.original.activity.original_activity_id}
        formType={row.original.activity.type}
      />
    ),
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
  {
    accessorKey: 'activity.season_id',
    header: 'Season',
    cell: ({ row }) => <SeasonCell seasonId={row.original.season.id} />,
    meta: { size: '2xs' },
    seasonal: true,
  },
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
  {
    accessorKey: 'collection.collectedAt',
    cell: ({ row }) => format(new Date(row.original.collection.collectedAt), "MMM d, yyyy"),
    header: 'Collection Date',
    filterFn: 'dateRange',
    meta: {
      size: '2xs',
      filterVariant: 'date-preset',
    }
  },
]
