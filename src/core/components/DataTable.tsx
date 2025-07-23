import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/core/components/ui/table";
import {
  flexRender,
  useReactTable,
} from "@tanstack/react-table";
import { ScrollArea } from "@/core/components/ui/scroll-area";

export interface DataTableProps<T>{
  table: ReturnType<typeof useReactTable<T>>
  title?: React.ReactNode
  toolbar?: React.ReactNode
  secondaryToolbar?: React.ReactNode
  emptyState?: React.ReactNode
  isLoading?: boolean
  pagination?: React.ReactNode
  onRowClick?: (row: T) => void
}

export function DataTable<T>({
  table,
  title,
  toolbar,
  secondaryToolbar,
  emptyState,
}: DataTableProps<T>) {
  const rows = table.getRowModel().rows

  return (
    <div className="flex-1 flex flex-col min-h-0 rounded-md border">
      {(title || toolbar) && (
        <div className="w-full flex justify-between items-center p-4 gap-2">
          {title && typeof title === 'string' ? <span className="text-2xl font-semibold">{title}</span> : title}
          {toolbar}
        </div>
      )}
      {secondaryToolbar && (
        <div className="content">
          {secondaryToolbar}
        </div>
      )}
      <ScrollArea className="h-full flex-1 min-h-0" type="scroll">
        <Table className="w-full table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead
                    key={header.id}
                    style={{ width: header.column.getSize() }}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={table.getHeaderGroups()[0].headers.length}
                  className="text-center"
                >
                  {emptyState || 'No results.'}
                </TableCell>
              </TableRow>
            ) :
              rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell
                      key={cell.id}
                      className="text-muted-foreground text-xs"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  )
}
