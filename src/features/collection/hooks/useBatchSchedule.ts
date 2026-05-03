import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Collection } from "../services/Collection";

export const useBatchSchedule = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      mfids: string[];
      seasonId: number;
      collectorId: string;
      startDate: string;
      endDate: string;
    }) => Collection.batchScheduleFieldData(input),
    onSettled: (_data, _error, variables) => {
      variables.mfids.forEach(mfid => {
        queryClient.invalidateQueries({
          queryKey: ["collection-tasks", mfid, variables.seasonId],
        });
      });
      queryClient.invalidateQueries({ queryKey: ["mfids", variables.seasonId] });
    },
  });
};
