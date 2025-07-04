import { queryOptions } from "@tanstack/react-query";
import { queryUsers } from "./users";

export const usersQueryOptions = () => 
  queryOptions({
    queryKey: ["users"] as const,
    queryFn: queryUsers,
    staleTime: 1000 * 60 * 10, // 5 minutes
  })
