import { getSupabase } from "@/core/supabase";
import { isValidDate } from "@/core/utils/date";
import { parseSeasonsTable, SeasonRow } from "../schemas/seasons";

export class Seasons {

  public static async getAll(): Promise<SeasonRow[]> {
    const client = await this._client
    const { data, error } = await client
      .from("seasons")
      .select("*")
      ;
    if (error) {
      throw error;
    }
    return parseSeasonsTable(data)
  }

  public static async getSeasonIdByDate(date: string) {

    if (!date) return null;
    if (!isValidDate(date)) return null;

    const client = await this._client
    const { data, error } = await client.rpc("find_season_id_by_date", {
      p_date: date
    })

    if (error) {
      throw error;
    }

    return data
  }


  private static get _client() {
    return getSupabase();
  }

  private constructor() { }
}
