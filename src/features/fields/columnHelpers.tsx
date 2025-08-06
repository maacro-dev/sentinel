import { ColumnHelper } from "@/core/components/utils/ColumnHelpers";
import { AccessorKeyColumnDef } from "@tanstack/react-table";

export const createMfidColumn = <T,>(
  columnHelper: ColumnHelper<T>
): AccessorKeyColumnDef<T,'mfid'> => {
  return columnHelper.accessor('mfid' as any, {
    header: () => "MFID",
    cell: info => info.getValue(),
    meta: { size: '2xs' },
  }) as AccessorKeyColumnDef<T,'mfid'>;
}
