import { useQuery } from "@tanstack/react-query"
import { usersQueryOptions } from "../queries/options"

export const useUsers = ({ includeAdmin }: { includeAdmin: boolean }) => {
  const { data, isLoading } = useQuery(usersQueryOptions({ includeAdmin }))
  return { data: data ?? [], isLoading }
}
