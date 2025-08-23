import { Table } from "@tanstack/react-table";
import { useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";

export function useTablePagination<TData>(
  table: Table<TData>,
  resetScroll: () => void
) {
  const totalRows = table.getCoreRowModel().rows.length;
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageSize = table.getState().pagination.pageSize;
  const navigate = useNavigate()

  const setPageSize = useCallback(
    (size: number) => {
      table.setPageSize(size);
      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          page: 1,
          pageSize: size,
        }),
      });
      resetScroll();
    },
    [navigate, resetScroll, table]
  );


  const navigatePagination = useCallback(
    (oneBased: number) => {
      const clamped = Math.min(Math.max(oneBased, 1), pageCount);
      table.setPageIndex(clamped - 1);
      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          page: clamped,
        }),
      });
      resetScroll();
    },
    [pageCount, resetScroll, table]
  );

  return {
    totalRows,
    pageCount,
    currentPage,
    navigatePagination,
    pageSize,
    setPageSize
  };
}
