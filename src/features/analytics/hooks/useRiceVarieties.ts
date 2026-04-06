import { getSupabase } from "@/core/supabase";
import { useQuery } from "@tanstack/react-query";

export const useRiceVarieties = (seasonId?: number, province?: string, municipality?: string) =>
  useQuery({
    queryKey: ['rice-varieties', seasonId, province, municipality],
    queryFn: async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase.rpc('get_rice_varieties_for_predictions', {
        p_season_id: seasonId,
        p_province: province,
        p_municipality: municipality,
      });
      if (error) throw error;
      return data as string[];
    },
  });

export const useSoilTypes = (seasonId?: number, province?: string, municipality?: string) =>
  useQuery({
    queryKey: ['soil-types', seasonId, province, municipality],
    queryFn: async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase.rpc('get_soil_types_for_predictions', {
        p_season_id: seasonId,
        p_province: province,
        p_municipality: municipality,
      });
      if (error) throw error;
      return data as string[];
    },
  });
