import { queryOptions } from "@tanstack/react-query";
import { Users } from "../services/Users";

export const usersQueryOptions = ({ includeAdmin }: { includeAdmin: boolean }) => {
  return queryOptions({
    queryKey: ["users"] as const,
    queryFn: () => Users.getAll({ includeAdmin }),
    staleTime: 1000 * 60 * 5,
  });
};
