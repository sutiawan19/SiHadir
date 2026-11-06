"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { JadwalService } from "@/services/jadwal.service";
import type { StatusPresensi } from "@/services/types";

const DEFAULT_DOSEN_ID = "35d1258f-495f-462e-8841-eb9582a6d3f8";

export interface MahasiswaKelasDosen {
  id: string;
  nama: string;
  nim: string;
  email: string;
  kehadiranPerSesi: Record<string, boolean>; // sesiId -> boolean
  totalHadir: number;
  persenKehadiran: number;
  poinKehadiran: number;
}

export interface KelasDosenDetail {
  id: string;
  kelas: string;
  nama: string;
  kode: string;
  bobot: number;
  gedung: string;
  pertemuanList: Array<{ id: string; label: string; tanggal: string }>;
  mahasiswaList: MahasiswaKelasDosen[];
}

export interface EwsStudentItem {
  id: string;
  nama: string;
  nim: string;
  kelas: string;
  matkul: string;
  persen: number;
}

/**
 * Mengambil seluruh data dashboard dosen dari Supabase
 */
export async function getDosenDashboardDataAction(explicitUserId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = explicitUserId || user?.id || DEFAULT_DOSEN_ID;
  const admin = createAdminClient();

  // 1. Profil Dosen
  const { data: profile } = await admin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  // 2. Ambil jadwal kelas yang diampu dosen
  const jadwalList = await JadwalService.getJadwalDosen(userId);

  // Jika belum ada jadwal terdaftar, ambil fallback semua jadwal untuk demonstrasi
  const activeJadwals =
    jadwalList.length > 0 ? jadwalList : await JadwalService.getAllJadwal();

  const kelasDetails: KelasDosenDetail[] = [];
  const ewsStudents: EwsStudentItem[] = [];
  let totalMahasiswaGlobal = 0;

  for (const j of activeJadwals) {
    // Sesi pertemuan kelas ini
    const { data: sesiList } = await admin
      .from("sesi_perkuliahan")
      .select("id, tanggal, metode_kelas")
      .eq("jadwal_id", j.id)
      .order("tanggal", { ascending: true });

    const pertemuans = (sesiList || []).map((s, idx) => ({
      id: s.id,
      label: `PT 0${idx + 1}`,
      tanggal: s.tanggal,
    }));

    // Peserta kelas
    const { data: peserta } = await admin
      .from("peserta_kelas")
      .select("mahasiswa:profiles(*)")
      .eq("jadwal_id", j.id);

    const mhsProfiles = (peserta || [])
      .map((p: any) => p.mahasiswa)
      .filter(Boolean);

    totalMahasiswaGlobal += mhsProfiles.length;

    // Presensi untuk semua sesi dalam kelas ini
    const sesiIds = (sesiList || []).map((s) => s.id);
    let presensiRows: any[] = [];
    if (sesiIds.length > 0) {
      const { data: pRows } = await admin
        .from("presensi_mahasiswa")
        .select("id, sesi_id, mahasiswa_id, status")
        .in("sesi_id", sesiIds);
      presensiRows = pRows || [];
    }

    const bobot = (j.matkul as any)?.bobot_nilai_absen || 10;
    const totalSesi = pertemuans.length || 1;

    const mahasiswaFormatted: MahasiswaKelasDosen[] = mhsProfiles.map(
      (m: any, idx: number) => {
        const kehadiranPerSesi: Record<string, boolean> = {};
        let hadirCount = 0;

        for (const p of pertemuans) {
          const match = presensiRows.find(
            (r) => r.sesi_id === p.id && r.mahasiswa_id === m.id
          );
          const isHadir = match
            ? match.status === "hadir" || match.status === "terlambat"
            : false;
          kehadiranPerSesi[p.id] = isHadir;
          if (isHadir) hadirCount++;
        }

        const persen = Math.round((hadirCount / totalSesi) * 100);
        const poin = Number(((persen * bobot) / 100).toFixed(1));
        const nim = `NIM 2022081000${idx + 1}`;

        if (persen < 75) {
          ewsStudents.push({
            id: m.id,
            nama: m.nama,
            nim,
            kelas: j.kelas,
            matkul: j.matkul?.nama_matkul || "Mata Kuliah",
            persen,
          });
        }

        return {
          id: m.id,
          nama: m.nama,
          nim,
          email: m.email,
          kehadiranPerSesi,
          totalHadir: hadirCount,
          persenKehadiran: persen,
          poinKehadiran: poin,
        };
      }
    );

    kelasDetails.push({
      id: j.id,
      kelas: j.kelas,
      nama: j.matkul?.nama_matkul || "Mata Kuliah",
      kode: j.matkul?.kode_matkul || "MK-001",
      bobot,
      gedung: j.gedung?.nama_gedung || "Gedung A",
      pertemuanList: pertemuans,
      mahasiswaList: mahasiswaFormatted,
    });
  }

  return {
    profile: profile || {
      id: userId,
      nama: "Agun Guntara, S.Kom., M.Kom",
      role: "dosen",
      email: "agun.guntara@unsap.ac.id",
    },
    stats: [
      { label: "Kelas Diampu", value: `${kelasDetails.length}` },
      { label: "Total Mahasiswa", value: `${totalMahasiswaGlobal}` },
      { label: "Peringatan EWS (<75%)", value: `${ewsStudents.length}` },
    ],
    kelasDetails,
    ewsStudents,
  };
}

/**
 * Server Action: Koreksi presensi mahasiswa secara manual oleh Dosen
 */
export async function koreksiPresensiDosenAction(params: {
  sesiId: string;
  mahasiswaId: string;
  status: StatusPresensi;
}) {
  const admin = createAdminClient();

  const { error } = await admin.from("presensi_mahasiswa").upsert(
    {
      sesi_id: params.sesiId,
      mahasiswa_id: params.mahasiswaId,
      status: params.status,
      waktu_hadir: new Date().toISOString(),
      jarak_meter: 0, // Dosen manual approval
    },
    { onConflict: "sesi_id,mahasiswa_id" }
  );

  if (error) {
    console.error("Gagal mengoreksi presensi:", error);
    return { success: false, message: "Gagal memperbarui presensi." };
  }

  return {
    success: true,
    message: `Presensi berhasil diubah menjadi ${params.status.toUpperCase()}.`,
  };
}
