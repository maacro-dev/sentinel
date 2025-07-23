import { Badge, badgeVariants } from "@/core/components/ui/badge";
import { Role } from "@/features/users/schemas";
import { getRoleLabel } from "@/features/users/utils";
import { VariantProps } from "class-variance-authority";
import { memo } from "react";

const roleVariantMap: Record<
  Role,
  VariantProps<typeof badgeVariants>["variant"]
> = {
  admin: "default",
  data_manager: "secondary",
  data_collector: "outline",
  pending: "destructive"
};

export const RoleCell = memo(({ role }: { role: Role }) => {
  return (
    <Badge variant={roleVariantMap[role]} className="text-xs py-1.5 px-2">
      {getRoleLabel(role)}
    </Badge>
  )
})
