import { SystemAuditLog, ActivityLog } from "./types";

// export function getEventTypeLabel(evt: string): string {
//   switch (evt) {
//     case 'users_created': return "CREATE"
//     case 'users_updated': return "UPDATE"
//     case 'users_deleted': return "DELETE"
//     case 'login': return "LOGIN"
//     case 'logout': return "LOGOUT"
//     case 'user_recovery_requested': return "RECOVERY"
//     case 'backup_restored': return "RESTORE"
//     case 'backup_downloaded': return "BACKUP"
//     default:
//       return evt
//   }
// }

export function getSystemAuditDescription(log: SystemAuditLog): string {
  const actor = log.user_name || log.user_email || log.user_id || 'Unknown user';
  const target = log.target_user_name || log.target_user_email || log.target_user_id;

  switch (log.event_type) {
    case 'users_created': {
      const role = log.details?.new_data?.role || 'unknown';
      const displayName = target || 'a new user';
      return `Created account for ${displayName} (role: ${role}).`;
    }

    case 'users_updated': {
      const userName = target || 'a user';
      const changes: string[] = [];

      if (log.details?.old_data && log.details?.new_data) {
        const oldData = log.details.old_data;
        const newData = log.details.new_data;

        if (oldData.role !== newData.role) {
          changes.push(`changed role from ${oldData.role} to ${newData.role}`);
        }

        const oldFullName = `${oldData.first_name || ''} ${oldData.last_name || ''}`.trim();
        const newFullName = `${newData.first_name || ''} ${newData.last_name || ''}`.trim();
        if (oldFullName !== newFullName) {
          changes.push(`renamed from "${oldFullName || '—'}" to "${newFullName || '—'}"`);
        }

        if (oldData.is_active !== newData.is_active) {
          changes.push(newData.is_active ? 'activated account' : 'deactivated account');
        }
      }

      if (changes.length === 0) {
        return `Updated account for ${userName} (no details available).`;
      }

      let changeText: string;
      if (changes.length === 1) {
        changeText = changes[0];
      } else if (changes.length === 2) {
        changeText = `${changes[0]} and ${changes[1]}`;
      } else {
        const last = changes.pop();
        changeText = `${changes.join(', ')} and ${last}`;
      }

      return `${changeText.charAt(0).toUpperCase() + changeText.slice(1)} for ${userName}.`;
    }

    case 'users_deleted': {
      const deletedUser = target || 'a user';
      return `Deleted account for ${deletedUser}.`;
    }

    case 'login': {
      return `${actor} logged in.`;
    }

    case 'logout': {
      return `${actor} logged out.`;
    }

    case 'login_failure': {
      return `Failed login attempt for ${actor}.`;
    }

    case 'user_recovery_requested': {
      return `Password recovery requested for ${actor}.`;
    }

    case 'backup_downloaded': {
      const tables = log.details?.tables_included?.length || 0;
      const rows = log.details?.total_rows || 0;
      return `${actor} downloaded a full database backup (${tables} tables, ${rows} rows).`;
    }

    case 'backup_restored': {
      const tables = log.details?.tables_restored?.length || 0;
      const rows = log.details?.total_rows_restored || 0;
      return `${actor} restored a database backup (${tables} tables, ${rows} rows).`;
    }

    default: {
      if (log.table_name && log.action) {
        const action = log.action.replace(/_/g, ' ');
        const table = log.table_name.replace(/_/g, ' ');
        return `${action} on ${table} (ID: ${log.record_id || '?'})`;
      }
      return log.event_type.replace(/_/g, ' ');
    }
  }
}

export function getActivityDescription(log: ActivityLog): string {
  switch (log.event_type) {
    case 'import_completed': {
      const importedCount = log.details?.imported_count ?? 0;
      const fileName = log.details?.file_name || 'file';
      const rowCount = log.details?.row_count ?? 0;
      return `Imported ${importedCount} of ${rowCount} rows from "${fileName}".`;
    }

    case 'import_failed': {
      const fileName = log.details?.file_name || 'file';
      const rowCount = log.details?.row_count ?? 0;
      const errorMsg = log.details?.error || 'unknown error';
      return `Failed to import ${rowCount} rows from "${fileName}": ${errorMsg}`;
    }

    case 'collection_tasks_created': {
      const mfid = log.details?.mfid || 'unknown MFID';
      const collector = log.details?.collector_name || 'a collector';
      return `Created collection task for ${mfid} assigned to ${collector}.`;
    }

    case 'collection_tasks_updated': {
      const changes: string[] = [];
      const mfid = log.details?.mfid || `task ${log.record_id}`;

      if (log.old_data && log.new_data) {
        if (log.old_data.collector_id !== log.new_data.collector_id) {
          const oldName = log.details?.old_collector_name || 'previous collector';
          const newName = log.details?.collector_name || 'new collector';
          changes.push(`reassigned from ${oldName} to ${newName}`);
        }

        if (log.old_data.start_date !== log.new_data.start_date ||
          log.old_data.end_date !== log.new_data.end_date) {
          changes.push('changed dates');
        }

        if (log.old_data.status !== log.new_data.status) {
          changes.push(`marked as ${log.new_data.status}`);
        }
      }

      const changeText = changes.length ? ` (${changes.join(', ')})` : '';
      return `Updated collection task for ${mfid}${changeText}.`;
    }

    case 'collection_tasks_deleted': {
      const mfid = log.details?.mfid || `task ${log.record_id}`;
      return `Deleted collection task for ${mfid}.`;
    }

    case 'mfid_created_open': {
      const mfid = log.details?.mfid || log.record_id;
      const location = [log.details?.municipality, log.details?.province].filter(Boolean).join(', ');
      return `Created open MFID ${mfid}${location ? ` (${location})` : ''}.`;
    }

    case 'mfid_created_assigned': {
      const mfid = log.details?.mfid || log.record_id;
      const farmer = log.details?.farmer_name || 'a farmer';
      const barangay = log.details?.barangay || '';
      return `Created assigned MFID ${mfid} for ${farmer}${barangay ? ` in ${barangay}` : ''}.`;
    }

    case 'report_exported': {
      const reportType = log.details?.report_type || 'analytics';
      const seasonLabel = log.details?.season_label || `Season ${log.record_id}`;
      return `Exported ${reportType} report for ${seasonLabel}.`;
    }

    case 'field_activity_verified': {
      const mfid = log.details?.mfid || 'unknown field';
      const activityType = log.details?.activity_type || 'activity';
      const season = log.details?.season ? ` (${log.details.season})` : '';
      const status = log.details?.verification_status || log.new_data?.verification_status || 'updated';

      return `Marked ${activityType} for ${mfid}${season} as ${status}.`;
    }

    case 'form_data_collected': {
      const mfid = log.details?.mfid || 'unknown field';
      const activityType = log.details?.activity_type || log.table_name || 'data';
      const collector = log.details?.collector_name || 'a user';
      const season = log.details?.season ? ` (${log.details.season})` : '';
      return `Collected ${activityType} for ${mfid}${season} by ${collector}.`;
    }

    default:
      if (log.table_name && log.action) {
        return `${log.action} on ${log.table_name} (ID: ${log.record_id || '?'})`.replace(/_/g, ' ');
      }
      return log.event_type.replace(/_/g, ' ');
  }
}
