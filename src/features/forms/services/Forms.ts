import { getSupabase } from "@/core/supabase";
import { FormRouteType } from "@/routes/_manager/forms/-config";
import { FormDataEntry, parseFormData, parseFormDataEntry } from "../schemas/formData";


export class Forms {
  public static async getFormDataByMfid(formType: FormRouteType, mfid: string): Promise<FormDataEntry> {
    const startTime = performance.now();
    const client = await this._client;
    const query = client
      .from("field_activity_details")
      .select("*")
      .eq("mfid", mfid)
      .eq("activity_type", formType).single();

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const endTime = performance.now();
    console.log(formType, "entry took", endTime - startTime, "ms");
    return parseFormDataEntry(data);
  }


  public static async getFormData(formType: FormRouteType): Promise<FormDataEntry[]> {
    const startTime = performance.now();
    const client = await this._client;
    const query = client
      .from("field_activity_details")
      .select("*")
      .eq("activity_type", formType);

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    const endTime = performance.now();
    console.log(formType, "took", endTime - startTime, "ms");
    return parseFormData(data)
  }

  private static get _client() {
    return getSupabase();
  }
  private constructor() {}
}
