
import { useQuery } from '@tanstack/react-query';
import { systemAuditLogsOptions, activityLogsOptions } from '../queries/options';
import { Logs } from '../services/Logs';

export const useSystemAuditLogs = (params: Parameters<typeof Logs.getSystemAuditLogs>[0]) => {
  return useQuery(systemAuditLogsOptions(params));
};

export const useActivityLogs = (params: Parameters<typeof Logs.getActivityLogs>[0]) => {
  return useQuery(activityLogsOptions(params));
};
