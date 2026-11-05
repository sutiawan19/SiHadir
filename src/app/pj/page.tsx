"use client";

import { useState } from "react";
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
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { pjNav } from "@/lib/nav";
import { pj } from "@/lib/roles";
import { useDemo } from "@/lib/demo-context";

const metodeOptions = ["Luring", "Daring"];
const statusOptions = ["Hadir", "Terlambat", "Izin", "Sakit"];

interface RiwayatItem {
  pertemuan: string;
  status: "Selesai" | "Tertunggak" | "Berlangsung";
  metode: string;
}

export default function PjPage() {
  const { currentUser } = useDemo();
  const [metode, setMetode] = useState("Luring");
  const [statusDosen, setStatusDosen] = useState("Hadir");

  // State: Force Action Tunggakan
  const [tunggakanAda, setTunggakanAda] = useState(true);
  const [showTunggakanModal, setShowTunggakanModal] = useState(false);
  const [tunggakanMetode, setTunggakanMetode] = useState("Luring");
  const [tunggakanStatusDosen, setTunggakanStatusDosen] = useState("Hadir");
  const [tunggakanMateri, setTunggakanMateri] = useState("Arsitektur Sistem Enterprise & ERP");

  // State: Sesi Buka Presensi
  const [isSesiBuka, setIsSesiBuka] = useState(false);
  const [isSubmittingSesi, setIsSubmittingSesi] = useState(false);

  // State: Delegasi Modal
  const [selectedTeman, setSelectedTeman] = useState<{ nama: string; nim: string } | null>(null);
  const [alasanDelegasi, setAlasanDelegasi] = useState("Izin Sakit");
  const [delegatedTo, setDelegatedTo] = useState<string | null>(null);

  // State: Riwayat
  const [riwayat, setRiwayat] = useState<RiwayatItem[]>([
    { pertemuan: "PT 04", status: "Selesai", metode: "Luring" },
    { pertemuan: "PT 03", status: "Tertunggak", metode: "-" },
  ]);

  const handleSelesaikanTunggakan = () => {
    setTunggakanAda(false);
    setShowTunggakanModal(false);
    setRiwayat((prev) =>
      prev.map((r) =>
        r.pertemuan === "PT 03"
          ? { ...r, status: "Selesai", metode: tunggakanMetode }
          : r,
      ),
    );
  };

  const handleBukaPresensi = () => {
    setIsSubmittingSesi(true);
    setTimeout(() => {
      setIsSubmittingSesi(false);
      setIsSesiBuka(true);
      setRiwayat((prev) => [
        { pertemuan: "PT 05", status: "Berlangsung", metode },
        ...prev,
      ]);
    }, 600);
  };

  const handleTutupPresensi = () => {
    setIsSesiBuka(false);
    setRiwayat((prev) =>
      prev.map((r) => (r.pertemuan === "PT 05" ? { ...r, status: "Selesai" } : r)),
    );
  };

  const handleKonfirmasiDelegasi = () => {
    if (selectedTeman) {
      setDelegatedTo(selectedTeman.nama);
      setSelectedTeman(null);
    }
  };

  return (
    <AppShell items={pjNav}>
      <div className="space-y-6">
        <div>
          <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-ink uppercase">
            Dasbor Penanggung Jawab
          </span>
          <h1 className="mt-1 text-2xl font-bold text-ink">Tugas PJ</h1>
          <p className="mt-0.5 text-xs text-muted">
            {pj.kelasBerikutnya.nama} · {pj.kelasBerikutnya.hari},{" "}
            {pj.kelasBerikutnya.waktu}
          </p>
        </div>

        {/* Banner Tunggakan (Force Action) */}
        {tunggakanAda ? (
          <section className="flex flex-col gap-3 rounded-2xl bg-danger p-4 border border-danger-ink/20 animate-fade-in">
            <div className="flex items-start gap-3">
              <Warning size={24} className="shrink-0 text-danger-ink" weight="fill" />
              <div>
                <p className="font-bold text-danger-ink text-sm">Ada Laporan Tertunggak</p>
                <p className="text-xs text-danger-ink/90 mt-0.5">
                  Selesaikan laporan {pj.tunggakan.pertemuan} ({pj.tunggakan.tanggal}) sebelum membuka sesi perkuliahan baru.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowTunggakanModal(true)}
              className="mt-1 flex items-center justify-center gap-1.5 w-full rounded-xl bg-danger-ink py-2 text-xs font-bold text-white shadow-xs hover:bg-danger-ink/90 transition-colors cursor-pointer"
            >
              <span>Selesaikan Laporan PT 03 Sekarang</span>
              <ArrowRight size={14} />
            </button>
          </section>
        ) : (
          <section className="flex items-center gap-2.5 rounded-2xl bg-success p-3 border border-success-ink/20 text-xs font-semibold text-success-ink animate-fade-in">
            <CheckCircle size={20} weight="fill" />
            <span>Semua laporan selesai. Anda dapat membuka presensi sesi baru.</span>
          </section>
        )}

        {/* Status Sesi Presensi Aktif */}
        {isSesiBuka && (
          <section className="rounded-3xl border border-primary/30 bg-primary/10 p-4 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-primary">
                <Broadcast size={16} className="animate-pulse" />
                SESI PRESENSI AKTIF
              </span>
              <span className="rounded-full bg-primary text-white px-2 py-0.5 text-[10px] font-bold">
                PT 05 · {metode}
              </span>
            </div>
            <p className="text-xs text-ink leading-relaxed">
              Mahasiswa kelas TI-3A saat ini dapat melakukan absensi melalui aplikasi SI-HADIR dengan verifikasi geofencing.
            </p>
            <button
              type="button"
              onClick={handleTutupPresensi}
              className="w-full rounded-xl bg-ink py-2 text-xs font-bold text-white hover:bg-ink/90 transition-colors cursor-pointer"
            >
              Tutup Sesi Presensi PT 05
            </button>
          </section>
        )}

        {/* Form Laporan Cepat */}
        <section
          id="laporan"
          className="scroll-mt-6 rounded-3xl border border-line bg-surface p-5 shadow-sm space-y-4"
        >
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-ink">Laporan Cepat Pertemuan</h2>
              <span className="rounded bg-background px-2 py-0.5 text-[10px] font-bold text-primary">
                {isSesiBuka ? "PT 05 (Aktif)" : "PT 05"}
              </span>
            </div>
            <p className="mt-1 flex items-center gap-1.5 text-xs text-muted">
              <CalendarBlank size={15} />
              {pj.kelasBerikutnya.hari}, {pj.kelasBerikutnya.waktu} · {pj.kelasBerikutnya.nama}
            </p>
          </div>

          <div>
            <p className="text-xs font-bold text-ink">Metode Perkuliahan</p>
            <div className="mt-2 grid grid-cols-2 gap-2">
              {metodeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setMetode(option)}
                  className={`rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
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
                  onClick={() => setStatusDosen(option)}
                  className={`rounded-xl py-2.5 text-xs font-bold transition-all cursor-pointer ${
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
            disabled={tunggakanAda || isSesiBuka || isSubmittingSesi}
            onClick={handleBukaPresensi}
            className={`mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition-all cursor-pointer ${
              tunggakanAda
                ? "bg-faint opacity-50 cursor-not-allowed"
                : isSesiBuka
                ? "bg-success-ink cursor-default"
                : "bg-primary hover:bg-primary-strong shadow-md active:scale-[0.99]"
            }`}
          >
            {isSubmittingSesi && <CircleNotch size={18} className="animate-spin" />}
            {tunggakanAda
              ? "Terkunci: Selesaikan Tunggakan Dulu"
              : isSesiBuka
              ? "Sesi Sedang Dibuka"
              : "Buka Presensi Mahasiswa"}
          </button>
        </section>

        {/* Delegasi Tugas */}
        <section id="delegasi" className="space-y-3 scroll-mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Delegasi Tugas PJ</h2>
              <p className="text-xs text-muted">
                Pilih pengganti PJ jika berhalangan hadir pada pertemuan ini.
              </p>
            </div>
            {delegatedTo && (
              <span className="rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold text-ink">
                Didelegasikan
              </span>
            )}
          </div>

          {delegatedTo && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5 flex items-center justify-between text-xs animate-fade-in">
              <div className="flex items-center gap-2.5">
                <UserCheck size={20} className="text-primary shrink-0" weight="fill" />
                <div>
                  <p className="font-bold text-ink">PJ Pengganti: {delegatedTo}</p>
                  <p className="text-muted">Memiliki wewenang membuka presensi sesi ini.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDelegatedTo(null)}
                className="text-[11px] font-bold text-danger-ink hover:underline cursor-pointer"
              >
                Batalkan
              </button>
            </div>
          )}

          <div className="space-y-2">
            {pj.temanSekelas.map((teman) => {
              const isAssigned = delegatedTo === teman.nama;
              return (
                <button
                  key={teman.nim}
                  type="button"
                  onClick={() => setSelectedTeman(teman)}
                  className={`flex w-full items-center justify-between rounded-2xl p-4 text-left shadow-sm border transition-all cursor-pointer ${
                    isAssigned
                      ? "border-primary bg-primary/5"
                      : "border-line bg-surface hover:border-primary/40 hover:bg-background"
                  }`}
                >
                  <div>
                    <p className="font-semibold text-ink text-sm">{teman.nama}</p>
                    <p className="text-xs text-faint">{teman.nim} · Mahasiswa TI-3A</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-primary">
                    <span>{isAssigned ? "Pengganti Aktif" : "Delegasikan"}</span>
                    <ArrowsLeftRight size={16} />
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Riwayat Laporan */}
        <section id="riwayat" className="space-y-3 scroll-mt-6">
          <h2 className="text-lg font-bold text-ink">Riwayat Laporan</h2>
          {riwayat.map((item) => (
            <div
              key={item.pertemuan}
              className="flex items-center justify-between rounded-2xl bg-surface p-4 shadow-sm border border-line"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-background text-muted">
                  <ClockCounterClockwise size={18} />
                </span>
                <div>
                  <p className="font-bold text-ink text-sm">{item.pertemuan}</p>
                  <p className="text-xs text-faint">
                    Metode: {item.metode} · Sistem Enterprise
                  </p>
                </div>
              </div>
              <Badge
                variant={
                  item.status === "Selesai"
                    ? "success"
                    : item.status === "Berlangsung"
                    ? "warning"
                    : "danger"
                }
              >
                {item.status}
              </Badge>
            </div>
          ))}
        </section>
      </div>

      {/* Modal Selesaikan Tunggakan */}
      {showTunggakanModal && (
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
                <h3 className="mt-1 text-base font-bold text-ink">Laporan Susulan PT 03</h3>
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
                <p className="p-2.5 rounded-xl bg-background text-muted">Sistem Enterprise (TI-3A)</p>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Metode Perkuliahan</label>
                <div className="grid grid-cols-2 gap-2">
                  {metodeOptions.map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setTunggakanMetode(opt)}
                      className={`py-2 rounded-xl font-bold cursor-pointer transition-colors ${
                        tunggakanMetode === opt ? "bg-primary text-white" : "bg-background text-muted"
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
                      className={`py-2 rounded-xl font-bold cursor-pointer transition-colors ${
                        tunggakanStatusDosen === opt ? "bg-primary text-white" : "bg-background text-muted"
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
                onClick={handleSelesaikanTunggakan}
                className="flex-1 rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-strong cursor-pointer"
              >
                Kirim Laporan
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
              Anda akan mendelegasikan wewenang membuka sesi presensi pertemuan ini kepada:
            </p>

            <div className="mt-3 rounded-2xl bg-primary/10 p-3 text-xs">
              <p className="font-bold text-ink">{selectedTeman.nama}</p>
              <p className="text-muted">{selectedTeman.nim} · Mahasiswa TI-3A</p>
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
                onClick={handleKonfirmasiDelegasi}
                className="flex-1 rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-strong cursor-pointer"
              >
                Konfirmasi Delegasi
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
