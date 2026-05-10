select cron.schedule(
  'check-overdue-tasks',
  '0 9 * * *',
  'select notify_overdue_tasks();'
);