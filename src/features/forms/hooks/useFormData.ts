import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FormRouteType } from "@/routes/_manager/forms/-config";
import { formDataOptions, formDataByMfidOptions } from "../queries/options";
import { FormDataEntry } from "../schemas/formData";

export function useFormData(
  formType: FormRouteType,
  opts: { enabled?: boolean } = {}
): { data: FormDataEntry[]; isLoading: boolean; error?: Error } {
  const listQuery = useQuery(
    formDataOptions({
      formType,
      enabled: opts.enabled ?? true,
    })
  );

  return {
    data: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
    error: listQuery.error as Error | undefined,
  };
}

// Fetch a single entry
export function useFormDetail(
  formType: FormRouteType,
  mfid: string,
  opts: { enabled?: boolean } = {}
): { data: FormDataEntry | null; isLoading: boolean; error?: Error } {
  const qc = useQueryClient();

  // optional cache optimization from list
  const cachedList = qc.getQueryData<FormDataEntry[]>(
    formDataOptions({ formType }).queryKey
  );
  const cachedItem = cachedList?.find((x) => x.mfid === mfid);

  const entryQuery = useQuery(
    formDataByMfidOptions({
      formType,
      mfid,
      enabled: !cachedItem && (opts.enabled ?? true),
    })
  );

  if (cachedItem) {
    return { data: cachedItem, isLoading: false };
  }

  return {
    data: entryQuery.data ?? null,
    isLoading: entryQuery.isLoading,
    error: entryQuery.error as Error | undefined,
  };
}
