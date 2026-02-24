import { useQuery } from "@tanstack/react-query";
import { provincesQueryOptions, provinceQueryOptions, municitiesByProvinceQueryOptions, municityQueryOptions, barangaysByMunicityQueryOptions, barangayQueryOptions } from "../queries/options";
import { Province, CityMunicipality, Barangay, Location } from "../schemas/lgu.schema";
import { UseFormReturn } from "react-hook-form";
import { useMemo, useRef, useEffect } from "react";
import { MfidFormInput } from "../schemas/mfid-create.schema";
import { Lgu } from "../services/Lgu";
import leven from "leven";

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
      // form.setValue("barangay", "", { shouldValidate: false });
      prevProvinceRef.current = selectedProvinceName;
      prevMunicityRef.current = "";
    }

    if (prevMunicityRef.current !== selectedMunicityName) {
      // form.setValue("barangay", "", { shouldValidate: false });
      prevMunicityRef.current = selectedMunicityName;
    }
  }, [selectedProvinceName, selectedMunicityName, form]);

  return {
    provinces,
    cities,
    // barangays,
    isLoadingProvinces,
    isLoadingMunicities,
    // isLoadingBarangays
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

export const useAllBarangaysWithLocation = () => {
  return useQuery({
    queryKey: ["barangays-with-location"],
    queryFn: () => Lgu.getAllBarangaysWithLocation(),
    staleTime: Infinity, // cache forever
  });
};




export interface LocationMatch {
  id: number;
  province: string;
  municity: string;
  barangay: string;
  score: number; // lower is better
  matchedFields: { province: boolean; municity: boolean; barangay: boolean };
}

export function findBestLocationMatch(
  inputProvince: string,
  inputMunicity: string,
  inputBarangay: string,
  locations: Location[]

): LocationMatch | null {
  const normalize = (s: string) => s.toLowerCase().trim();

  const normProvince = normalize(inputProvince);
  const normMunicity = normalize(inputMunicity);
  const normBarangay = normalize(inputBarangay);

  let best: LocationMatch | null = null;
  let bestScore = Infinity;

  for (const loc of locations) {
    const provDist = leven(normProvince, normalize(loc.province));
    const municDist = leven(normMunicity, normalize(loc.municity));
    const brgyDist = leven(normBarangay, normalize(loc.barangay));

    const totalScore = provDist + municDist * 2 + brgyDist * 3;
    const maxLenProv = Math.max(normProvince.length, loc.province.length);
    const maxLenMunic = Math.max(normMunicity.length, loc.municity.length);
    const maxLenBrgy = Math.max(normBarangay.length, loc.barangay.length);

    const provOk = provDist <= maxLenProv * 0.3;
    const municOk = municDist <= maxLenMunic * 0.3;
    const brgyOk = brgyDist <= maxLenBrgy * 0.4; // barangay more lenient

    if (provOk && municOk && brgyOk && totalScore < bestScore) {
      bestScore = totalScore;
      best = {
        id: loc.id,
        province: loc.province,
        municity: loc.municity,
        barangay: loc.barangay,
        score: totalScore,
        matchedFields: { province: provOk, municity: municOk, barangay: brgyOk },
      };
    }
  }

  return best;
}
