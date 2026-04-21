import { useEffect } from "react";
import { getSupabase } from "@/core/supabase";
import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { useSessionStore } from "@/features/authentication/store";

export function NotificationsRealtimeListener() {
  const { user } = useSessionStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user?.id) return;

    const channelName = `notifications_${user.id}`;

    let isMounted = true;
    let channel: RealtimeChannel | null = null;
    let supabase: SupabaseClient | null = null;

    getSupabase().then(async (client) => {
      if (!isMounted) return;

      supabase = client;
      await supabase.realtime.setAuth();

      const existing = supabase
        .getChannels()
        .find((c) => c.topic === channelName);

      if (existing) {
        await supabase.removeChannel(existing);
      }

      if (!isMounted) return;

      channel = supabase
        .channel(channelName)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `target_role=eq.data_manager`,
          },
          () => {
            queryClient.invalidateQueries({
              queryKey: ["notifications", user.id],
            });
          }
        )
        .subscribe();
    });

    return () => {
      isMounted = false;

      if (channel && supabase) {
        supabase.removeChannel(channel);
      }
    };
  }, [user?.id, queryClient]);

  return null;
}
