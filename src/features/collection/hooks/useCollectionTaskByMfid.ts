import { useQuery } from "@tanstack/react-query";
import { Collection } from "../services/Collection";

export const useCollectionTasksByMfid = (mfid: string) => {
  return useQuery({
    queryKey: ["collection-tasks", mfid],
    queryFn: () => Collection.getByMfid(mfid),
    staleTime: 1000 * 60 * 5,
  });
};
