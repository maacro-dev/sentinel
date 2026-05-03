import { getActivityTypeLabel } from "@/features/forms/utils";
import { ColumnDef } from "@tanstack/react-table";
import { CollectionTask } from "../../schemas/collection.schema";
import { format } from "date-fns";
import { capitalizeFirst } from "@/core/utils/string";
import { StatusWithRetakeCell } from "@/core/components/cells/StatusWithRetakeCell";
import { CollectionStatusCell } from "@/core/components/cells/VerificationStatusCell";
import { SeasonCell } from "@/core/components/cells/SeasonCell";

type CollectionColumnDef = ColumnDef<CollectionTask> & { seasonal?: boolean };

export const collectionTableColumns: CollectionColumnDef[] = [
  {
    accessorKey: "activity_type",
    header: "Form",
    cell: ({ row }) => {
      return getActivityTypeLabel(row.original.activity_type)
    },
    filterFn: 'arrIncludesSome',
    meta: {
      size: 'sm',
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
    accessorKey: "status",
    header: "Collection Status",
    cell: ({ row }) => {
      return row.original.is_overdue ? (
        <CollectionStatusCell variant="overdue">Overdue</CollectionStatusCell>
      ) : (
        <CollectionStatusCell variant={row.original.status === "completed" ? "completed" : "pending"}>
          {capitalizeFirst(row.original.status)}
        </CollectionStatusCell>
      )
    },
    filterFn: 'arrIncludesSome',
    meta: {
      size: 'sm',
      filterVariant: "options",
      filterOptions: [
        { label: 'Completed', value: 'completed' },
        { label: 'Pending', value: 'pending' },
      ],
    }
  },
  {
    accessorKey: 'verification_status',
    header: 'Verification Status',
    cell: ({ row }) => (
      <StatusWithRetakeCell
        verificationStatus={row.original.verification_status}
        isRetake={row.original.is_retake}
        originalId={row.original.original_activity_id}
        formType={row.original.activity_type}
      />
    ),
    filterFn: 'arrIncludesSome',
    meta: {
      size: "sm",
      filterVariant: "options",
      filterOptions: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Imported', value: 'unknown' },
      ],
    }
  },
  {
    accessorKey: "season_id",
    header: "Season",
    cell: ({ row }) => <SeasonCell seasonId={row.original.season_id} />,
    meta: { size: "sm" },
    seasonal: true
  },
  {
    accessorKey: "mfid",
    header: "MFID",
    meta: { size: '2xs' }
  },
  {
    accessorKey: "farmer_name",
    header: "Farmer",
    meta: { size: 'sm' }
  },
  {
    accessorKey: "collector_name",
    header: "Data Collector",
    cell: ({ row }) => row.original.collector_name ?? "Unassigned",
    meta: { size: 'sm' }
  },
  {
    accessorKey: "start_date",
    header: "Start Date",
    cell: ({ row }) => format(new Date(row.original.start_date), "MMM d, yyyy"),
    filterFn: 'dateRange',
    meta: {
      size: 'xs',
      filterVariant: 'date-preset',
    }
  },
  {
    accessorKey: "end_date",
    header: "End Date",
    cell: ({ row }) => format(new Date(row.original.end_date), "MMM d, yyyy"),
    filterFn: 'dateRange',
    meta: {
      size: 'xs',
      filterVariant: 'date-preset',
    }
  },
]

export function getCollectionTableColumns(showSeasonColumn: boolean): ColumnDef<CollectionTask>[] {
  return collectionTableColumns.filter(col => !col.seasonal || showSeasonColumn);
}
