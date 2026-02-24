import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "@/core/supabase";

type DuplicateCheckResponse = Record<string, boolean>;

export const useCheckDuplicates = (
  activityType: string,
  rows: Array<{ mfid: string; season_id: number }>
) => {
  return useQuery({
    queryKey: ['check-duplicates', activityType, rows],
    queryFn: async (): Promise<Map<string, boolean>> => {

      if (!activityType || !rows.length) return new Map();


      const supabase = await getSupabase();
      const { data, error } = await supabase
        .rpc('check_duplicate_activities', {
          p_activity_type: activityType,
          p_rows: rows
        });

      if (error) throw error;

      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid response format from duplicate check');
      }

      const resultMap = new Map<string, boolean>();

      Object.entries(data).forEach(([key, value]) => {
        if (typeof value === 'boolean') {
          resultMap.set(key, value);
        } else {
          console.warn(`Unexpected value type for key ${key}:`, typeof value);
          resultMap.set(key, false);
        }
      });

      return resultMap;
    },
    enabled: !!activityType && rows.length > 0,
  });
};
