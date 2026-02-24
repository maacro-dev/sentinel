import { queryOptions, useQuery } from "@tanstack/react-query"
import { Seasons } from "../services/Seasons"

export const useSeasons = () => {
  const { data, isLoading } = useQuery(queryOptions({
    queryKey: ["seasons"] as const,
    queryFn: () => Seasons.getAll(),
    staleTime: 1000 * 60 * 5,
  }))
  return { data: data ?? [], isLoading }
}
