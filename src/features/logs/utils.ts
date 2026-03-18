import { SystemAuditLog, ActivityLog } from "./types";

export function getEventTypeLabel(evt: string): string {
  switch(evt) {
    case 'users_created': return "User Create"
    default:
      return evt
  }
}

export function getSystemAuditDescription(log: SystemAuditLog): string {
  switch (log.event_type) {
    case 'users_created':
      const role = log.details?.new_data?.role || 'unknown';
      const targetName = log.target_user_name || log.target_user_email || 'a new user';
      return `Created ${targetName} account with role "${role}".`;
    case 'users_updated':
      const changes = [];
      if (log.details?.old_data && log.details?.new_data) {
        // Compare old and new to list changed fields (optional)
        const changedFields = Object.keys(log.details.new_data).filter(
          key => JSON.stringify(log.details.old_data[key]) !== JSON.stringify(log.details.new_data[key])
        );
        if (changedFields.includes('role')) {
          changes.push(`role: ${log.details.old_data.role} → ${log.details.new_data.role}`);
        }
        if (changedFields.includes('first_name') || changedFields.includes('last_name')) {
          changes.push('name updated');
        }
      }
      const changeText = changes.length ? ` (${changes.join(', ')})` : '';
      return `Updated user ${log.target_user_name || log.target_user_email || log.target_user_id}${changeText}.`;
    case 'users_deleted':
      const deletedUser = log.target_user_name || log.target_user_email || log.target_user_id;
      return `Deleted user ${deletedUser}.`;
    case 'login_success':
      return `User ${log.user_name || log.user_email || 'unknown'} logged in successfully.`;
    case 'login_failure':
      return `Failed login attempt for user ${log.user_name || log.user_email || log.user_id || 'unknown'}.`;
    default:
      if (log.table_name && log.action) {
        return `${log.action} on ${log.table_name} (ID: ${log.record_id || '?'})`.replace(/_/g, ' ');
      }
      return log.event_type.replace(/_/g, ' ');
  }
}

export function getActivityDescription(log: ActivityLog): string {
  switch (log.event_type) {
    case 'farmers_created':
      const firstName = log.new_data?.first_name || '';
      const lastName = log.new_data?.last_name || '';
      return `Added farmer ${firstName} ${lastName}`.trim() || 'Created new farmer.';
    case 'farmers_updated':
      return `Updated farmer record ${log.record_id}.`;
    case 'fields_created':
      const mfid = log.new_data?.mfid || log.record_id;
      return `Created new field with MFID ${mfid}.`;
    case 'fields_updated':
      return `Updated field ${log.record_id}.`;
    case 'field_activities_created':
      return `Submitted ${log.table_name} form (ID: ${log.record_id}).`;
    case 'field_activities_updated':
      if (log.new_data?.verification_status && log.old_data?.verification_status !== log.new_data?.verification_status) {
        return `Form ${log.record_id} ${log.new_data.verification_status}.`;
      }
      return `Updated ${log.table_name} form (ID: ${log.record_id}).`;
    case 'field_activities_deleted':
      return `Deleted ${log.table_name} form (ID: ${log.record_id}).`;
    case 'import_started':
      const batchId = log.details?.import_batch_id || '';
      return `Started data import (batch: ${batchId})`.trim();
    case 'import_completed':
      return `Completed data import.`;
    case 'import_failed':
      return `Data import failed.`;
    default:
      if (log.table_name && log.action) {
        return `${log.action} on ${log.table_name} (ID: ${log.record_id || '?'})`.replace(/_/g, ' ');
      }
      return log.event_type.replace(/_/g, ' ');
  }
}
