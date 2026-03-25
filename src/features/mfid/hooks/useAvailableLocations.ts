import { useQuery } from '@tanstack/react-query';
import { getSupabase } from '@/core/supabase';
import * as z from "zod/v4"
import { Validator } from '@/core/utils/validator';

const municipalitySchema = z.object({
  name: z.string(),
  province: z.string(),
});

const barangaySchema = z.object({
  name: z.string(),
  municipality: z.string(),
});

export const availableLocationsSchema = z.object({
  provinces: z.array(z.string()),
  municipalities: z.array(municipalitySchema),
  barangays: z.array(barangaySchema),
});

export type AvailableLocations = z.infer<typeof availableLocationsSchema>;

export const parseAvailableLocations = Validator.create<AvailableLocations>(
  availableLocationsSchema,
  'AvailableLocations'
);

export const useAvailableLocations = (seasonId?: number) => {
  return useQuery({
    queryKey: ['available-locations', seasonId],
    queryFn: async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase.rpc('get_available_locations', {
        p_season_id: seasonId,
      });
      if (error) throw error;

      return parseAvailableLocations(data);
    },
    staleTime: 1000 * 60 * 10,
  });
};


export const useAvailableLocationsForPredictions = (seasonId?: number) => {
  return useQuery({
    queryKey: ['available-locations-for-predictions', seasonId],
    queryFn: async () => {
      const supabase = await getSupabase();
      const { data, error } = await supabase.rpc('get_available_locations_for_predictions', {
        p_season_id: seasonId,
      });
      if (error) throw error;
      return parseAvailableLocations(data);
    },
    staleTime: 1000 * 60 * 10,
  });
};
