
import { getSupabase } from "@/core/supabase";
import { SystemAuditLog, ActivityLog } from "../types";

export class Logs {
  private static get _client() {
    return getSupabase();
  }

  static async getSystemAuditLogs(params: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 0, pageSize = 20, sortBy = 'occurred_at', sortOrder = 'desc' } = params;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const client = await this._client;

    const query = client
      .from('system_audit_logs_view')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    return { data: data as SystemAuditLog[], count: count ?? 0 };
  }

  static async getActivityLogs(params: {
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) {
    const { page = 0, pageSize = 20, sortBy = 'occurred_at', sortOrder = 'desc' } = params;
    const from = page * pageSize;
    const to = from + pageSize - 1;

    const client = await this._client;

    const query = client
      .from('activity_logs_view')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data as ActivityLog[], count: count ?? 0 };
  }
}
