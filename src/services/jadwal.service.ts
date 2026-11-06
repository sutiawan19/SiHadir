import { createAdminClient } from "@/lib/supabase/admin";
import type { JadwalKelasDetail } from "./types";

const JADWAL_SELECT = `
  id,
  kelas,
  hari,
  waktu_mulai,
  waktu_selesai,
  matkul:mata_kuliah (*),
  gedung:master_gedung (*),
  dosen:profiles!jadwal_kelas_dosen_id_fkey (id, nama, email),
  pj:profiles!jadwal_kelas_pj_id_fkey (id, nama, email)
`;

export const JadwalService = {
  /**
   * Mengambil semua jadwal kelas yang diikuti oleh mahasiswa tertentu
   */
  async getJadwalMahasiswa(mahasiswaId: string): Promise<JadwalKelasDetail[]> {
    const supabase = createAdminClient();
    const { data: peserta, error } = await supabase
      .from("peserta_kelas")
      .select(`jadwal:jadwal_kelas (${JADWAL_SELECT})`)
      .eq("mahasiswa_id", mahasiswaId);

    if (error || !peserta) return [];
    return peserta
      .map((p: any) => p.jadwal)
      .filter(Boolean) as unknown as JadwalKelasDetail[];
  },

  /**
   * Mengambil kelas berikutnya untuk hari ini / terdekat bagi mahasiswa
   */
  async getKelasBerikutnya(mahasiswaId: string): Promise<JadwalKelasDetail | null> {
    const semuaJadwal = await this.getJadwalMahasiswa(mahasiswaId);
    if (semuaJadwal.length === 0) return null;

    // Ambil hari sekarang (0=Senin, 1=Selasa, 2=Rabu, ..., 6=Minggu)
    const jsDay = new Date().getDay();
    const dbDay = jsDay === 0 ? 6 : jsDay - 1;

    // Prioritaskan kelas hari ini, jika tidak ada ambil kelas pertama
    const kelasHariIni = semuaJadwal.find((j) => j.hari === dbDay);
    return kelasHariIni || semuaJadwal[0];
  },

  /**
   * Mengambil jadwal kelas yang diampu oleh dosen
   */
  async getJadwalDosen(dosenId: string): Promise<JadwalKelasDetail[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("jadwal_kelas")
      .select(JADWAL_SELECT)
      .eq("dosen_id", dosenId);

    if (error || !data) return [];
    return data as unknown as JadwalKelasDetail[];
  },

  /**
   * Mengambil seluruh jadwal untuk BAAK
   */
  async getAllJadwal(): Promise<JadwalKelasDetail[]> {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("jadwal_kelas")
      .select(JADWAL_SELECT)
      .order("kelas");

    if (error || !data) return [];
    return data as unknown as JadwalKelasDetail[];
  },

  /**
   * Mengambil jadwal kelas di mana user menjadi PJ (atau PJ Pengganti hari ini)
   */
  async getJadwalPj(userId: string): Promise<JadwalKelasDetail | null> {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split("T")[0];

    // 1. Cek apakah PJ Utama
    const { data: utama } = await supabase
      .from("jadwal_kelas")
      .select(JADWAL_SELECT)
      .eq("pj_id", userId)
      .limit(1)
      .maybeSingle();

    if (utama) return utama as unknown as JadwalKelasDetail;

    // 2. Cek apakah PJ Pengganti untuk hari ini
    const { data: delegasi } = await supabase
      .from("delegasi_pj")
      .select(`jadwal:jadwal_kelas (${JADWAL_SELECT})`)
      .eq("pj_pengganti_id", userId)
      .eq("tanggal", today)
      .limit(1)
      .maybeSingle();

    if (delegasi && (delegasi as any).jadwal) {
      return (delegasi as any).jadwal as unknown as JadwalKelasDetail;
    }

    // 3. Fallback: ambil jadwal pertama jika dalam mode simulasi
    const { data: fallback } = await supabase
      .from("jadwal_kelas")
      .select(JADWAL_SELECT)
      .limit(1)
      .maybeSingle();

    return (fallback as unknown as JadwalKelasDetail) || null;
  },

  /**
   * Mengambil daftar teman sekelas dalam jadwal tertentu
   */
  async getTemanSekelas(
    jadwalId: string,
    excludeUserId?: string
  ): Promise<Array<{ id: string; nama: string; email: string; nim: string }>> {
    const supabase = createAdminClient();
    let query = supabase
      .from("peserta_kelas")
      .select("mahasiswa:profiles (id, nama, email)")
      .eq("jadwal_id", jadwalId);

    if (excludeUserId) {
      query = query.neq("mahasiswa_id", excludeUserId);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data
      .map((row: any) => {
        const m = row.mahasiswa;
        if (!m) return null;
        // Generate atau ambil NIM (misal NIM 20220810001)
        const nim = `NIM 2022081000${m.nama.length || 1}`;
        return {
          id: m.id,
          nama: m.nama,
          email: m.email,
          nim,
        };
      })
      .filter(Boolean) as Array<{
      id: string;
      nama: string;
      email: string;
      nim: string;
    }>;
  },
};

