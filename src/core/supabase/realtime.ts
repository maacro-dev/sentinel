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
    let isMounted = true;
    let channel: RealtimeChannel | null = null;

    getSupabase().then(async (supabase) => {
      if (!isMounted) return;

      await supabase.realtime.setAuth();

      channel = supabase
        .channel("updates")
        .on("postgres_changes", { event: "*", schema: "public", table: "field_activities" }, () => {
          getInvalidateKeys(seasonId).forEach(key =>
            queryClient.invalidateQueries({ queryKey: key })
          );
        })
        .subscribe();
    });

    return () => {
      isMounted = false;
      if (channel) {
        getSupabase().then(s => s.removeChannel(channel!));
      }
    };
  }, [seasonId]);

  return null;
}
