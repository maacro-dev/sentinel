import { createColumnHelper } from "@tanstack/react-table";
import { Field } from "../../schemas";

const columnHelper = createColumnHelper<Field>();
export const FieldColumns = [
  columnHelper.accessor('mfid', {
    cell: (info) => info.getValue(),
    header: () => 'MFID',
  }),
  columnHelper.accessor(r => r.farmer_first_name + ' ' + r.farmer_last_name, {
    id: 'farmer',
    cell: (info) => info.getValue(),
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
]
