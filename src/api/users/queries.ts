import { queryOptions } from "@tanstack/react-query";
import { getAllUsers, getUserById, getNextUserId } from "./";

export const usersQueryOptions = () => 
  queryOptions({
    queryKey: ["users"] as const,
    queryFn: getAllUsers,
    staleTime: 1000 * 60 * 10, // 5 minutes
  })

export const generateUserIdQueryOptions = () => 
  queryOptions({
    queryKey: ["generate-user-id"] as const,
    queryFn: getNextUserId,
  })

export const userQueryOptions = (userId: string) => 
  queryOptions({
    queryKey: ["user", userId] as const,
    queryFn: () => getUserById(userId),
    enabled: Boolean(userId),
  })

