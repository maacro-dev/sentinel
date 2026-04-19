import { getSupabase } from "@/core/supabase";
import { Validator } from "@/core/utils/validator";
import { z } from "zod/v4";
import { CollectionTask, collectionTaskSchema, CollectionTaskInput, parseCollectionTasks } from "../schemas/collection.schema";

export class Collection {
  private constructor() { }

  static async getAll(seasonId?: number): Promise<CollectionTask[]> {
    const client = await getSupabase();
    let query = client
      .from("collection_details")
      .select("*")
      .order("created_at", { ascending: false });

    if (seasonId) {
      query = query.eq("season_id", seasonId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return parseCollectionTasks(data);
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

  static async getByMfid(mfid: string, seasonId?: number): Promise<CollectionTask[]> {
    const client = await getSupabase();
    let query = client
      .from("collection_details")
      .select("*")
      .eq("mfid", mfid)
      .order("created_at", { ascending: false });

    if (seasonId) {
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

  static async delete(taskId: number): Promise<void> {
    const client = await getSupabase();

    const { error } = await client.rpc('delete_collection_task', {
      p_task_id: taskId,
    });

    if (error) throw error;
  }
}
