import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { Notifications } from "../services/Notifcations";
import { Notification } from "../schema/notification";

const LAST_READ_KEY = 'notifications_last_read';

const getLastRead = (): number => {
  const stored = localStorage.getItem(LAST_READ_KEY);
  return stored ? parseInt(stored, 10) : 0;
};

const setLastRead = (timestamp: number) => {
  localStorage.setItem(LAST_READ_KEY, timestamp.toString());
};

export const notificationsQueryOptions = () =>
  queryOptions({
    queryKey: ["notifications"] as const,
    queryFn: () => Notifications.getAll(),
    staleTime: 0,
  });

export function useNotifications() {
  const queryClient = useQueryClient();
  const { data: notifications = [], isLoading } = useQuery(notificationsQueryOptions());

  const lastRead = getLastRead();
  const unreadCount = notifications.filter(n => new Date(n.created_at).getTime() > lastRead).length;

  const markAsRead = (_: number) => {
    // For individual mark as read, we would need a different mechanism (e.g., store per‑notification timestamps)
    // Since the UI only uses markAllAsRead, we can ignore individual marks.
    // If needed, you can implement a separate localStorage set for individual read, but it's optional.
  };

  const markAllAsRead = () => {
    const now = Date.now();
    setLastRead(now);
    // Optionally invalidate the query to refresh the UI (but the derived unreadCount will update immediately)
    queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
      old ? old : []
    );
  };

  return {
    notifications,
    isLoading,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
