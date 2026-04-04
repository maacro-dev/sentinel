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

    let channel: RealtimeChannel;
    let supabase: SupabaseClient;

    (async () => {
      supabase = await getSupabase();
      await supabase.realtime.setAuth();
      channel = supabase
        .channel(`notifications_${user.id}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "notifications",
            filter: `target_role=eq.data_manager`,
          },
          () => {
            queryClient.invalidateQueries({ queryKey: ["notifications", user.id] });
          }
        )
        .subscribe();
    })();

    return () => {
      if (channel && supabase) supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient]);

  return null;
}
