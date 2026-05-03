import { queryOptions } from "@tanstack/react-query";
import { Mfid } from "../services/Mfid";
import { Lgu } from "../services/Lgu";

export const mfidsQueryOptions = (seasonId?: number | null) => {
  return queryOptions({
    queryKey: ["mfids", seasonId] as const,
    queryFn: () => Mfid.getAll(seasonId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
};


export const mfidQueryOptions = (mfid: string) => {
  return queryOptions({
    queryKey: ["mfid", mfid] as const,
    queryFn: () => Mfid.getSingle(mfid),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true
  });
};

export const provincesQueryOptions = () =>
  queryOptions({
    queryKey: ["provinces"] as const,
    queryFn: () => Lgu.getAllProvinces(),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

export const provinceQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["province", id] as const,
    queryFn: () => Lgu.getProvinceById(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

export const municitiesByProvinceQueryOptions = (provinceId: number) =>
  queryOptions({
    queryKey: ["municities", provinceId] as const,
    queryFn: () => Lgu.getMunicitiesByProvince(provinceId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

export const municityQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["municity", id] as const,
    queryFn: () => Lgu.getMunicityById(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

export const barangaysByMunicityQueryOptions = (municityId: number) =>
  queryOptions({
    queryKey: ["barangays", municityId] as const,
    queryFn: () => Lgu.getBarangaysByCity(municityId),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });

export const barangayQueryOptions = (id: number) =>
  queryOptions({
    queryKey: ["barangay", id] as const,
    queryFn: () => Lgu.getBarangayById(id),
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: true,
  });
