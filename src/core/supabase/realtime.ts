import { useEffect } from "react";
import { getSupabase } from "@/core/supabase";
import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";

const invalidateKeys = [
  // add here
  ["dashboard-data"],
  ["form-summary"],
  ["data-collection-rate"],
  ["form-count-summary"]
]

export function RealtimeListener() {
  const queryClient = useQueryClient();

    useEffect(() => {
      let channel: RealtimeChannel;
      let supabase: SupabaseClient;

      (async () => {
        supabase = await getSupabase();
        await supabase.realtime.setAuth();

        channel = supabase
          .channel("updates")
          .on("postgres_changes", { event: "*", schema: "public" }, () => {
            invalidateKeys.forEach(key =>
              queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key], })
            );
          })
          .subscribe();
      })();

      return () => { if (channel && supabase) supabase.removeChannel(channel) };
    }, [queryClient, invalidateKeys]);

  return null;
}
