import { useQuery } from "@tanstack/react-query"
import { fieldsQueryOptions } from "../queries/options"

export const useFields = () => {
  const { data, isLoading } = useQuery(fieldsQueryOptions())
  return { data: data ?? [], isLoading }
}
