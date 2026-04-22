import { getActivityTypeLabel } from "@/features/forms/utils";
import { ColumnDef } from "@tanstack/react-table";
import { CollectionTask } from "../../schemas/collection.schema";
import { format } from "date-fns";
import { Badge } from "@/core/components/ui/badge";
import { capitalizeFirst } from "@/core/utils/string";
import { CollectionStatusWithRetakeCell } from "@/core/components/cells/StatusWithRetakeCell";

export const collectionTableColumns: ColumnDef<CollectionTask>[] = [
  {
    accessorKey: "activity_type",
    header: "Form",
    cell: ({ row }) => {
      return getActivityTypeLabel(row.original.activity_type)
    },
    filterFn: 'arrIncludesSome',
    meta: {
      size: 'xs',
      filterVariant: "options",
      filterOptions: [
        { label: 'Field Data', value: 'field-data' },
        { label: 'Cultural Management', value: 'cultural-management' },
        { label: 'Nutrient Management', value: 'nutrient-management' },
        { label: 'Production', value: 'production' },
        { label: 'Damage Assessment', value: 'damage-assessment' },
      ],
    }
  },
  {
    accessorKey: "mfid",
    header: "MFID",
    meta: { size: '2xs' }
  },
  {
    accessorKey: "farmer_name",
    header: "Farmer",
  },
  {
    accessorKey: "collector_name",
    header: "Data Collector",
    cell: ({ row }) => row.original.collector_name ?? "Unassigned"
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => format(new Date(row.original.start_date), "MMM d, yyyy"),
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => format(new Date(row.original.end_date), "MMM d, yyyy"),
  },
  {
    accessorKey: "status",
    header: "Collection Status",
    cell: ({ row }) => {
      return row.original.is_overdue ? (<Badge variant="destructive">Overdue</Badge>) : (
        <Badge variant={row.original.status === "completed" ? "default" : "warning"}>
          {capitalizeFirst(row.original.status)}
        </Badge>
      )
    },
  },
  {
    accessorKey: 'verification_status',
    header: 'Verification Status',
    cell: ({ row }) => <CollectionStatusWithRetakeCell row={row} />,
  },
]
