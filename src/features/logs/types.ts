
export interface SystemAuditLog {
  id: number;
  occurred_at: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  event_type: string;
  target_user_id: string | null;
  target_user_email: string | null;
  target_user_name: string | null;
  table_name: string | null;
  record_id: string | null;

  // might not show these in the main table
  action: string | null;
  details: any | null;
}

export interface ActivityLog {
  id: number;
  occurred_at: string;
  user_id: string | null;
  user_email: string | null;
  user_name: string | null;
  event_type: string;
  table_name: string | null;
  record_id: string | null;
  action: string | null;
  old_data: any | null;
  new_data: any | null;
  details: any | null;
}
