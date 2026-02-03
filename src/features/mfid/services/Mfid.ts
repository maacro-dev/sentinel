import { getSupabase } from "@/core/supabase/supabase";
import { parseMfidTable, parseMfidTableRow } from "../schemas/mfid-table.schema";
import { MfidFormInput } from "../schemas/mfid-create.schema";


export class Mfid {
  private constructor() { }

  static async getAll() {
    const client = await this._client
    const { data, error } = await client
      .from("mfid_details")
      .select("*")
      ;
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

  static async create(form: MfidFormInput) {
    const client = await getSupabase()
    const { data, error } = await client.functions.invoke("create-mfid", {
      body: form,
    });

    if (error) {
      throw error
    }

    console.log("data =", data)
    return data;
  }

  private static get _client() {
    return getSupabase();
  }
}
