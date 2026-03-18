
import { memo } from "react";
import { User } from "../../schemas";
import { useUserDetails } from "./UsersTable";
import { ViewActionCell } from "@/core/components/cells/ViewActionCell";

interface UserViewActionCellProps {
  user: User;
}

export const UserViewActionCell = memo(({ user }: UserViewActionCellProps) => {
  const { openDetails } = useUserDetails();

  return (
    <ViewActionCell
      label="View Details"
      onView={() => openDetails(user)}
    />
  );
});
