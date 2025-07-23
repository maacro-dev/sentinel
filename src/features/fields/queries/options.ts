import { queryOptions } from "@tanstack/react-query";
import { Fields } from "../services/Fields";

export const fieldsQueryOptions = () => {
  return queryOptions({
    queryKey: ["fields"] as const,
    queryFn: () => Fields.getAll(),
    staleTime: 1000 * 60 * 5,
  });
};
