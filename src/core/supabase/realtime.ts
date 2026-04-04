import { useEffect } from "react";

import { getSupabase } from "@/core/supabase";
import { RealtimeChannel, SupabaseClient } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";


function getInvalidateKeys(seasonId: number) {
  return [
    ["dashboard-data", seasonId],
    ["form-summary", seasonId],

    ["data-collection-rate", seasonId],
    ["form-count-summary", seasonId],
    ['descriptive-analytics-data', seasonId],

    ['yield-analytics'],
    ['yield-by-method'],
    ['yield-by-variety'],
    ['damage-by-location'],
    ['damage-by-cause'],

    ['collection-tasks']
  ]
}

export function ManagerRealtimeListener({ seasonId }: { seasonId: number }) {
  const queryClient = useQueryClient();
  console.log("Realtime listener attached.")

  useEffect(() => {
    let channel: RealtimeChannel;
    let supabase: SupabaseClient;

    (async () => {
      supabase = await getSupabase();
      await supabase.realtime.setAuth();
      console.log(supabase.getChannels())
      channel = supabase
        .channel("updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "field_activities" }, () => {
          getInvalidateKeys(seasonId).forEach(key =>
            queryClient.invalidateQueries({ queryKey: Array.isArray(key) ? key : [key], })
          );
        })
        .subscribe();
    })();

    return () => { if (channel && supabase) supabase.removeChannel(channel) };
  }, [queryClient, seasonId]);

  return null;
}
