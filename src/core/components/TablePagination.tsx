import { useReactTable } from "@tanstack/react-table"
import { useScrollArea } from "./ui/scroll-area";
import { Pagination } from "./Pagination";
import { useTablePagination } from "../hooks/useTablePagination";

interface TablePaginationProps<T> { table: ReturnType<typeof useReactTable<T>> }

export function TablePagination<T>({ table }: TablePaginationProps<T>) {
  const { resetScroll } = useScrollArea();
  const {
    totalRows,
    pageCount,
    currentPage,
    navigatePagination,
    pageSize,
    setPageSize
  } = useTablePagination(table, resetScroll);

  return (
    <Pagination className="gap-2.5">
      <div className="space-x-1.5">
        <Pagination.Previous
          onClick={() => navigatePagination(currentPage - 1)}
          disabled={!table.getCanPreviousPage()}
        />
        <Pagination.Next
          onClick={() => navigatePagination(currentPage + 1)}
          disabled={!table.getCanNextPage()}
        />
      </div>
      <Pagination.Input current={currentPage} total={pageCount} navigateFn={navigatePagination}/>
      <Pagination.SizeSelector value={pageSize} onValueChange={setPageSize} />
      <Pagination.TotalRows totalRows={totalRows} />
    </Pagination>
  )
}
