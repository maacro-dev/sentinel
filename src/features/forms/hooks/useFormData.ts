import { useQuery } from "@tanstack/react-query";
import { FormRouteType } from "@/routes/_manager/forms/-config";
import { formDataOptions, formDataByMfidOptions } from "../queries/options";

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
  const entryQuery = useQuery(
    formDataByMfidOptions({
      formType,
      mfid,
      enabled: enabled ?? true,
    })
  );

  return {
    data: entryQuery.data ?? null,
    isLoading: entryQuery.isLoading,
  };
}
