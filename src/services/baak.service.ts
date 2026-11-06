import { createClient } from "@/lib/supabase/server";
import type { MasterGedungRecord } from "./types";

export const BaakService = {
  /**
   * Mengambil semua master gedung
   */
  async getAllGedung(): Promise<MasterGedungRecord[]> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("master_gedung")
      .select("*")
      .order("nama_gedung");

    if (error || !data) return [];
    return data as MasterGedungRecord[];
  },

  /**
   * Tambah master gedung baru
   */
  async createGedung(params: {
    namaGedung: string;
    latPusat: number;
    longPusat: number;
    radiusMeter: number;
  }): Promise<MasterGedungRecord | null> {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("master_gedung")
      .insert({
        nama_gedung: params.namaGedung,
        lat_pusat: params.latPusat,
        long_pusat: params.longPusat,
        radius_meter: params.radiusMeter,
      })
      .select()
      .single();

    if (error || !data) return null;
    return data as MasterGedungRecord;
  },

  /**
   * Update radius geofencing gedung
   */
  async updateRadiusGedung(
    gedungId: string,
    radiusMeter: number
  ): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase
      .from("master_gedung")
      .update({ radius_meter: radiusMeter })
      .eq("id", gedungId);

    return !error;
  },

  /**
   * Tambah jadwal kelas baru
   */
  async createJadwal(params: {
    matkulId: string;
    dosenId: string;
    pjId?: string | null;
    gedungId?: string | null;
    kelas: string;
    hari: number;
    waktuMulai: string;
    waktuSelesai: string;
  }): Promise<boolean> {
    const supabase = await createClient();
    const { error } = await supabase.from("jadwal_kelas").insert({
      matkul_id: params.matkulId,
      dosen_id: params.dosenId,
      pj_id: params.pjId || null,
      gedung_id: params.gedungId || null,
      kelas: params.kelas,
      hari: params.hari,
      waktu_mulai: params.waktuMulai,
      waktu_selesai: params.waktuSelesai,
    });

    return !error;
  },
};

