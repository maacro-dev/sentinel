import { Badge, badgeVariants } from "@/core/components/ui/badge";
import { VariantProps } from "class-variance-authority";
import { memo } from "react";

const statusMap: Record<"assigned" | "available", VariantProps<typeof badgeVariants>["variant"]> = {
  assigned: "outline",
  available: "secondary",
};

export const StatusCell = memo(({ status }: { status: "assigned" | "available" }) => {
  return (
    <Badge variant={statusMap[status]} className="text-3xs py-1.5 px-2">
      {status === "assigned" ? "Assigned" : "Available"}
    </Badge>
  )
})
