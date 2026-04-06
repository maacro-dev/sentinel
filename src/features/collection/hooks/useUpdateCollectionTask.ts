import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection } from "../services/Collection";
import { CollectionTaskInput } from "../schemas/collection.schema";

export function useUpdateCollectionTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: number } & Partial<CollectionTaskInput>) =>
      Collection.update(id, input),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["collection-tasks"] });
      if (variables.mfid) {
        queryClient.invalidateQueries({ queryKey: ["collection-tasks", variables.mfid] });
      }
    },
  });
}
