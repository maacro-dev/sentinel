import { queryOptions, UseQueryOptions } from "@tanstack/react-query";
import { Forms } from "../services/Forms";
import { FormType } from "@/routes/_manager/forms/-config";


export interface FormDataOptions {
  formType: FormType | (string & {});
  seasonId?: number;
  enabled?: boolean;
}

export function formDataOptions({ formType, seasonId, enabled }: FormDataOptions) {
  return queryOptions({
    queryKey: ["form-data", formType, seasonId] as const,
    queryFn: () => Forms.getFormData(formType as FormType, seasonId),
    enabled,
    staleTime: 1000 * 60 * 1,
    placeholderData: (prev) => prev,
  });
}


export interface FormDataByMfidOptions {
  formType: FormType | (string & {});
  mfid: string;
  enabled?: boolean;
  seasonId?: number;
  queryOptions?: Partial<UseQueryOptions<any>>
}

export function formDataByMfidOptions({
  formType,
  mfid,
  enabled = true,
  seasonId,
  queryOptions: overrides = {}
}: FormDataByMfidOptions) {
  return queryOptions({
    queryKey: ["form-data-entry", formType, mfid, seasonId] as const,
    queryFn: () => Forms.getFormDataByMfid(formType as FormType, mfid, seasonId),
    enabled: Boolean(mfid) && enabled,
    staleTime: Infinity,
    // placeholderData: (prev) => prev,
    ...overrides
  })
}

export interface FormDataByIdOptions {
  formType: FormType | (string & {});
  id: number;
  enabled?: boolean;
  seasonId?: number;
  queryOptions?: Partial<UseQueryOptions<any>>
}

export function formDataByIdOptions({
  formType,
  id,
  enabled = true,
  seasonId,
  queryOptions: overrides = {}
}: FormDataByIdOptions) {
  return queryOptions({
    queryKey: ["form-data-entry", formType, id, seasonId] as const,
    queryFn: () => Forms.getFormDataById(formType as FormType, id, seasonId),
    enabled: Boolean(id) && enabled,
    staleTime: Infinity,
    // placeholderData: (prev) => prev,
    ...overrides
  })
}
