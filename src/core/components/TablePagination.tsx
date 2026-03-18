import { useReactTable } from "@tanstack/react-table"
import { useScrollArea } from "./ui/scroll-area";
import { Pagination } from "./Pagination";
import { useTablePagination } from "../hooks/useTablePagination";
import * as z from "zod/v4"

interface DefaultTablePaginationProps<T> { table: ReturnType<typeof useReactTable<T>> }

export const defaultPaginationSearchSchema = z.object({
  page: z.number().catch(1),
  pageSize: z.number().catch(10)
})

export function DefaultTablePagination<T>({ table }: DefaultTablePaginationProps<T>) {
  const { resetScroll } = useScrollArea();
  const {
    totalRows,
    maxPages,
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
      <Pagination.Input current={currentPage} total={maxPages} navigateFn={navigatePagination}/>
      <Pagination.SizeSelector value={pageSize} onValueChange={setPageSize} />
      <Pagination.TotalRows totalRows={totalRows} />
    </Pagination>
  )
}


interface ManualPaginationProps {
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange?: (newSize: number) => void;
  showSizeSelector?: boolean;
}

export function ManualPagination({
  page,
  pageSize,
  totalRows,
  onPageChange,
  onPageSizeChange,
  showSizeSelector = true,
}: ManualPaginationProps) {
  const totalPages = Math.ceil(totalRows / pageSize);

  return (
    <Pagination className="gap-2.5">
      <div className="space-x-1.5">
        <Pagination.Previous
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        />
        <Pagination.Next
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
        />
      </div>
      <Pagination.Input
        current={page + 1}
        total={totalPages}
        navigateFn={(newPage) => onPageChange(newPage - 1)}
      />
      {showSizeSelector && onPageSizeChange && (
        <Pagination.SizeSelector value={pageSize} onValueChange={onPageSizeChange} />
      )}
      <Pagination.TotalRows totalRows={totalRows} />
    </Pagination>
  );
}
