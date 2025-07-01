import { getAllUsers, getUserById } from "./";

export const usersQueryOptions = {
  queryKey: ["users"] as const,
  queryFn: getAllUsers,
};

export const userQueryOptions = (userId: string) => ({
  queryKey: ["user", userId] as const,
  queryFn: () => getUserById(userId),
  enabled: Boolean(userId),
});
