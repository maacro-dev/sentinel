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

    console.log("collectionTasks:", data[0])

    return parseCollectionTasks(data)
  }

  static async create(input: CollectionTaskInput) {
    const client = await getSupabase();
    const { data: mfidRecord, error: mfidError } = await client
      .from("mfids")
      .select("id")
      .eq("mfid", input.mfid)
      .single();
    if (mfidError || !mfidRecord) throw new Error(`MFID "${input.mfid}" not found`);

    const insertData: any = {
      mfid_id: mfidRecord.id,
      season_id: input.season_id,
      activity_type: input.activity_type,
      collector_id: input.collector_id,
      start_date: input.start_date,
      end_date: input.end_date,
      assigned_at: new Date().toISOString(),
    };
    if (input.retake_of) {
      insertData.retake_of = input.retake_of;
    }

    const { error } = await client.from("collection_tasks").insert(insertData).single();
    if (error) throw error;
  }

  static async transfer(taskId: number, newCollectorId: string): Promise<CollectionTask> {
    const client = await getSupabase();
    const { data, error } = await client
      .from("collection_tasks")
      .update({
        collector_id: newCollectorId,
        assigned_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;
    return Validator.create<CollectionTask>(collectionTaskSchema)(data);
  }

  static async getByMfid(mfid: string): Promise<CollectionTask[]> {
    const client = await getSupabase();
    const { data, error } = await client
      .from("collection_details")
      .select("*")
      .eq("mfid", mfid)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return Validator.create<CollectionTask[]>(z.array(collectionTaskSchema))(data || []);
  }
}
