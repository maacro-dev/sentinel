import { useQuery } from "@tanstack/react-query"
import { mfidQueryOptions, mfidsQueryOptions } from "../queries/options"


export const useMfids = () => {
  const { data, isLoading, error } = useQuery(mfidsQueryOptions())
  return { data: data ?? [], isLoading, error }
}

export interface UseMfidsProps { mfid: string }

export const useMfid = ({ mfid }: UseMfidsProps) => {
  const { data, isLoading } = useQuery(mfidQueryOptions(mfid))
  return {
    data: data,
    isLoading
  }
}
