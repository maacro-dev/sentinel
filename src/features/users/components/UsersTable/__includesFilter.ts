import { FilterFn } from "@tanstack/react-table";
import { formatRole } from "../../utils";

export const formattedIncludesFilter: FilterFn<any> = (row, columnId, value) => {

  if (typeof value !== 'string') return false;

  const search = value.toLowerCase();
  const raw = row.getValue(columnId);

  let formatted: string;

  if (raw == null) {
    formatted = '';
  } else if (columnId === 'role' && typeof raw === 'string') {
    formatted = formatRole(raw);
  } else {
    formatted = String(raw);
  }

  return formatted.toLowerCase().includes(search);
};

