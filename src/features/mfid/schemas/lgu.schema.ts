import { Validator } from "@/core/utils/validator";
import * as z from "zod/v4";


export interface Province extends z.infer<typeof provinceSchema> { }
export interface CityMunicipality extends z.infer<typeof cityMunicipalitySchema> { }
export interface Barangay extends z.infer<typeof barangaySchema> { }
export interface Location extends z.infer<typeof locationsSchema> { }

export const provinceSchema = z.object({
  id: z.number().int(),
  code: z.string().min(1),
  name: z.string().min(1),
});

export const cityMunicipalitySchema = z.object({
  id: z.number().int(),
  province_id: z.number().int(),
  code: z.string().min(1),
  name: z.string().min(1),
});

export const barangaySchema = z.object({
  id: z.number().int(),
  city_municipality_id: z.number().int(),
  code: z.string().min(1),
  name: z.string().min(1),
});


export const locationsSchema = z.object({
  id: z.number().int(),
  province: z.string(),
  municity: z.string(),
  barangay: z.string(),
})


export const parseProvince = Validator.create<Province>(provinceSchema);
export const parseCityMunicipality = Validator.create<CityMunicipality>(cityMunicipalitySchema);
export const parseBarangay = Validator.create<Barangay>(barangaySchema);

export const parseProvinces = Validator.create<Province[]>(z.array(provinceSchema));
export const parseCityMunicipalities = Validator.create<CityMunicipality[]>(z.array(cityMunicipalitySchema));
export const parseBarangays = Validator.create<Barangay[]>(z.array(barangaySchema));

export const parseLocations = Validator.create<Location[]>(z.array(locationsSchema));


