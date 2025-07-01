type LastActiveCellProps = {
  lastActive: string | null;
};

export const LastActiveCell = ({ lastActive }: LastActiveCellProps) => (
  <span className="text-xs text-muted-foreground">
    {lastActive
      ? new Date(lastActive).toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      : "Never"}
  </span>
);
