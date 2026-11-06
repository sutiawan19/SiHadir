import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { calculateDistanceMeters } from "@/lib/haversine";
import type { StatusPresensi, PresensiRecord } from "./types";

export const PresensiService = {
  /**
   * Rekam kehadiran mahasiswa dengan validasi Geofencing server-side
   */
  async rekamPresensi(params: {
    sesiId: string;
    mahasiswaId: string;
    latMhs?: number | null;
    longMhs?: number | null;
  }): Promise<{
    success: boolean;
    message: string;
    jarakMeter?: number;
    status?: StatusPresensi;
  }> {
    const admin = createAdminClient();

    // 1. Ambil info sesi dan jadwal terkait
    const { data: sesi, error: errSesi } = await admin
      .from("sesi_perkuliahan")
      .select(`
        id,
        metode_kelas,
        timestamp_buka,
        timestamp_tutup,
        jadwal:jadwal_kelas (
          gedung:master_gedung (*)
        )
      `)
      .eq("id", params.sesiId)
      .single();

    if (errSesi || !sesi) {
      return { success: false, message: "Sesi perkuliahan tidak ditemukan." };
    }

    if (sesi.timestamp_tutup) {
      return { success: false, message: "Sesi presensi perkuliahan telah ditutup." };
    }

    let jarakMeter: number | null = null;
    let statusPresensi: StatusPresensi = "hadir";

    // 2. Jika kelas luring, validasi Geofencing dengan rumus Haversine
    if (sesi.metode_kelas === "luring") {
      if (!params.latMhs || !params.longMhs) {
        return {
          success: false,
          message: "Koordinat GPS perangkat diperlukan untuk presensi kelas luring.",
        };
      }

      const gedung = (sesi.jadwal as any)?.gedung;
      if (!gedung) {
        return {
          success: false,
          message: "Lokasi gedung kelas tidak terkonfigurasi.",
        };
      }

      jarakMeter = calculateDistanceMeters(
        params.latMhs,
        params.longMhs,
        gedung.lat_pusat,
        gedung.long_pusat
      );

      // Cek apakah di luar radius maksimal gedung (default 60m / 80m)
      if (jarakMeter > gedung.radius_meter) {
        return {
          success: false,
          message: `Posisi Anda berjarak ${jarakMeter} meter dari gedung ${gedung.nama_gedung}. Batas maksimal adalah ${gedung.radius_meter} meter.`,
          jarakMeter,
        };
      }
    }

    // 3. Simpan rekam presensi ke database via Admin
    const { error: errInsert } = await admin
      .from("presensi_mahasiswa")
      .upsert(
        {
          sesi_id: params.sesiId,
          mahasiswa_id: params.mahasiswaId,
          waktu_hadir: new Date().toISOString(),
          lat_mhs: params.latMhs || null,
          long_mhs: params.longMhs || null,
          jarak_meter: jarakMeter,
          status: statusPresensi,
        },
        { onConflict: "sesi_id,mahasiswa_id" }
      );

    if (errInsert) {
      console.error("Gagal menyimpan presensi:", errInsert);
      return { success: false, message: "Gagal menyimpan presensi ke database." };
    }

    return {
      success: true,
      message:
        sesi.metode_kelas === "luring"
          ? `Kehadiran tercatat. Validasi geofencing lolos (${jarakMeter} m).`
          : "Kehadiran kelas daring berhasil dicatat.",
      jarakMeter: jarakMeter || undefined,
      status: statusPresensi,
    };
  },

  /**
   * Mengambil riwayat kehadiran mahasiswa
   */
  async getRiwayatMahasiswa(mahasiswaId: string): Promise<PresensiRecord[]> {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("presensi_mahasiswa")
      .select(`
        id,
        sesi_id,
        mahasiswa_id,
        waktu_hadir,
        lat_mhs,
        long_mhs,
        jarak_meter,
        status,
        sesi:sesi_perkuliahan (
          id,
          tanggal,
          metode_kelas,
          jadwal:jadwal_kelas (
            kelas,
            matkul:mata_kuliah (nama_matkul, kode_matkul),
            gedung:master_gedung (nama_gedung)
          )
        )
      `)
      .eq("mahasiswa_id", mahasiswaId)
      .order("waktu_hadir", { ascending: false });

    if (error || !data) return [];
    return data as unknown as PresensiRecord[];
  },

  /**
   * Koreksi status presensi mahasiswa oleh Dosen
   */
  async koreksiPresensi(
    presensiId: string,
    status: StatusPresensi
  ): Promise<boolean> {
    const admin = createAdminClient();
    const { error } = await admin
      .from("presensi_mahasiswa")
      .update({ status })
      .eq("id", presensiId);

    return !error;
  },
};

