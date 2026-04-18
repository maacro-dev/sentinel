import { getSupabase } from "@/core/supabase/supabase";
import { parseMfidTable, parseMfidTableRow } from "../schemas/mfid-table.schema";
import { MfidFormPayload } from "../components/MfidFormDialog";


export class Mfid {
  private constructor() { }

  static async getAll() {
    const client = await this._client
    const { data, error } = await client
      .from("mfid_details")
      .select("*")

    if (error) {
      throw error;
    }
    return parseMfidTable(data)
  }

  static async getSingle(mfid: string) {
    const client = await this._client
    const { data, error } = await client
      .from("mfid_details")
      .select("*")
      .eq("mfid", mfid)
      .single()

    if (error) {
      throw error;
    }

    return parseMfidTableRow(data)
  }

  static async create(payload: MfidFormPayload) {
    const client = await getSupabase()

    console.log("Mfid.create - payload", payload)

    const { data, error } = await client.rpc('create_mfid', {
      p_municity: payload.city_municipality,
      p_province: payload.province,
      p_barangay_name: payload.barangay ?? null,
      p_farmer_first_name: payload.farmer_first_name,
      p_farmer_last_name: payload.farmer_last_name,
      p_farmer_gender: payload.farmer_gender,
      p_farmer_dob: payload.farmer_date_of_birth,
      p_farmer_cellphone: payload.farmer_cellphone_no,
    });

    if (error) throw error;
    return data;
  }

  private static get _client() {
    return getSupabase();
  }
}
