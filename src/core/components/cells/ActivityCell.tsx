import { getActivityTypeLabel } from "@/features/forms/utils";

export const ActivityCell = ({ row }: { row: any }) => {
  const activityType = row.original.activity.type;
  return <span>{getActivityTypeLabel(activityType)}</span>;
};
