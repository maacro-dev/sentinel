import { queryOptions, useQuery } from "@tanstack/react-query";
import { Collection } from "../services/Collection";

export const collectionTasksOptions = (seasonId?: number) =>
  queryOptions({
    queryKey: ["collection-tasks", seasonId],
    queryFn: () => Collection.getAll(seasonId),
    staleTime: 1000 * 60 * 5,
  });

export const useCollectionTasks = (seasonId?: number) => {
  return useQuery(collectionTasksOptions(seasonId));
};
