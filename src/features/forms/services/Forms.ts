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

    if (data.image_urls && Array.isArray(data.image_urls)) {
      const promises = data.image_urls.map(async (path) => {
        const { data: urlData, error } = await client.storage
          .from("form-images")
          .createSignedUrl(path, 3600);

        if (error) throw error;

        return urlData.signedUrl;
      });

      data.image_urls = await Promise.all(promises);
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

  public static async updateVerification(
    id: number,
    verificationStatus: 'approved' | 'rejected',
    remarks?: string | null,
    verifiedBy?: string
  ): Promise<void> {
    const client = await this._client;
    const updates: any = {
      verification_status: verificationStatus,
      verified_at: new Date().toISOString(),
    };
    if (verifiedBy) {
      updates.verified_by = verifiedBy;
    }
    if (remarks !== undefined) {
      updates.remarks = remarks;
    }
    const { error } = await client
      .from('field_activities')
      .update(updates)
      .eq('id', id);
    if (error) throw new Error(`Failed to update verification: ${error.message}`);
  }

  private constructor() { }
}
