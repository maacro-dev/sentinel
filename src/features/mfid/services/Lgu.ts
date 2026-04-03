import { getSupabase } from "@/core/supabase";
import {
  parseBarangay,
  parseBarangays,
  parseCityMunicipalities,
  parseCityMunicipality,
  parseLocations,
  parseProvince,
  parseProvinces
} from "../schemas/lgu.schema";

export class Lgu {

  static async getAllBarangaysWithLocation() {
    const client = await this._client;
    const { data, error } = await client
      .from("addresses")
      .select("id:barangay_id, province, municity:city_municipality, barangay");
    if (error) throw error;

    return parseLocations(data)
  }

  static async getAllProvinces() {
    const client = await this._client;
    const { data, error } = await client
      .from("provinces")
      .select("*");

    console.log("Fetched provinces:", data)

    if (error) throw error;
    return parseProvinces(data);
  }

  static async getProvinceById(id: number) {
    const client = await this._client;
    const { data, error } = await client
      .from("provinces")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return parseProvince(data);
  }

  static async getMunicitiesByProvince(provinceId: number) {
    const client = await this._client;
    const { data, error } = await client
      .from("cities_municipalities")
      .select("*")
      .eq("province_id", provinceId);
    if (error) throw error;
    return parseCityMunicipalities(data);
  }

  static async getMunicityById(id: number) {
    const client = await this._client;
    const { data, error } = await client
      .from("cities_municipalities")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return parseCityMunicipality(data);
  }

  static async getBarangaysByCity(municityId: number) {
    const client = await this._client;
    const { data, error } = await client
      .from("barangays")
      .select("*")
      .eq("city_municipality_id", municityId);
    if (error) throw error;
    return parseBarangays(data);
  }

  static async getBarangayById(id: number) {
    const client = await this._client;
    const { data, error } = await client
      .from("barangays")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw error;
    return parseBarangay(data);
  }

  private constructor() { }

  private static get _client() {
    return getSupabase();
  }
}
