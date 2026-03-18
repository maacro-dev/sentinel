import { PageContainer } from "@/core/components/layout";
import { createCrumbLoader } from "@/core/utils/breadcrumb";
import { createFileRoute } from "@tanstack/react-router";
import { Tabs, TabsList, TabsTrigger } from "@/core/components/ui/tabs";
import { useState, useMemo } from "react";
import { ColumnDef, SortingState } from "@tanstack/react-table";
import { format } from "date-fns";
import { Skeleton } from "@/core/components/ui/skeleton";
import { DataTable } from "@/core/components/DataTable";
import { ManualPagination } from "@/core/components/TablePagination";
import { useSystemAuditLogs, useActivityLogs } from "@/features/logs/hooks/useLogs";
import { SystemAuditLog, ActivityLog } from "@/features/logs/types";
import { getActivityDescription, getEventTypeLabel, getSystemAuditDescription } from "@/features/logs/utils";
import { DefaultTableToolbar } from "@/core/components/TableToolbar";
import { useDataTable } from "@/core/hooks";

export const Route = createFileRoute("/admin/_accessControl/security")({
  component: RouteComponent,
  loader: () => {
    return { breadcrumb: createCrumbLoader({ label: "System Security" }) }
  },
  head: () => ({
    meta: [{ title: "System Security | Humay" }],
  }),
});

function RouteComponent() {
  const [tab, setTab] = useState<'audit' | 'activity'>('audit');
  const [auditPage, setAuditPage] = useState(0);
  const [activityPage, setActivityPage] = useState(0);
  const pageSize = 20; // fixed, but could be state if you want to allow change
  const [auditSorting, setAuditSorting] = useState<SortingState>([{ id: 'occurred_at', desc: true }]);
  const [activitySorting, setActivitySorting] = useState<SortingState>([{ id: 'occurred_at', desc: true }]);

  const auditParams = {
    page: auditPage,
    pageSize,
    sortBy: auditSorting[0]?.id || 'occurred_at',
    sortOrder: auditSorting[0] ? (auditSorting[0].desc ? 'desc' as const : 'asc' as const) : undefined,
  };
  const activityParams = {
    page: activityPage,
    pageSize,
    sortBy: activitySorting[0]?.id || 'occurred_at',
    sortOrder: activitySorting[0] ? (activitySorting[0].desc ? 'desc' as const : 'asc' as const) : undefined,
  };

  const { data: auditData, isLoading: auditLoading } = useSystemAuditLogs(auditParams);
  const { data: activityData, isLoading: activityLoading } = useActivityLogs(activityParams);

  const auditColumns: ColumnDef<SystemAuditLog>[] = useMemo(() => [
    {
      accessorKey: 'occurred_at',
      header: 'Time',
      cell: ({ row }) => format(new Date(row.original.occurred_at), 'MMMM d, yyyy h:mm a'),
      meta: { size: "2xs" }
    },
    {
      accessorKey: 'event_type',
      header: 'Event',
      cell: ({ row }) => getEventTypeLabel(row.original.event_type),
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
      cell: ({ row }) => row.original.target_user_name || row.original.target_user_email || '-',
      meta: { size: "2xs" }
    },
    {
      id: 'description',
      header: 'Description',
      cell: ({ row }) => getSystemAuditDescription(row.original),
      meta: { size: "xl" }
    },
  ], []);

  const activityColumns: ColumnDef<ActivityLog>[] = useMemo(() => [
    {
      accessorKey: 'occurred_at',
      header: 'Time',
      cell: ({ row }) => format(new Date(row.original.occurred_at), 'yyyy-MM-dd HH:mm:ss'),
    },
    {
      accessorKey: 'user_name',
      header: 'User',
      cell: ({ row }) => row.original.user_name || row.original.user_email || '-',
    },
    {
      accessorKey: 'event_type',
      header: 'Event',
    },
    {
      accessorKey: 'table_name',
      header: 'Table',
    },
    {
      accessorKey: 'record_id',
      header: 'Record ID',
      cell: ({ row }) => row.original.record_id ? row.original.record_id.slice(0, 8) + '…' : '-',
    },
    {
      id: 'description',
      header: 'Description',
      cell: ({ row }) => getActivityDescription(row.original),
    },
  ], []);

  const auditTable = useDataTable({
    data: auditData?.data ?? [],
    columns: auditColumns,
  });

  const activityTable = useDataTable({
    data: activityData?.data ?? [],
    columns: activityColumns,
  });

  return (
    <PageContainer className="gap-4">
      <div className="h-62 grid auto-rows-min gap-4 md:grid-cols-3">
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
        <div className="bg-muted/50 aspect-video rounded-xl" />
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as 'audit' | 'activity')} className="">
        <TabsList variant="line">
          <TabsTrigger value="audit">System Audit Logs</TabsTrigger>
          <TabsTrigger value="activity">Activity Logs</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === 'audit' && (
        auditLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <DataTable
            table={auditTable}
            getRowHeight={() => 'h-28'}
            pagination={
              <ManualPagination
                page={auditPage}
                pageSize={pageSize}
                totalRows={auditData?.count ?? 0}
                onPageChange={setAuditPage}
              />
            }
            toolbar={
              <DefaultTableToolbar
                onSearchChange={e => auditTable.setGlobalFilter(e.target.value)}
              />
            }
          />
        )
      )}

      {tab === 'activity' && (
        activityLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <DataTable
            table={activityTable}
            pagination={
              <ManualPagination
                page={activityPage}
                pageSize={pageSize}
                totalRows={activityData?.count ?? 0}
                onPageChange={setActivityPage}
              />
            }
          />
        )
      )}
    </PageContainer>
  );
}
