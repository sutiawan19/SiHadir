"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { JadwalService } from "@/services/jadwal.service";
import { SesiService } from "@/services/sesi.service";
import { PresensiService } from "@/services/presensi.service";
import { ProfileService } from "@/services/profile.service";
import type { JadwalKelasDetail, SesiPerkuliahanDetail, PresensiRecord } from "@/services/types";

// Fallback ID default mahasiswa Sutiawan jika session cookie belum diset
const DEFAULT_MAHASISWA_ID = "babccf89-45a4-4622-bbc2-c0ef7b56246d";

/**
 * Mengambil data lengkap untuk Halaman Beranda Mahasiswa dari Supabase
 */
export async function getBerandaDataAction(explicitUserId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = explicitUserId || user?.id || DEFAULT_MAHASISWA_ID;
  const admin = createAdminClient();

  // 1. Ambil Profil Mahasiswa
  const profile = await ProfileService.getProfile(userId);

  // 2. Ambil Kelas Berikutnya
  const kelasBerikutnya = await JadwalService.getKelasBerikutnya(userId);

  // 3. Cek Sesi Hari Ini untuk Kelas Berikutnya
  let sesiHariIni: SesiPerkuliahanDetail | null = null;
  let sudahAbsenHariIni = false;
  let presensiHariIni: any = null;

  if (kelasBerikutnya) {
    sesiHariIni = await SesiService.getSesiHariIni(kelasBerikutnya.id);

    if (sesiHariIni) {
      const { data: presensiCheck } = await admin
        .from("presensi_mahasiswa")
        .select("id, status, waktu_hadir, jarak_meter")
        .eq("sesi_id", sesiHariIni.id)
        .eq("mahasiswa_id", userId)
        .maybeSingle();

      if (presensiCheck) {
        sudahAbsenHariIni = true;
        presensiHariIni = presensiCheck;
      }
    }
  }

  // 4. Ambil Riwayat Kehadiran Nyata Mahasiswa
  const riwayat = await PresensiService.getRiwayatMahasiswa(userId);

  // 5. Cek Notifikasi Delegasi PJ Hari Ini
  const today = new Date().toISOString().split("T")[0];
  const { data: delegasi } = await admin
    .from("delegasi_pj")
    .select(`
      id,
      alasan,
      jadwal:jadwal_kelas (
        matkul:mata_kuliah (nama_matkul)
      )
    `)
    .eq("pj_pengganti_id", userId)
    .eq("tanggal", today)
    .maybeSingle();

  return {
    userId,
    profile: profile || {
      id: userId,
      nama: user?.user_metadata?.full_name || "Sutiawan",
      email: user?.email || "sutiawan@student.unsap.ac.id",
      role: "mahasiswa" as const,
      prodi_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    kelasBerikutnya,
    sesiHariIni,
    sudahAbsenHariIni,
    presensiHariIni,
    riwayat,
    delegasiNotification: delegasi
      ? {
          aktif: true,
          pesan: `Kamu ditunjuk sebagai PJ Pengganti untuk ${(delegasi.jadwal as any)?.matkul?.nama_matkul || "perkuliahan hari ini"}.`,
        }
      : null,
  };
}

/**
 * Mengambil data untuk Halaman Kehadiran Mahasiswa dari Supabase
 */
export async function getKehadiranDataAction(explicitUserId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = explicitUserId || user?.id || DEFAULT_MAHASISWA_ID;
  const admin = createAdminClient();

  // 1. Ambil seluruh mata kuliah / jadwal kelas yang diikuti mahasiswa
  const daftarJadwal = await JadwalService.getJadwalMahasiswa(userId);

  // 2. Kelas aktif hari ini / terpilih
  const kelasAktif = daftarJadwal.length > 0 ? daftarJadwal[0] : null;

  // 3. Sesi hari ini
  let sesiHariIni: SesiPerkuliahanDetail | null = null;
  let sudahAbsen = false;
  let presensiHariIni: any = null;

  if (kelasAktif) {
    sesiHariIni = await SesiService.getSesiHariIni(kelasAktif.id);
    if (sesiHariIni) {
      const { data: p } = await admin
        .from("presensi_mahasiswa")
        .select("id, status, waktu_hadir, jarak_meter")
        .eq("sesi_id", sesiHariIni.id)
        .eq("mahasiswa_id", userId)
        .maybeSingle();
      if (p) {
        sudahAbsen = true;
        presensiHariIni = p;
      }
    }
  }

  // 4. Riwayat kehadiran mahasiswa
  const riwayat = await PresensiService.getRiwayatMahasiswa(userId);

  return {
    userId,
    daftarJadwal,
    kelasAktif,
    sesiHariIni,
    sudahAbsen,
    presensiHariIni,
    riwayat,
  };
}

/**
 * Server Action: Rekam presensi dengan koordinat GPS Geofencing nyata
 */
export async function recordAttendanceAction(params: {
  sesiId: string;
  mahasiswaId?: string;
  latMhs?: number | null;
  longMhs?: number | null;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = params.mahasiswaId || user?.id || DEFAULT_MAHASISWA_ID;

  return PresensiService.rekamPresensi({
    sesiId: params.sesiId,
    mahasiswaId: userId,
    latMhs: params.latMhs,
    longMhs: params.longMhs,
  });
}
