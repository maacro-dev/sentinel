import { createColumnHelper } from "@tanstack/react-table";
import { Field } from "../../schemas";
import { createMfidColumn } from "../../columnHelpers";
import { createViewActionColumn } from "@/core/components/utils/ColumnHelpers";

const columnHelper = createColumnHelper<Field>();

export const FieldColumns = [
  createMfidColumn(columnHelper),
  columnHelper.accessor(r => r.farmer_first_name + ' ' + r.farmer_last_name, {
    id: 'farmer',
    header: () => 'Farmer',
  }),
  columnHelper.accessor('barangay', {
    cell: (info) => info.getValue(),
    header: () => 'Barangay',
  }),
  columnHelper.accessor('municipality', {
    cell: (info) => info.getValue(),
    header: () => 'Municipality',
  }),
  columnHelper.accessor('province', {
    cell: (info) => info.getValue(),
    header: () => 'Province',
  }),
  createViewActionColumn(columnHelper)
]
