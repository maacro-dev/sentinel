import { queryOptions, UseQueryOptions } from "@tanstack/react-query";
import { Forms } from "../services/Forms";
import { FormRouteType } from "@/routes/_manager/forms/-config";


export interface FormDataOptions {
  formType: FormRouteType | (string & {});
  enabled?: boolean;
}

export function formDataOptions({ formType, enabled }: FormDataOptions) {
  return queryOptions({
    queryKey: ["form-data", formType] as const,
    queryFn: () => Forms.getFormData(formType as FormRouteType),
    enabled,
    staleTime: 0,
    placeholderData: (prev) => prev
  })
}


export interface FormDataByMfidOptions {
  formType: FormRouteType | (string & {});
  mfid: string;
  enabled?: boolean;
  queryOptions?: Partial<UseQueryOptions<any>>
}

export function formDataByMfidOptions({
  formType,
  mfid,
  enabled = true,
  queryOptions: overrides = {}
}: FormDataByMfidOptions) {
  return queryOptions({
    queryKey: ["form-data-entry", formType, mfid] as const,
    queryFn: () => Forms.getFormDataByMfid(formType as FormRouteType, mfid),
    enabled: Boolean(mfid) && enabled,
    staleTime: 0,
    placeholderData: (prev) => prev,
    ...overrides
  })
}
