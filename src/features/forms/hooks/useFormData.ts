import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FormRouteType } from "@/routes/_manager/forms/-config";
import { formDataOptions, formDataByMfidOptions } from "../queries/options";
import { FormDataEntry } from "../schemas/formData";

interface useFormEntriesOptions {
  formType: FormRouteType,
  enabled?: boolean,
}

interface useFormEntryOptions {
  formType: FormRouteType,
  mfid: string,
  enabled?: boolean,
}

export function useFormEntries({
  formType,
  enabled,
}: useFormEntriesOptions) {
  const listQuery = useQuery(
    formDataOptions({
      formType,
      enabled: enabled ?? true,
    })
  );

  return {
    data: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
  };
}

export function useFormEntry({
  formType,
  mfid,
  enabled,
}: useFormEntryOptions) {
  const qc = useQueryClient();

  const cachedList = qc.getQueryData<FormDataEntry[]>(
    formDataOptions({ formType }).queryKey
  );
  const cachedItem = cachedList?.find((x) => x.mfid === mfid);

  const entryQuery = useQuery(
    formDataByMfidOptions({
      formType,
      mfid,
      enabled: !cachedItem && (enabled ?? true),
    })
  );

  if (cachedItem) {
    return { data: cachedItem, isLoading: false };
  }

  return {
    data: entryQuery.data ?? null,
    isLoading: entryQuery.isLoading,
  };
}
