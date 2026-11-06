import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import type { ProfileRecord } from "./types";

export const ProfileService = {
  /**
   * Mengambil profile berdasarkan userId
   */
  async getProfile(userId: string): Promise<ProfileRecord | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !data) return null;
    return data as ProfileRecord;
  },

  /**
   * Mengambil profile user yang saat ini sedang login
   */
  async getCurrentProfile(): Promise<ProfileRecord | null> {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;
    return this.getProfile(user.id);
  },

  /**
   * Memperbarui profil
   */
  async updateProfile(
    userId: string,
    updates: Partial<Pick<ProfileRecord, "nama" | "prodi_id">>
  ): Promise<ProfileRecord | null> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)
      .select()
      .single();

    if (error || !data) return null;
    return data as ProfileRecord;
  },
};

