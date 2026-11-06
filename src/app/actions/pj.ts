"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { JadwalService } from "@/services/jadwal.service";
import { SesiService } from "@/services/sesi.service";
import type {
  JadwalKelasDetail,
  SesiPerkuliahanDetail,
  MetodeKelas,
  StatusDosen,
} from "@/services/types";

// Fallback default PJ: Rizky Maulana
const DEFAULT_PJ_ID = "da42b508-8257-4628-943c-86b7c3aa851a";

/**
 * Mengambil data lengkap untuk Dashboard PJ dari Supabase
 */
export async function getPjDashboardDataAction(explicitUserId?: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = explicitUserId || user?.id || DEFAULT_PJ_ID;
  const admin = createAdminClient();
  const today = new Date().toISOString().split("T")[0];

  // 1. Ambil jadwal kelas yang di-PJ-kan
  const jadwal = await JadwalService.getJadwalPj(userId);

  if (!jadwal) {
    return {
      userId,
      jadwal: null,
      sesiHariIni: null,
      riwayatSesi: [],
      temanSekelas: [],
      tunggakanSesi: null,
      delegasiHariIni: null,
      isDelegatedToMe: false,
    };
  }

  // 2. Cek apakah user adalah PJ Pengganti
  const isDelegatedToMe = jadwal.pj?.id !== userId;

  // 3. Sesi hari ini
  const sesiHariIni = await SesiService.getSesiHariIni(jadwal.id);

  // 4. Riwayat semua sesi perkuliahan untuk kelas ini
  const riwayatSesi = await SesiService.getRiwayatSesi(jadwal.id);

  // 5. Cek tunggakan sesi (tanggal lampau yang belum ada dilaporkan_oleh)
  const tunggakanSesi =
    riwayatSesi.find((s) => s.tanggal < today && !s.dilaporkan_oleh) || null;

  // 6. Daftar teman sekelas untuk delegasi wewenang
  const temanSekelas = await JadwalService.getTemanSekelas(jadwal.id, userId);

  // 7. Cek status delegasi hari ini
  const { data: delegasiData } = await admin
    .from("delegasi_pj")
    .select(`
      id,
      alasan,
      tanggal,
      pj_pengganti:profiles!delegasi_pj_pj_pengganti_id_fkey(id, nama, email)
    `)
    .eq("jadwal_id", jadwal.id)
    .eq("tanggal", today)
    .maybeSingle();

  return {
    userId,
    jadwal,
    sesiHariIni,
    riwayatSesi,
    temanSekelas,
    tunggakanSesi,
    delegasiHariIni: delegasiData
      ? {
          id: delegasiData.id,
          alasan: delegasiData.alasan,
          pjPengganti: (delegasiData as any).pj_pengganti,
        }
      : null,
    isDelegatedToMe,
  };
}

/**
 * Server Action: Buka sesi perkuliahan baru
 */
export async function bukaSesiPjAction(params: {
  jadwalId: string;
  metode: MetodeKelas;
  statusDosen: StatusDosen;
  pjId?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = params.pjId || user?.id || DEFAULT_PJ_ID;

  const sesi = await SesiService.bukaSesi({
    jadwalId: params.jadwalId,
    metode: params.metode,
    statusDosen: params.statusDosen,
    dilaporkanOleh: userId,
  });

  if (!sesi) {
    return { success: false, message: "Gagal membuka sesi perkuliahan." };
  }

  return { success: true, sesi };
}

/**
 * Server Action: Tutup sesi perkuliahan
 */
export async function tutupSesiPjAction(sesiId: string) {
  const ok = await SesiService.tutupSesi(sesiId);
  if (!ok) {
    return { success: false, message: "Gagal menutup sesi perkuliahan." };
  }
  return { success: true };
}

/**
 * Server Action: Selesaikan laporan sesi yang tertunggak
 */
export async function selesaikanTunggakanPjAction(params: {
  sesiId: string;
  metode: MetodeKelas;
  statusDosen: StatusDosen;
  pjId?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = params.pjId || user?.id || DEFAULT_PJ_ID;

  const ok = await SesiService.selesaikanTunggakan({
    sesiId: params.sesiId,
    metode: params.metode,
    statusDosen: params.statusDosen,
    dilaporkanOleh: userId,
  });

  if (!ok) {
    return { success: false, message: "Gagal menyelesaikan laporan tunggakan." };
  }

  return { success: true };
}

/**
 * Server Action: Delegasikan wewenang PJ ke teman sekelas
 */
export async function delegasikanPjAction(params: {
  jadwalId: string;
  pjPenggantiId: string;
  pjAsalId?: string;
  alasan?: string;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pjAsalId = params.pjAsalId || user?.id || DEFAULT_PJ_ID;

  const ok = await SesiService.delegasikanPj({
    jadwalId: params.jadwalId,
    pjAsalId,
    pjPenggantiId: params.pjPenggantiId,
    alasan: params.alasan,
  });

  if (!ok) {
    return { success: false, message: "Gagal menyimpan delegasi PJ." };
  }

  return { success: true };
}

/**
 * Server Action: Batalkan delegasi PJ hari ini
 */
export async function batalkanDelegasiPjAction(jadwalId: string) {
  const ok = await SesiService.batalkanDelegasiPj(jadwalId);
  if (!ok) {
    return { success: false, message: "Gagal membatalkan delegasi PJ." };
  }
  return { success: true };
}
