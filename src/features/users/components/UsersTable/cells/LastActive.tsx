import { memo } from "react";

export const LastActiveCell = memo(({ lastActive }: { lastActive: Date | null }) => (
  <span className="text-xs text-muted-foreground">
    {lastActive
      ? lastActive.toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "Never"}
  </span>
));
