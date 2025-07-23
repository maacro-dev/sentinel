import { useQuery } from "@tanstack/react-query"
import { fieldsQueryOptions } from "../queries/options"

export const useFields = () => {
  return useQuery(fieldsQueryOptions())
}
