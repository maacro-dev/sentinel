import { useQuery } from "@tanstack/react-query";
import { getAllUsers, getUserById } from "./";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: getAllUsers,
  });
}

export function useUser(userId: string) {
  return useQuery({
    queryKey: ["user", userId],
    queryFn: () => getUserById(userId),
    enabled: Boolean(userId),
  });
}