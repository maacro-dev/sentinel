import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection } from "../services/Collection";
import { CollectionTaskInput } from "../schemas/collection.schema";

export const useCreateCollectionTask = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["create-collection-task"] as const,
    mutationFn: (input: CollectionTaskInput) => Collection.create(input),
    onSuccess: (_) => {
      queryClient.invalidateQueries({ queryKey: ["collection-tasks"] });
    },
  });
};
