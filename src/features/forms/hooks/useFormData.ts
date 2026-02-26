import { useQuery } from "@tanstack/react-query";
import { FormType } from "@/routes/_manager/forms/-config";
import { formDataOptions, formDataByMfidOptions } from "../queries/options";

interface useFormEntriesOptions {
  formType: FormType;
  seasonId?: number;
  enabled?: boolean;
}

interface useFormEntryOptions {
  formType: FormType;
  mfid: string;
  seasonId?: number;
  enabled?: boolean;
}

export function useFormEntries({
  formType,
  seasonId,
  enabled,
}: useFormEntriesOptions) {
  const listQuery = useQuery(
    formDataOptions({
      formType,
      seasonId,
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
  seasonId,
  enabled,
}: useFormEntryOptions) {
  const entryQuery = useQuery(
    formDataByMfidOptions({
      formType,
      mfid,
      seasonId,
      enabled: enabled ?? true,
    })
  );

  return {
    data: entryQuery.data ?? null,
    isLoading: entryQuery.isLoading,
  };
}
