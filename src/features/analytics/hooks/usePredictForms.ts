import { useToast } from "@/features/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Analytics } from "../services/Analytics";

export const usePredictForms = (seasonId?: number) => {
  const { notifySuccess, notifyError, notifyLoading } = useToast();
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ["predict-forms", seasonId] as const,
    mutationFn: () => Analytics.predictAvailableForms(seasonId),
    onMutate: () => notifyLoading({ message: "Predicting forms...", description: "Trying to predict available form entries." }),
    onSuccess: (data, _variables, id) => notifySuccess({ id, message: "Prediction complete", description: data.message, }),
    onError: (err, _variables, id) => notifyError({ id, message: err.message }),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['yield-forecast'] });
      queryClient.invalidateQueries({ queryKey: ['predicted-yield-by-location'] });
      queryClient.invalidateQueries({ queryKey: ['available-locations-for-predictions'] })
    }
  });
};
