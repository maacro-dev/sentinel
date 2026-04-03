
// TODO

import { useQuery } from "@tanstack/react-query"
import { collectorsQueryOptions } from "../queries/options"

export const useAvailableCollectors = () => {
  const { data, isLoading, error } = useQuery(collectorsQueryOptions())
  return { data: data ?? [], isLoading, error }
}
