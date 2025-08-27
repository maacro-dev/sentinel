import { Table } from "@tanstack/react-table";
import { useCallback, useEffect } from "react";
import { useLocation, useNavigate } from "@tanstack/react-router";
import { clampPageIndex, normalizePageSize } from "../tanstack/table/utils";

export function useTablePagination<TData>(
  table: Table<TData>,
  resetScroll: () => void
) {

  const totalRows = table.getCoreRowModel().rows.length;
  const maxPages = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageSize = table.getState().pagination.pageSize;
  const navigate = useNavigate()
  const { search } = useLocation()

  useEffect(() => {
    const { page, pageSize: rawSize } = search;
    const safePage = clampPageIndex(page, maxPages);

    if (currentPage !== safePage) {
      table.setPageIndex(safePage - 1);
    }

    if (pageSize !== rawSize) {
      table.setPageSize(normalizePageSize(rawSize));
    }

  }, [search, table, currentPage, pageSize, maxPages])


  const setPageSize = useCallback(
    (pageSize: number) => {
      table.setPageSize(pageSize);
      navigate({
        to: ".",
        search: (prev) => ({
          ...prev,
          page: 1,
          pageSize: pageSize,
        }),
      });
      resetScroll();
    },
    [navigate, resetScroll, table]
  );


  const navigatePagination = useCallback(
    (oneBased: number) => {
      const clamped = Math.min(Math.max(oneBased, 1), maxPages);

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
    [maxPages, resetScroll, table]
  );

  return {
    totalRows,
    maxPages,
    currentPage,
    navigatePagination,
    pageSize,
    setPageSize
  };
}
