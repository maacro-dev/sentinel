import {
  TableHeader,
  Table,
  TableRow,
  TableHead,
  TableBody,
  TableCell
} from "@/core/components/ui/table";
import { flexRender, useReactTable } from "@tanstack/react-table";
import { ScrollArea, ScrollAreaProvider, ScrollBar } from "@/core/components/ui/scroll-area";
import { getSizeClass } from "../tanstack/table/size";
import { cn } from "../utils/style";

export interface DataTableEvents<T> {
  onRowClick?: (row: T) => void
  onRowIntent?: (row: T) => void
}

export interface DataTableProps<T> extends DataTableEvents<T> {
  table: ReturnType<typeof useReactTable<T>>
  title?: React.ReactNode
  toolbar?: React.ReactNode
  secondaryToolbar?: React.ReactNode
  isLoading?: boolean
  pagination?: React.ReactNode
}

export const DataTable = <T,>({
  table,
  title,
  toolbar,
  secondaryToolbar,
  pagination,
  onRowClick,
  onRowIntent
}: DataTableProps<T>) => {

  const rows = table.getRowModel().rows

  return (
    <ScrollAreaProvider>
      <div className="flex-1 flex flex-col min-h-0 min-w-0 rounded-container border">
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
        <ScrollArea className="h-full flex-1 min-h-0 whitespace-nowrap">
          <Table className="min-w-full table-fixed">
            <TableHeader>
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header, _index) => (
                    <TableHead
                      key={header.id}
                      className={`min-w-0 relative whitespace-normal text-3xs font-normal pl-6 pr-0`}
                      style={{
                        textAlign: header.column.columnDef.meta?.textAlign || 'left',
                        width: getSizeClass(header.column.columnDef.meta?.size)
                      }}
                    >
                      <div className="truncate">
                        {header.isPlaceholder ? null :
                          flexRender(header.column.columnDef.header, header.getContext())
                        }
                      </div>
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody >
              {rows.length === 0 ? <EmptyTableRow colSpan={table.getHeaderGroups()[0].headers.length} /> :
                rows.map((row) => (
                  <TableRow
                    key={row.id}
                    selected={row.getIsSelected()}
                    className={cn(
                      `[&:last-child_td]:border-b z-10`,
                      onRowClick && "cursor-pointer"
                    )}
                    onMouseEnter={() => {
                      if (onRowIntent) { onRowIntent(row.original); }
                    }}
                    onClick={(e) => {
                      if (onRowClick) { onRowClick(row.original); }
                      const handler = row.getToggleSelectedHandler();
                      handler(e)
                    }}
                  >
                    {row.getVisibleCells().map(cell => {
                      const cellWidth = getSizeClass(cell.column.columnDef.meta?.size)

                      return <TableCell
                        key={cell.id}
                        className={`pl-6 pr-0 text-muted-foreground text-3xs h-[82px]`}
                        align={cell.column.columnDef.meta?.textAlign || 'left'}
                        style={{ width: cellWidth, minWidth: cellWidth }}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    })}
                  </TableRow>
                )
                )}
            </TableBody>
          </Table>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        {pagination && pagination}
      </div>
    </ScrollAreaProvider>
  )
};

const EmptyTableRow = ({ colSpan }: { colSpan: number | undefined }) => {
  return (
    <TableRow className="hover:bg-transparent even:bg-red-50 border-b-transparent h-60">
      <TableCell
        colSpan={colSpan}
        className="text-center text-xs text-muted-foreground min-h-56 py-8"
      >
        <div className="flex flex-col gap-4 h-full">
          <h1 className="text-3xl font-medium tracking-widest">(つ•̀ꞈ•̀)つ</h1>
          <span className="text-muted-foreground/60">No results found</span>
        </div>
      </TableCell>
    </TableRow>
  )
}
