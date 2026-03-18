
import { Logs } from '../services/Logs';

export const systemAuditLogsOptions = (params: Parameters<typeof Logs.getSystemAuditLogs>[0]) => ({
  queryKey: ['system-audit-logs', params] as const,
  queryFn: () => Logs.getSystemAuditLogs(params),
  staleTime: 1000 * 60 * 5, // 5 minutes
});

export const activityLogsOptions = (params: Parameters<typeof Logs.getActivityLogs>[0]) => ({
  queryKey: ['activity-logs', params] as const,
  queryFn: () => Logs.getActivityLogs(params),
  staleTime: 1000 * 60 * 5,
});
