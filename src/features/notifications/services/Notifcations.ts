import { getSupabase } from "@/core/supabase";
import { parseNotificationArray } from "../schema/notification";
import type { Notification } from "../schema/notification";

export class Notifications {
  private constructor() {}

  static async getAll(): Promise<Notification[]> {
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .or(`target_role.eq.data_manager`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return parseNotificationArray(data);
  }

  static async markAsRead(id: number): Promise<void> {
    const supabase = await getSupabase();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", id);
    if (error) throw error;
  }

  static async markAllAsRead(): Promise<void> {
    const supabase = await getSupabase();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("target_role", "data_manager");

    if (error) throw error;
  }
}
