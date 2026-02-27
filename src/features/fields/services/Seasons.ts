import { getSupabase } from "@/core/supabase";
import { isValidDate } from "@/core/utils/date";
import { parseSeasonRow, parseSeasonsTable, SeasonRow } from "../schemas/seasons";

export class Seasons {

  public static async getAll(): Promise<SeasonRow[]> {
    const client = await this._client
    const today = new Date().toISOString().split("T")[0];
    const { data, error } = await client
      .from("seasons")
      .select("*")
      .lte('start_date', today)
      .order("start_date", { ascending: false })

    if (error) {
      throw error;
    }
    return parseSeasonsTable(data)
  }

  public static async getById(id?: number): Promise<SeasonRow | null> {
    const client = await this._client;
    const today = new Date().toISOString().split("T")[0];

    let query = client.from("seasons").select("*");

    if (id === undefined || id === null) {
      query = query
        .lte("start_date", today)
        .order("start_date", { ascending: false })
        .limit(1);
    } else {
      query = query.eq("id", id);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return parseSeasonRow(data);
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
