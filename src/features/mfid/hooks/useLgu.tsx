import { useQuery } from "@tanstack/react-query";
import { provincesQueryOptions, provinceQueryOptions, municitiesByProvinceQueryOptions, municityQueryOptions, barangaysByMunicityQueryOptions, barangayQueryOptions } from "../queries/options";
import { Province, CityMunicipality, Barangay } from "../schemas/lgu.schema";
import { UseFormReturn } from "react-hook-form";
import { useMemo, useRef, useEffect } from "react";
import { MfidFormInput } from "../schemas/mfid-create.schema";

export function useLguHierarchy(form: UseFormReturn<MfidFormInput>) {

  const { data: provinces = [], isLoading: isLoadingProvinces } = useProvinces();

  const selectedProvinceName = form.watch("province");
  const selectedMunicityName = form.watch("city_municipality");

  const selectedProvince = useMemo(
    () => provinces.find((p: Province) => p.name === selectedProvinceName),
    [provinces, selectedProvinceName]
  );

  const provinceId = selectedProvince?.id ?? null;

  const { data: cities = [], isLoading: isLoadingMunicities } = useMunicityByProvince({
    provinceId: provinceId ?? undefined,
    enabled: Boolean(provinceId),
  });

  const selectedMunicity = useMemo(
    () => cities.find((c: CityMunicipality) => c.name === selectedMunicityName),
    [cities, selectedMunicityName]
  );

  const municityId = selectedMunicity?.id ?? null;

  const { data: barangays = [], isLoading: isLoadingBarangays } = useBarangaysByMunicity({
    cityId: municityId ?? undefined,
    enabled: Boolean(municityId),
  });

  const prevProvinceRef = useRef(selectedProvinceName);
  const prevMunicityRef = useRef(selectedMunicityName);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevProvinceRef.current = selectedProvinceName;
      prevMunicityRef.current = selectedMunicityName;
      return;
    }

    if (prevProvinceRef.current !== selectedProvinceName) {
      form.setValue("city_municipality", "", { shouldValidate: false });
      form.setValue("barangay", "", { shouldValidate: false });
      prevProvinceRef.current = selectedProvinceName;
      prevMunicityRef.current = "";
    }

    if (prevMunicityRef.current !== selectedMunicityName) {
      form.setValue("barangay", "", { shouldValidate: false });
      prevMunicityRef.current = selectedMunicityName;
    }
  }, [selectedProvinceName, selectedMunicityName, form]);

  return {
    provinces,
    cities,
    barangays,
    isLoadingProvinces,
    isLoadingMunicities,
    isLoadingBarangays
  };
}

export const useProvinces = () => {
  const { data, isLoading } = useQuery(provincesQueryOptions());
  return { data: (data ?? []) as Province[], isLoading };
};

export const useProvince = ({ id }: { id: number }) => {
  const { data, isLoading } = useQuery(provinceQueryOptions(id));
  return { data: data as Province | undefined, isLoading };
};

export const useMunicityByProvince = ({
  provinceId,
  enabled = true
}: {
  provinceId: number | undefined,
  enabled?: boolean
}) => {
  const { data, isLoading } = useQuery({
    ...municitiesByProvinceQueryOptions(provinceId ?? 0),
    enabled: enabled && provinceId != null,
  });

  return {
    data: (data ?? []) as CityMunicipality[],
    isLoading
  };
};

export const useMunicity = ({ id }: { id: number }) => {
  const { data, isLoading } = useQuery(municityQueryOptions(id));
  return { data: data as CityMunicipality | undefined, isLoading };
};

export const useBarangaysByMunicity = ({
  cityId,
  enabled
}: {
  cityId: number | undefined,
  enabled: boolean
}) => {
  const { data, isLoading } = useQuery({
    ...barangaysByMunicityQueryOptions(cityId ?? 0),
    enabled: enabled && cityId != null,
  });

  return {
    data: (data ?? []) as Barangay[],
    isLoading
  };
};

export const useBarangay = ({ id }: { id: number }) => {
  const { data, isLoading } = useQuery(barangayQueryOptions(id));
  return { data: data as Barangay | undefined, isLoading };
};

