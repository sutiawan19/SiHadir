"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import {
  ArrowsLeftRight,
  CalendarBlank,
  ClockCounterClockwise,
  Warning,
  CheckCircle,
  X,
  CircleNotch,
  Broadcast,
  UserCheck,
  ArrowRight,
  Buildings,
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { pjNav } from "@/lib/nav";
import { useDemo } from "@/lib/demo-context";
import {
  getPjDashboardDataAction,
  bukaSesiPjAction,
  tutupSesiPjAction,
  selesaikanTunggakanPjAction,
  delegasikanPjAction,
  batalkanDelegasiPjAction,
} from "@/app/actions/pj";
import { formatHari, formatJam, formatTanggalIndo } from "@/lib/format";
import type {
  JadwalKelasDetail,
  SesiPerkuliahanDetail,
  MetodeKelas,
  StatusDosen,
} from "@/services/types";

const metodeOptions: MetodeKelas[] = ["luring", "daring"];
const statusOptions: StatusDosen[] = ["hadir", "terlambat", "izin", "sakit"];

export default function PjPage() {
  const { currentUser } = useDemo();
  const [isPending, startTransition] = useTransition();

  const [dashboardData, setDashboardData] = useState<{
    jadwal: JadwalKelasDetail | null;
    sesiHariIni: SesiPerkuliahanDetail | null;
    riwayatSesi: SesiPerkuliahanDetail[];
    temanSekelas: Array<{ id: string; nama: string; email: string; nim: string }>;
    tunggakanSesi: SesiPerkuliahanDetail | null;
    delegasiHariIni: {
      id: string;
      alasan: string;
      pjPengganti: { id: string; nama: string; email: string } | null;
    } | null;
    isDelegatedToMe: boolean;
  } | null>(null);

  // Form State Buka Presensi
  const [metode, setMetode] = useState<MetodeKelas>("luring");
  const [statusDosen, setStatusDosen] = useState<StatusDosen>("hadir");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State: Modal Tunggakan
  const [showTunggakanModal, setShowTunggakanModal] = useState(false);
  const [tunggakanMetode, setTunggakanMetode] = useState<MetodeKelas>("luring");
  const [tunggakanStatusDosen, setTunggakanStatusDosen] = useState<StatusDosen>("hadir");
  const [tunggakanMateri, setTunggakanMateri] = useState("Arsitektur Sistem Enterprise & ERP");

  // State: Delegasi Modal
  const [selectedTeman, setSelectedTeman] = useState<{
    id: string;
    nama: string;
    nim: string;
  } | null>(null);
  const [alasanDelegasi, setAlasanDelegasi] = useState("Izin Sakit");

  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const res = await getPjDashboardDataAction(currentUser.id);
        setDashboardData(res);
      } catch (err) {
        console.error("Gagal memuat data PJ:", err);
      }
    });
  }, [currentUser.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const jadwal = dashboardData?.jadwal;
  const sesiAktif = dashboardData?.sesiHariIni;
  const isSesiBuka = sesiAktif ? !sesiAktif.timestamp_tutup : false;
  const tunggakanSesi = dashboardData?.tunggakanSesi;
  const temanSekelas = dashboardData?.temanSekelas || [];
  const delegasi = dashboardData?.delegasiHariIni;
  const riwayatSesi = dashboardData?.riwayatSesi || [];

  // Handler: Buka Presensi
  const handleBukaPresensi = async () => {
    if (!jadwal) return;
    setIsSubmitting(true);
    try {
      const res = await bukaSesiPjAction({
        jadwalId: jadwal.id,
        metode,
        statusDosen,
        pjId: currentUser.id,
      });
      if (res.success) {
        loadData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Tutup Presensi
  const handleTutupPresensi = async () => {
    if (!sesiAktif) return;
    setIsSubmitting(true);
    try {
      const res = await tutupSesiPjAction(sesiAktif.id);
      if (res.success) {
        loadData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Selesaikan Tunggakan
  const handleSelesaikanTunggakan = async () => {
    if (!tunggakanSesi) return;
    setIsSubmitting(true);
    try {
      const res = await selesaikanTunggakanPjAction({
        sesiId: tunggakanSesi.id,
        metode: tunggakanMetode,
        statusDosen: tunggakanStatusDosen,
        pjId: currentUser.id,
      });
      if (res.success) {
        setShowTunggakanModal(false);
        loadData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Konfirmasi Delegasi
  const handleKonfirmasiDelegasi = async () => {
    if (!selectedTeman || !jadwal) return;
    setIsSubmitting(true);
    try {
      const res = await delegasikanPjAction({
        jadwalId: jadwal.id,
        pjAsalId: currentUser.id,
        pjPenggantiId: selectedTeman.id,
        alasan: alasanDelegasi,
      });
      if (res.success) {
        setSelectedTeman(null);
        loadData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler: Batalkan Delegasi
  const handleBatalkanDelegasi = async () => {
    if (!jadwal) return;
    setIsSubmitting(true);
    try {
      const res = await batalkanDelegasiPjAction(jadwal.id);
      if (res.success) {
        loadData();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const matkulNama = jadwal?.matkul?.nama_matkul || "Sistem Enterprise";
  const matkulKelas = jadwal?.kelas || "TI-3A";
  const gedungNama = jadwal?.gedung?.nama_gedung || "Gedung A";
  const jadwalHari = jadwal ? formatHari(jadwal.hari) : "Rabu";
  const jadwalWaktu = jadwal
    ? `${formatJam(jadwal.waktu_mulai)} - ${formatJam(jadwal.waktu_selesai)} WIB`
    : "08.00 - 10.00 WIB";

  return (
    <AppShell items={pjNav}>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-ink uppercase">
              {dashboardData?.isDelegatedToMe
                ? "PJ Pengganti Sementara"
                : "Dasbor Penanggung Jawab"}
            </span>
            {isPending && (
              <CircleNotch size={14} className="animate-spin text-primary" />
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold text-ink">Tugas PJ</h1>
          <p className="mt-0.5 text-xs text-muted flex items-center gap-1.5">
            <span>
              {matkulNama} ({matkulKelas}) · {jadwalHari}, {jadwalWaktu}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1">
              <Buildings size={13} /> {gedungNama}
            </span>
          </p>
        </div>

        {/* Banner Tunggakan (Force Action) */}
        {tunggakanSesi ? (
          <section className="flex flex-col gap-3 rounded-2xl bg-danger/15 p-4 border border-danger/30 animate-fade-in">
            <div className="flex items-start gap-3">
              <Warning size={24} className="shrink-0 text-danger-ink" weight="fill" />
              <div>
                <p className="font-bold text-danger-ink text-sm">Ada Laporan Tertunggak</p>
                <p className="text-xs text-danger-ink/90 mt-0.5">
                  Selesaikan laporan perkuliahan tanggal{" "}
                  <span className="font-semibold">{tunggakanSesi.tanggal}</span> sebelum
                  membuka sesi perkuliahan baru.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowTunggakanModal(true)}
              className="mt-1 flex items-center justify-center gap-1.5 w-full rounded-xl bg-danger-ink py-2 text-xs font-bold text-white shadow-xs hover:bg-danger-ink/90 transition-colors cursor-pointer"
            >
              <span>Selesaikan Laporan Sesi Tertunggak</span>
              <ArrowRight size={14} />
            </button>
          </section>
        ) : (
          <section className="flex items-center gap-2.5 rounded-2xl bg-success/15 p-3 border border-success/30 text-xs font-semibold text-success-ink animate-fade-in">
            <CheckCircle size={20} weight="fill" />
            <span>Semua laporan sesi lampau selesai. Anda dapat membuka presensi sesi baru.</span>
          </section>
        )}

        {/* Status Sesi Presensi Aktif Real-Time */}
        {isSesiBuka && sesiAktif && (
          <section className="rounded-3xl border border-primary/30 bg-primary/10 p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Broadcast size={16} className="animate-pulse" />
                SESI PRESENSI AKTIF HARI INI
              </span>
              <span className="rounded-full bg-primary text-white px-2 py-0.5 text-[10px] font-bold uppercase">
                {sesiAktif.metode_kelas}
              </span>
            </div>
            <p className="text-xs text-ink leading-relaxed">
              Mahasiswa kelas {matkulKelas} saat ini dapat melakukan absensi melalui aplikasi SI-HADIR dengan validasi geofencing lokasi {gedungNama}.
            </p>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleTutupPresensi}
              className="w-full rounded-xl bg-ink py-2.5 text-xs font-bold text-white hover:bg-ink/90 transition-colors cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? "Memproses..." : "Tutup Sesi Presensi Sekarang"}
            </button>
          </section>
        )}

        {/* Form Laporan Cepat Buka Sesi */}
        <section
          id="laporan"
          className="scroll-mt-6 rounded-3xl border border-line bg-surface p-5 shadow-sm space-y-4"
        >
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Buka Sesi Perkuliahan</h2>
              <span className="rounded bg-background px-2 py-0.5 text-[10px] font-bold text-primary">
                {isSesiBuka ? "Sesi Sedang Buka" : "Pertemuan Hari Ini"}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <CalendarBlank size={15} />
              {jadwalHari}, {jadwalWaktu} · {matkulNama}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-ink">Metode Perkuliahan</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {metodeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={isSesiBuka}
                  onClick={() => setMetode(option)}
                  className={`rounded-xl py-2.5 text-xs font-bold capitalize transition-all cursor-pointer ${
                    metode === option
                      ? "bg-primary text-white shadow-xs"
                      : "bg-background text-muted hover:text-ink"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-ink">Status Kehadiran Dosen</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {statusOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  disabled={isSesiBuka}
                  onClick={() => setStatusDosen(option)}
                  className={`rounded-xl py-2.5 text-xs font-bold capitalize transition-all cursor-pointer ${
                    statusDosen === option
                      ? "bg-primary text-white shadow-xs"
                      : "bg-background text-muted hover:text-ink"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            disabled={Boolean(tunggakanSesi) || isSesiBuka || isSubmitting}
            onClick={handleBukaPresensi}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition-all cursor-pointer ${
              tunggakanSesi
                ? "bg-faint opacity-50 cursor-not-allowed"
                : isSesiBuka
                ? "bg-success-ink cursor-default"
                : "bg-primary hover:bg-primary-strong shadow-md active:scale-[0.99]"
            }`}
          >
            {isSubmitting && <CircleNotch size={18} className="animate-spin" />}
            {tunggakanSesi
              ? "Terkunci: Selesaikan Tunggakan Dulu"
              : isSesiBuka
              ? "Sesi Sedang Dibuka"
              : "Buka Presensi Mahasiswa"}
          </button>
        </section>

        {/* Delegasi Tugas PJ */}
        <section id="delegasi" className="space-y-3 scroll-mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Delegasi Tugas PJ</h2>
              <p className="text-xs text-muted">
                Pilih pengganti PJ jika berhalangan hadir pada pertemuan hari ini.
              </p>
            </div>
            {delegasi && (
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-ink">
                Didelegasikan
              </span>
            )}
          </div>

          {delegasi && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 flex items-center justify-between text-xs animate-fade-in">
              <div className="flex items-center gap-2.5">
                <UserCheck size={20} className="text-primary shrink-0" weight="fill" />
                <div>
                  <p className="font-bold text-ink">
                    PJ Pengganti: {delegasi.pjPengganti?.nama || "Mahasiswa Ditunjuk"}
                  </p>
                  <p className="text-muted">
                    Alasan: {delegasi.alasan}. Memiliki wewenang membuka presensi sesi ini.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleBatalkanDelegasi}
                className="text-[11px] font-bold text-danger-ink hover:underline cursor-pointer"
              >
                Batalkan
              </button>
            </div>
          )}

          <div className="space-y-2">
            {temanSekelas.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line p-4 text-center text-xs text-muted">
                Tidak ada data mahasiswa lain dalam kelas ini.
              </div>
            ) : (
              temanSekelas.map((teman) => {
                const isAssigned = delegasi?.pjPengganti?.id === teman.id;
                return (
                  <button
                    key={teman.id}
                    type="button"
                    onClick={() => setSelectedTeman(teman)}
                    className={`flex w-full items-center justify-between rounded-2xl p-4 text-left shadow-sm border transition-all cursor-pointer ${
                      isAssigned
                        ? "border-primary bg-primary/10"
                        : "border-line bg-surface hover:border-primary/40 hover:bg-background"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-ink text-sm">{teman.nama}</p>
                      <p className="text-xs text-faint">
                        {teman.nim} · Mahasiswa {matkulKelas}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                      <span>{isAssigned ? "Pengganti Aktif" : "Delegasikan"}</span>
                      <ArrowsLeftRight size={16} />
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </section>

        {/* Riwayat Sesi Kelas Nyata dari Supabase */}
        <section id="riwayat" className="space-y-3 scroll-mt-6">
          <h2 className="text-lg font-bold text-ink">Riwayat Pertemuan Kelas</h2>
          {riwayatSesi.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-6 text-center text-xs text-muted">
              Belum ada riwayat pertemuan perkuliahan tercatat.
            </div>
          ) : (
            riwayatSesi.map((item, idx) => {
              const ptNumber = riwayatSesi.length - idx;
              const isClosed = Boolean(item.timestamp_tutup);
              const isNowActive = item.id === sesiAktif?.id && !isClosed;
              const isTertunggak = !item.dilaporkan_oleh && isClosed;

              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl bg-surface p-4 shadow-sm border border-line"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background text-muted">
                      <ClockCounterClockwise size={18} />
                    </span>
                    <div>
                      <p className="font-bold text-ink text-sm">
                        Pertemuan {ptNumber} · {item.tanggal}
                      </p>
                      <p className="text-xs text-faint capitalize">
                        Metode: {item.metode_kelas} · Status Dosen: {item.status_dosen || "Hadir"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      isNowActive
                        ? "warning"
                        : isTertunggak
                        ? "danger"
                        : "success"
                    }
                  >
                    {isNowActive
                      ? "Berlangsung"
                      : isTertunggak
                      ? "Tertunggak"
                      : "Selesai"}
                  </Badge>
                </div>
              );
            })
          )}
        </section>
      </div>

      {/* Modal Selesaikan Tunggakan */}
      {showTunggakanModal && tunggakanSesi && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="rounded bg-danger/20 px-2 py-0.5 text-[10px] font-bold text-danger-ink">
                  Force Action
                </span>
                <h3 className="mt-1 text-base font-bold text-ink">
                  Laporan Susulan ({tunggakanSesi.tanggal})
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowTunggakanModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted hover:text-ink cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">Mata Kuliah</label>
                <p className="p-2.5 rounded-xl bg-background text-muted">
                  {matkulNama} ({matkulKelas})
                </p>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Metode Perkuliahan</label>
                <div className="grid grid-cols-2 gap-2">
                  {metodeOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTunggakanMetode(opt)}
                      className={`py-2 rounded-xl font-bold cursor-pointer capitalize transition-colors ${
                        tunggakanMetode === opt
                          ? "bg-primary text-white"
                          : "bg-background text-muted"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Status Kehadiran Dosen</label>
                <div className="grid grid-cols-2 gap-2">
                  {statusOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTunggakanStatusDosen(opt)}
                      className={`py-2 rounded-xl font-bold cursor-pointer capitalize transition-colors ${
                        tunggakanStatusDosen === opt
                          ? "bg-primary text-white"
                          : "bg-background text-muted"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Pokok Bahasan / Materi</label>
                <input
                  type="text"
                  value={tunggakanMateri}
                  onChange={(e) => setTunggakanMateri(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-line bg-background text-ink text-xs focus:outline-primary"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowTunggakanModal(false)}
                className="flex-1 rounded-full border border-line py-2.5 text-xs font-semibold text-muted hover:bg-background cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSelesaikanTunggakan}
                className="flex-1 rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-strong cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Laporan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Konfirmasi Delegasi */}
      {selectedTeman && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-bold text-ink">Delegasi Tugas PJ</h3>
              <button
                type="button"
                onClick={() => setSelectedTeman(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted hover:text-ink cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-3 text-xs text-muted leading-relaxed">
              Anda akan mendelegasikan wewenang membuka sesi presensi pertemuan hari ini kepada:
            </p>

            <div className="mt-3 rounded-2xl bg-primary/10 p-3 text-xs">
              <p className="font-bold text-ink">{selectedTeman.nama}</p>
              <p className="text-muted">
                {selectedTeman.nim} · Mahasiswa {matkulKelas}
              </p>
            </div>

            <div className="mt-4 space-y-1.5 text-xs">
              <label className="font-bold text-ink block">Alasan Delegasi</label>
              <select
                value={alasanDelegasi}
                onChange={(e) => setAlasanDelegasi(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-line bg-background text-ink text-xs focus:outline-primary cursor-pointer"
              >
                <option value="Izin Sakit">Izin Sakit</option>
                <option value="Dispensasi Lomba Akademik">Dispensasi Lomba Akademik</option>
                <option value="Kegiatan Organisasi Kampus">Kegiatan Organisasi Kampus</option>
                <option value="Kendala Teknis Jaringan">Kendala Teknis Jaringan</option>
              </select>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedTeman(null)}
                className="flex-1 rounded-full border border-line py-2.5 text-xs font-semibold text-muted hover:bg-background cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleKonfirmasiDelegasi}
                className="flex-1 rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-strong cursor-pointer disabled:opacity-60"
              >
                {isSubmitting ? "Menyimpan..." : "Konfirmasi Delegasi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
