import type { UserStatus } from "@/lib/types";

type StatusCellProps = {
  status: UserStatus;
};

export const StatusCell = ({ status }: StatusCellProps) => (
  <span
    className={`text-center px-3 py-1 text-xs  rounded-sm ${
      status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
    }`}
  >
    {status}
  </span>
);
