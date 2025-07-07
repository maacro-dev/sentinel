import { GetAllUsersParams } from "@/api/users";
import { queryOptions } from "@tanstack/react-query";
import { queryUsers } from "./users";

export const usersQueryOptions = (params: GetAllUsersParams) => 
  queryOptions({
    queryKey: ["users"] as const,
    queryFn: () => queryUsers(params),
    staleTime: 1000 * 60 * 10, // 5 minutes
  })
