import { getSupabase } from "@/core/supabase";
import { FormType } from "@/routes/_manager/forms/-config";
import { FormDataEntry, parseFormData, parseFormDataEntry } from "../schemas/formData";

export class Forms {
  public static async getFormDataByMfid(formType: FormType, mfid: string, seasonId?: number): Promise<FormDataEntry> {

    const client = await this._client;
    let query = client
      .from("field_activity_details")
      .select("*")
      .eq("mfid", mfid)
      .eq("activity_type", formType)

    if (seasonId) {
      query = query.eq("season_id", seasonId);
    }

    const { data, error } = await query.single();

    if (error) {
      throw error;
    }

    return parseFormDataEntry(data);
  }


  public static async getFormData(formType: FormType, seasonId?: number): Promise<FormDataEntry[]> {
    const client = await this._client;
    let query = client
      .from("field_activity_details")
      .select("*")
      .eq("activity_type", formType);

    if (seasonId) {
      query = query.eq("season_id", seasonId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return parseFormData(data);
  }

  private static get _client() {
    return getSupabase();
  }
  private constructor() { }
}
