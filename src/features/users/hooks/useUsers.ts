import { useQuery } from "@tanstack/react-query"
import { usersQueryOptions } from "../queries/options"

export const useUsers = ({ includeAdmin }: { includeAdmin: boolean }) => {
  return useQuery(usersQueryOptions({ includeAdmin }))
}
