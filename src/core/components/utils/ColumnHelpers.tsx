import { AccessorKeyColumnDef, createColumnHelper } from "@tanstack/react-table";
import { ViewActionCell } from "../cells/ViewActionCell";

export type ColumnHelper<T> = ReturnType<typeof createColumnHelper<T>>;

export const createMfidColumn = <T,>(
  columnHelper: ColumnHelper<T>
): AccessorKeyColumnDef<T,'mfid'> => {
  return columnHelper.accessor('mfid' as any, {
    header: () => "MFID",
    cell: info => info.getValue(),
    meta: { size: '2xs' },
  }) as AccessorKeyColumnDef<T,'mfid'>;
}

export const createViewActionColumn = <T,>(
  columnHelper: ColumnHelper<T>
): AccessorKeyColumnDef<T,'actions'> =>  {
  return columnHelper.display({
    id: "actions",
    cell: () => <ViewActionCell />,
    meta: {
      size: "xs",
      textAlign: "center",
    }
  }) as AccessorKeyColumnDef<T,'actions'>;
}
