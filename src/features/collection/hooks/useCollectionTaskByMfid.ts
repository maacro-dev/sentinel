import { useQuery } from "@tanstack/react-query";
import { Collection } from "../services/Collection";

export const useCollectionTasksByMfid = (mfid: string, seasonId?: number) => {
  return useQuery({
    queryKey: ["collection-tasks", mfid, seasonId],
    queryFn: () => Collection.getByMfid(mfid, seasonId),
    staleTime: 1000 * 60 * 5,
  });
};
