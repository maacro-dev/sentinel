import { UserPlus, Pencil, Trash2, LogIn, LogOut, Activity, KeyRound, Download, Upload, ClipboardList, CheckCircle, Circle, AlertCircle, FileText, ClipboardCheck } from 'lucide-react';

interface EventTypeBadgeProps {
  eventType: string;
}

export function EventTypeBadge({ eventType }: EventTypeBadgeProps) {
  const config = {
    users_created: { label: 'Created', icon: UserPlus, color: 'bg-green-100 text-green-800 border-green-200' },
    users_updated: { label: 'Updated', icon: Pencil, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    users_deleted: { label: 'Deleted', icon: Trash2, color: 'bg-red-100 text-red-800 border-red-200' },
    login: { label: 'Login', icon: LogIn, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    logout: { label: 'Logout', icon: LogOut, color: 'bg-gray-100 text-gray-800 border-gray-200' },
    user_recovery_requested: { label: 'Recovery', icon: KeyRound, color: 'bg-amber-100 text-amber-800 border-amber-200' },
    backup_downloaded: { label: 'Backup', icon: Download, color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    backup_restored: { label: 'Restore', icon: Upload, color: 'bg-purple-100 text-purple-800 border-purple-200' },
    collection_tasks_created: { label: 'Created', icon: ClipboardList, color: 'bg-green-100 text-green-800 border-green-200' },
    collection_tasks_updated: { label: 'Updated', icon: Pencil, color: 'bg-blue-100 text-blue-800 border-blue-200' },
    collection_tasks_deleted: { label: 'Deleted', icon: Trash2, color: 'bg-red-100 text-red-800 border-red-200' },
    mfid_created_open: { label: 'Open MFID', icon: Circle, color: 'bg-slate-100 text-slate-800 border-slate-200' },
    mfid_created_assigned: { label: 'Assigned MFID', icon: CheckCircle, color: 'bg-green-100 text-green-800 border-green-200' },
    import_completed: { label: 'Import Completed', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    import_failed: { label: 'Import Failed', icon: AlertCircle, color: 'bg-red-100 text-red-800 border-red-200' },
    report_exported: { label: 'Report', icon: FileText, color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
    field_activity_verified: { label: 'Verified', icon: CheckCircle, color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    form_data_collected: { label: 'Collected', icon: ClipboardCheck, color: 'bg-sky-100 text-sky-800 border-sky-200' },
  }[eventType] || { label: eventType.replace(/_/g, ' '), icon: Activity, color: 'bg-slate-100 text-slate-800 border-slate-200' };

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 text-2xs font-medium rounded-sm border ${config.color}`}
      title={eventType.replace(/_/g, ' ')}
    >
      <Icon className="h-3 w-3" />
      <span>{config.label}</span>
    </span>
  );
}
