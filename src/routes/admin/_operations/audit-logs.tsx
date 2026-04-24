
import { PageContainer } from "@/core/components/layout";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { format } from "date-fns";
import { Skeleton } from "@/core/components/ui/skeleton";
import { DataTable } from "@/core/components/DataTable";
import { defaultPaginationSearchSchema, ManualPagination } from "@/core/components/TablePagination";
import { useSystemAuditLogs } from "@/features/logs/hooks/useLogs";
import { SystemAuditLog } from "@/features/logs/types";
import { getSystemAuditDescription } from "@/features/logs/utils";
import { DefaultTableToolbar } from "@/core/components/TableToolbar";
import { useDataTable } from "@/core/hooks";
import { EventTypeBadge } from "@/features/logs/components/EventTypeBadge";

export const Route = createFileRoute("/admin/_operations/audit-logs")({
  component: AuditLogsPage,
  validateSearch: defaultPaginationSearchSchema,
  loader: () => ({ breadcrumb: createCrumbLoader({ label: "System Audit" }) }),
  head: () => ({ meta: [{ title: "System Audit Logs | Humay" }] }),
});

function AuditLogsPage() {
  const [page, setPage] = useState(0);
  const [sorting, _setSorting] = useState<SortingState>([{ id: 'occurred_at', desc: true }]);
  const { pageSize } = Route.useSearch()

  const params = {
    page,
    pageSize,
    sortBy: sorting[0]?.id || 'occurred_at',
    sortOrder: sorting[0]?.desc ? 'desc' as const : 'asc' as const,
  };

  const { data, isLoading } = useSystemAuditLogs(params);

  const columns: ColumnDef<SystemAuditLog>[] = [
    {
      accessorKey: 'occurred_at',
      header: 'Time',
      cell: ({ row }) => format(new Date(row.original.occurred_at), 'MMMM d, yyyy h:mm a'),
      meta: { size: "2xs" }
    },
    {
      accessorKey: 'event_type',
      header: 'Event',
      cell: ({ row }) => <EventTypeBadge eventType={row.original.event_type} />,
      meta: { size: "3xs" }
    },
    {
      accessorKey: 'user_name',
      header: 'Actor',
      cell: ({ row }) => row.original.user_id === null ? "System" : row.original.user_name || row.original.user_email || '-',
      meta: { size: "2xs" }
    },
    {
      accessorKey: 'target_user_name',
      header: 'Target User',
      cell: ({ row }) => {
        const log = row.original;
        const target = log.target_user_name || log.target_user_email;
        const hasTarget = ['users_created', 'users_updated', 'users_deleted'].includes(log.event_type);
        if (!hasTarget) return null;
        return target || '—';
      },
      meta: { size: "2xs" }
    },
    {
      id: 'description',
      header: 'Description',
      cell: ({ row }) => getSystemAuditDescription(row.original),
      meta: { size: "xl" }
    },
  ];

  const table = useDataTable({
    data: data?.data ?? [],
    columns,
  });

  return (
    <PageContainer className="gap-4">
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <DataTable
          table={table}
          // getRowHeight={() => 'h-28'}
          pagination={
            <ManualPagination
              page={page}
              pageSize={pageSize}
              totalRows={data?.count ?? 0}
              onPageChange={setPage}
              selectedRows={table.getPreSelectedRowModel().rows.length}
              unfilteredRows={table.getCoreRowModel().rows.length}
            />
          }
          toolbar={
            <DefaultTableToolbar
              onSearchChange={e => table.setGlobalFilter(e.target.value)}
            />
          }
        />
      )}
    </PageContainer>
  );
}
