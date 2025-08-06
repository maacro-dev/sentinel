import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FormRouteType } from "@/routes/_manager/forms/-config";
import { useMemo } from "react";
import { formDataOptions, formDataByMfidOptions } from "../queries/options";
import { FormDataEntry } from "../schemas/formData";

type SingleResult = { data: FormDataEntry | null; isLoading: boolean; error?: Error };
type ListResult = { data: FormDataEntry[]; isLoading: boolean; error?: Error };

export function useFormData(formType: FormRouteType, mfid: string): SingleResult;
export function useFormData(formType: FormRouteType, mfid?: undefined): ListResult;
export function useFormData(formType: FormRouteType, mfid?: string): SingleResult | ListResult {
  const qc = useQueryClient();

  const listQuery = useQuery(formDataOptions({
    formType,
    enabled: !mfid,
  }));

  const cachedList = qc.getQueryData<FormDataEntry[]>(formDataOptions({ formType }).queryKey);
  const listMap = useMemo(() => {
    if (!cachedList) return null;
    return new Map(cachedList.map((item) => [item.mfid, item]));
  }, [cachedList]);

  const shouldFetchEntry = Boolean(mfid && !listMap?.has(mfid));
  const entryQuery = useQuery(formDataByMfidOptions({
    formType,
    mfid: mfid!,
    enabled: shouldFetchEntry,
  }));

  if (mfid) {
    if (listMap?.has(mfid)) {
      return { data: listMap.get(mfid)!, isLoading: false };
    }
    return {
      data: entryQuery.data ?? null,
      isLoading: entryQuery.isLoading,
    };
  }

  return {
    data: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
  };
}
