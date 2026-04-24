import { ColumnDef } from "@tanstack/react-table";
import { MfidTableRow } from "../../schemas/mfid-table.schema";
import { StatusCell } from "./cells/Status";
import { CheckCircle2 } from "lucide-react";

export const mfidTableColumns: ColumnDef<MfidTableRow, any>[] = [
  {
    accessorKey: 'status',
    header: 'Status',
    cell: (info) => <StatusCell status={info.getValue()} />,
    filterFn: 'arrIncludesSome',
    meta: {
      size: '3xs',
      filterVariant: "options",
      filterOptions: [
        { label: 'Assigned', value: 'assigned' },
        { label: 'Available', value: 'available' },
      ],
    }
  },
  { accessorKey: 'mfid', header: 'MFID', meta: { size: '3xs' } },
  {
    accessorKey: 'farmer_name',
    header: 'Farmer',
    cell: (info) => info.getValue() ?? 'N/A',
    meta: { size: 'sm' }
  },
  {
    accessorKey: 'province',
    header: 'Province',
    cell: (info) => info.getValue() ?? 'N/A',
    filterFn: 'arrIncludesSome',
    meta: {
      size: '2xs',
      filterVariant: 'options-search'
    }
  },
  {
    accessorKey: 'city_municipality',
    header: 'Municipality / City',
    cell: (info) => info.getValue() ?? 'N/A',
    filterFn: 'arrIncludesSome',
    meta: {
      size: 'xs',
      filterVariant: 'options-search'
    }
  },
  {
    accessorKey: 'barangay',
    header: 'Barangay',
    cell: (info) => info.getValue() ?? 'N/A',
    filterFn: 'arrIncludesSome',
    meta: {
      size: 'xs',
      filterVariant: 'options-search'
    }
  },
  {
    accessorKey: 'has_scheduling',
    header: 'Scheduled',
    cell: ({ row }) => (
      <div className="w-12 flex justify-center">
        {row.original.has_scheduling ? (
          <CheckCircle2 className="h-4 w-4 text-green-600" />
        ) : (
          <span className="text-xs text-muted-foreground/50">—</span>
        )}
      </div>
    ),
    filterFn: 'equals',
    meta: {
      size: '2xs',
      filterVariant: 'boolean',
    },
  }
]
