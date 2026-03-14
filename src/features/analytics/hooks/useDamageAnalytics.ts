import { useQuery } from '@tanstack/react-query';
import { damageByCauseOptions, damageByLocationOptions } from '../queries/options';
import { ComparativeDataParams } from '../types';


export const useDamageByLocation = (filters: Parameters<typeof damageByLocationOptions>[0]) => {
  const { data, isLoading, error } = useQuery(damageByLocationOptions(filters));
  return { data, isLoading, error };
};

export const useDamageByCause = (filters: Parameters<typeof damageByCauseOptions>[0]) => {
  const { data, isLoading, error } = useQuery(damageByCauseOptions(filters));
  return { data, isLoading, error };
};

export function useDamageAnalytics(filters: ComparativeDataParams) {
  const damageLocation = useDamageByLocation(filters);
  const damageCause = useDamageByCause(filters);

  return {
    byLocation: damageLocation,
    byCause: damageCause,
  };
}
