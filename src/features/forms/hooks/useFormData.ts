import { useQuery } from "@tanstack/react-query";
import { FormType } from "@/routes/_manager/forms/-config";
import { formDataOptions, formDataByIdOptions } from "../queries/options";
import { FormDataEntry } from "../schemas/formData";

interface useFormEntriesOptions {
  formType: FormType;
  seasonId: number | undefined | null;
  hideRejected?: boolean;
  enabled?: boolean;
}

export function useFormEntries({
  formType,
  seasonId,
  enabled,
}: useFormEntriesOptions) {
  const listQuery = useQuery(formDataOptions({ formType, seasonId, enabled: enabled ?? true }));
  return {
    data: listQuery.data ?? [],
    isLoading: listQuery.isLoading,
  };
}


interface useFormEntryOptions {
  formType: FormType;
  id: number;
  enabled?: boolean;
}

export function useFormEntry({ formType, id, enabled, }: useFormEntryOptions) {
  const { data, isLoading } = useQuery(formDataByIdOptions({ formType, id, enabled: enabled ?? true, }));
  return {
    data: data as FormDataEntry,
    isLoading: isLoading,
  };
}
