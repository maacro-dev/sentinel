
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection } from "../services/Collection";

export const useScheduleCore = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: Collection.scheduleFieldDataAndCore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["collection-tasks"] });
      queryClient.invalidateQueries({ queryKey: ["mfids"] });
    },
  });
};
