import { useQuery } from "@tanstack/react-query"
import {
  dataCollectionTrendOptions,
  formCountSummaryOptions,
  formProgressSummaryOptions
} from "@/features/analytics/queries/options"
import { FORM_PROGRESS_CONFIG } from "../config"
import { Stat } from "../types"
import { mapSeasonSummary } from "../utils"

export const useFormOverview = (seasonId?: number) => {

  const { data: formCount, isLoading: isLoadingCount } = useQuery(formCountSummaryOptions(seasonId))

  const { data: formProgress, isLoading: isLoadingSummary } = useQuery(formProgressSummaryOptions(seasonId));

  const { data: dataCollectionTrend, isLoading: isLoadingDataCollection } = useQuery(dataCollectionTrendOptions(seasonId))

  const mappedFormProgress: Array<Stat> = mapSeasonSummary({
    config: FORM_PROGRESS_CONFIG,
    stats: formProgress
  })

  return {
    formCount: formCount?.data,
    formProgress: mappedFormProgress,
    collectionTrend: dataCollectionTrend?.data,
    isLoading: isLoadingCount || isLoadingSummary || isLoadingDataCollection
  }
}
