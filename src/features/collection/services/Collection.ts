import { getSupabase } from "@/core/supabase";
import { Validator } from "@/core/utils/validator";
import { z } from "zod/v4";
import { CollectionTask, collectionTaskSchema, CollectionTaskInput, parseCollectionTasks } from "../schemas/collection.schema";

export class Collection {
  private constructor() { }

  static async getAll(seasonId: number | undefined | null): Promise<CollectionTask[]> {
    const client = await getSupabase();
    let query = client
      .from("collection_details")
      .select("*")
      .order("start_date", { ascending: true });

    if (seasonId) {
      query = query.eq("season_id", seasonId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return parseCollectionTasks(data);
  }

  static async scheduleFieldDataAndCore(input: CollectionTaskInput): Promise<number> {
    const client = await getSupabase();

    const { data: taskId, error } = await client.rpc('schedule_core_collection_tasks', {
      p_mfid: input.mfid,
      p_season_id: input.season_id,
      p_activity_type: input.activity_type,
      p_collector_id: input.collector_id,
      p_start_date: input.start_date,
      p_end_date: input.end_date,
      p_schedule_all: true,
      // @ts-ignore
      p_retake_of: input.retake_of,
    });

    if (error) throw error;
    return taskId;
  }

  static async batchScheduleFieldData(input: {
    mfids: string[];
    seasonId: number;
    collectorId: string;
    startDate: string;
    endDate: string;
  }): Promise<void> {
    const client = await getSupabase();
    const { error } = await client.rpc('batch_schedule_core_collection_tasks', {
      p_mfids: input.mfids,
      p_season_id: input.seasonId,
      p_collector_id: input.collectorId,
      p_start_date: input.startDate,
      p_end_date: input.endDate,
    });

    if (error) throw error;
  }

  static async getUnscheduledByLocation(
    seasonId: number,
    province: string,
    municipality: string,
    barangay: string
  ): Promise<string[]> {
    const client = await getSupabase();
    const { data, error } = await client.rpc('get_unscheduled_mfids_by_location', {
      p_season_id: seasonId,
      p_province: province,
      p_city_municipality: municipality,
      p_barangay: barangay,
    });
    if (error) throw error;
    return data as string[];
  }

  static async getUnscheduledLocations(seasonId: number): Promise<
    { province: string; city_municipality: string; barangay: string }[]
  > {
    const client = await getSupabase();
    const { data, error } = await client.rpc('get_unscheduled_mfid_locations', {
      p_season_id: seasonId,
    });
    if (error) throw error;
    return data;
  }

  static async create(input: CollectionTaskInput): Promise<number> {
    const client = await getSupabase();

    const { data: taskId, error } = await client.rpc('create_collection_task', {
      p_mfid: input.mfid,
      p_season_id: input.season_id,
      p_activity_type: input.activity_type,
      p_collector_id: input.collector_id,
      p_start_date: input.start_date,
      p_end_date: input.end_date,
      // @ts-ignore
      p_retake_of: input.retake_of || null,
    });

    if (error) throw error;
    return taskId;
  }

  static async getByMfid(mfid: string, seasonId?: number | null): Promise<CollectionTask[]> {
    const client = await getSupabase();
    let query = client
      .from("collection_details")
      .select("*")
      .eq("mfid", mfid)
      .order("created_at", { ascending: false });

    if (seasonId != null) {
      query = query.eq("season_id", seasonId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return Validator.create<CollectionTask[]>(z.array(collectionTaskSchema))(data || []);
  }

  static async update(taskId: number, input: Partial<CollectionTaskInput>): Promise<void> {
    const client = await getSupabase();

    const { error } = await client.rpc('update_collection_task', {
      p_task_id: taskId,
      p_collector_id: input.collector_id,
      p_start_date: input.start_date,
      p_end_date: input.end_date,
    });

    if (error) throw error;
  }

  static async updateFieldDataWithCascade(
    taskId: number,
    input: { collector_id?: string; start_date?: string; end_date?: string }
  ): Promise<void> {
    const client = await getSupabase();
    const { error } = await client.rpc('update_field_data_with_cascade', {
      p_task_id: taskId,
      p_collector_id: input.collector_id,
      p_start_date: input.start_date,
      p_end_date: input.end_date,
    });
    if (error) throw error;
  }

  static async delete(taskId: number): Promise<void> {
    const client = await getSupabase();

    const { error } = await client.rpc('delete_collection_task', {
      p_task_id: taskId,
    });

    if (error) throw error;
  }
}
