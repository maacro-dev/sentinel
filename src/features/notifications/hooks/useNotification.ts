import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { Notifications } from "../services/Notifcations";
import { Notification } from "../schema/notification";

const STORAGE_KEY = 'notifications_read';

const getReadSet = (): Set<string> => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return new Set();
  try {
    const arr = JSON.parse(stored);
    return new Set(arr);
  } catch {
    return new Set();
  }
};

const saveReadSet = (set: Set<string>) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
};

export const notificationsQueryOptions = () =>
  queryOptions({
    queryKey: ["notifications"] as const,
    queryFn: () => Notifications.getAll(),
    staleTime: 0,
  });

export function useNotifications() {
  const queryClient = useQueryClient();
  const { data: serverNotifications = [], isLoading } = useQuery(notificationsQueryOptions());

  const readSet = getReadSet();
  const notifications = serverNotifications.map((n) => ({
    ...n,
    is_read: n.is_read || readSet.has(String(n.id)),
  }));

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = (id: number) => {
    const newSet = getReadSet();
    newSet.add(String(id));
    saveReadSet(newSet);
    queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
      old?.map((n) => (n.id === id ? { ...n, is_read: true } : n))
    );
  };

  const markAllAsRead = () => {
    const newSet = new Set(notifications.map((n) => String(n.id)));
    saveReadSet(newSet);
    queryClient.setQueryData<Notification[]>(["notifications"], (old) =>
      old?.map((n) => ({ ...n, is_read: true }))
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
