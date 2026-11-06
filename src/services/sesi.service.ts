import { createAdminClient } from "@/lib/supabase/admin";
import type {
  MetodeKelas,
  StatusDosen,
  SesiPerkuliahanDetail,
} from "./types";

export const SesiService = {
  /**
   * Mengambil sesi pertemuan aktif hari ini untuk jadwal tertentu
   */
  async getSesiHariIni(jadwalId: string): Promise<SesiPerkuliahanDetail | null> {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("sesi_perkuliahan")
      .select("*")
      .eq("jadwal_id", jadwalId)
      .eq("tanggal", today)
      .maybeSingle();

    if (error || !data) return null;
    return data as SesiPerkuliahanDetail;
  },

  /**
   * PJ atau Dosen membuka sesi perkuliahan baru
   */
  async bukaSesi(params: {
    jadwalId: string;
    metode: MetodeKelas;
    statusDosen: StatusDosen;
    dilaporkanOleh: string;
    pjPenggantiId?: string | null;
  }): Promise<SesiPerkuliahanDetail | null> {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split("T")[0];
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("sesi_perkuliahan")
      .upsert(
        {
          jadwal_id: params.jadwalId,
          tanggal: today,
          status_dosen: params.statusDosen,
          metode_kelas: params.metode,
          timestamp_buka: now,
          dilaporkan_oleh: params.dilaporkanOleh,
          pj_pengganti_id: params.pjPenggantiId || null,
        },
        { onConflict: "jadwal_id,tanggal" }
      )
      .select()
      .single();

    if (error || !data) {
      console.error("Gagal membuka sesi:", error);
      return null;
    }
    return data as SesiPerkuliahanDetail;
  },

  /**
   * Menutup sesi perkuliahan
   */
  async tutupSesi(sesiId: string): Promise<boolean> {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { error } = await supabase
      .from("sesi_perkuliahan")
      .update({ timestamp_tutup: now })
      .eq("id", sesiId);

    return !error;
  },

  /**
   * Delegasi wewenang PJ ke teman sekelas untuk 1 pertemuan
   */
  async delegasikanPj(params: {
    jadwalId: string;
    pjAsalId: string;
    pjPenggantiId: string;
    alasan?: string;
  }): Promise<boolean> {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("delegasi_pj").upsert(
      {
        jadwal_id: params.jadwalId,
        tanggal: today,
        pj_asal_id: params.pjAsalId,
        pj_pengganti_id: params.pjPenggantiId,
        alasan: params.alasan || "Izin berhalangan",
      },
      { onConflict: "jadwal_id,tanggal" }
    );

    return !error;
  },
};

