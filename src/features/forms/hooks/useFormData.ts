import { useQuery } from "@tanstack/react-query";
import { FormType } from "@/routes/_manager/forms/-config";
import { formDataOptions, formDataByIdOptions } from "../queries/options";
import { FormDataEntry } from "../schemas/formData";
import { useMemo } from "react";

interface useFormEntriesOptions {
  formType: FormType;
  seasonId?: number;
  hideRejected?: boolean;
  enabled?: boolean;
}

export function useFormEntries({
  formType,
  seasonId,
  hideRejected = false,
  enabled,
}: useFormEntriesOptions) {
  const listQuery = useQuery(formDataOptions({ formType, seasonId, enabled: enabled ?? true }));
  const data = listQuery.data ?? [];

  const filteredData = useMemo(() => {
    if (!hideRejected) return data;
    return data.filter(item => item.activity.verificationStatus !== 'rejected');
  }, [data, hideRejected]);

  return {
    data: filteredData,
    isLoading: listQuery.isLoading,
  };
}


interface useFormEntryOptions {
  formType: FormType;
  id: number;
  seasonId?: number;
  enabled?: boolean;
}

export function useFormEntry({ formType, id, seasonId, enabled, }: useFormEntryOptions) {
  const { data, isLoading } = useQuery(formDataByIdOptions({ formType, id, seasonId, enabled: enabled ?? true, }));
  return {
    data: data as FormDataEntry,
    isLoading: isLoading,
  };
}
