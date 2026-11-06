"use client";

import { useState } from "react";
import {
  SquaresFour,
  UsersThree,
  WarningCircle,
  DownloadSimple,
  ChatCircleDots,
  X,
  CheckCircle,
  FilePdf,
  CaretRight,
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { RoleHeader } from "@/components/RoleHeader";
import { StatCard } from "@/components/StatCard";
import { kaprodiNav } from "@/lib/nav";
import { kaprodi } from "@/lib/roles";

const statIcons = [SquaresFour, UsersThree, WarningCircle];

const statusVariant: Record<
  string,
  "success" | "neutral" | "warning"
> = {
  Berlangsung: "success",
  Selesai: "neutral",
  "Belum Mulai": "warning",
};

interface EwsStudent {
  nama: string;
  nim: string;
  kelas: string;
  persen: number;
}

export default function KaprodiPage() {
  const [filterStatus, setFilterStatus] = useState<string>("Semua");
  const [selectedEws, setSelectedEws] = useState<EwsStudent | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [showExportSuccess, setShowExportSuccess] = useState(false);
  const [ewsSentTo, setEwsSentTo] = useState<string | null>(null);

  const filteredAktivitas =
    filterStatus === "Semua"
      ? kaprodi.aktivitas
      : kaprodi.aktivitas.filter((a) => a.status === filterStatus);

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      setShowExportSuccess(true);
      setTimeout(() => setShowExportSuccess(false), 4000);
    }, 1000);
  };

  const handleKirimPeringatan = () => {
    if (selectedEws) {
      setEwsSentTo(selectedEws.nama);
      setSelectedEws(null);
      setTimeout(() => setEwsSentTo(null), 4000);
    }
  };

  return (
    <AppShell items={kaprodiNav}>
      <div className="space-y-6">
        <RoleHeader nama={kaprodi.nama} role={kaprodi.role} />

        {/* Notifikasi Feedback Ekspor */}
        {showExportSuccess && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-success p-3 text-xs font-bold text-success-ink animate-fade-in border border-success-ink/20">
            <CheckCircle size={20} weight="fill" />
            <span>Rekapitulasi_Kehadiran_Teknik_Informatika.pdf berhasil diunduh!</span>
          </div>
        )}

        {/* Notifikasi Feedback EWS */}
        {ewsSentTo && (
          <div className="flex items-center gap-2.5 rounded-2xl bg-primary/10 p-3 text-xs font-bold text-primary animate-fade-in border border-primary/20">
            <ChatCircleDots size={20} weight="fill" />
            <span>Peringatan resmi & instruksi konseling terkirim ke {ewsSentTo}.</span>
          </div>
        )}

        {/* Statistik */}
        <section id="dasbor" className="grid grid-cols-3 gap-2.5 scroll-mt-6">
          {kaprodi.stats.map((stat, i) => {
            const Icon = statIcons[i];
            return (
              <StatCard
                key={stat.label}
                label={stat.label}
                value={stat.value}
                icon={<Icon size={18} className="text-primary" />}
              />
            );
          })}
        </section>

        {/* Action: Unduh Rekap */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted">Laporan Real-time Semester Ganjil</p>
          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer disabled:opacity-50"
          >
            {isExporting ? (
              <span>Menyiapkan PDF...</span>
            ) : (
              <>
                <FilePdf size={16} />
                <span>Unduh Rekapitulasi</span>
              </>
            )}
          </button>
        </div>

        {/* Aktivitas Kelas */}
        <section id="kelas" className="space-y-3 scroll-mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-ink">Aktivitas Kelas Hari Ini</h2>
            <div className="flex gap-1 overflow-x-auto pb-1 text-[11px]">
              {["Semua", "Berlangsung", "Selesai"].map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`rounded-full px-2.5 py-1 font-semibold transition-colors cursor-pointer ${filterStatus === st
                    ? "bg-primary text-white"
                    : "bg-background text-muted hover:text-ink"
                    }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredAktivitas.map((item) => (
              <div
                key={item.kelas}
                className="flex items-center justify-between rounded-2xl bg-surface p-4 shadow-sm border border-line"
              >
                <div>
                  <span className="rounded bg-background px-1.5 py-0.5 text-[10px] font-semibold text-faint">
                    {item.kelas}
                  </span>
                  <h3 className="mt-1 text-base font-bold text-ink">{item.nama}</h3>
                  <p className="text-xs text-muted">Dosen: {item.dosen}</p>
                </div>
                <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
              </div>
            ))}
          </div>
        </section>

        {/* Tindak Lanjut */}
        <section id="ews" className="space-y-3 scroll-mt-6">
          <div>
            <h2 className="text-lg font-bold text-ink">Tindak Lanjut</h2>
            <p className="text-xs text-muted">
              Mahasiswa dengan tingkat kehadiran Tindak Lanjut di bawah 75%. Klik untuk tindakan intervensi prodi.
            </p>
          </div>

          <div className="space-y-2.5">
            {kaprodi.ews.map((item) => (
              <button
                key={item.nim}
                type="button"
                onClick={() => setSelectedEws(item)}
                className="w-full text-left flex items-center justify-between rounded-2xl bg-surface p-4 shadow-sm border border-line hover:border-danger/40 transition-all cursor-pointer active:scale-[0.99]"
              >
                <div>
                  <p className="font-bold text-ink text-sm">{item.nama}</p>
                  <p className="text-xs text-faint">
                    {item.nim} · {item.kelas}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="danger">{item.persen}%</Badge>
                  <span className="flex items-center gap-0.5 text-xs font-semibold text-primary">
                    <span>Intervensi</span>
                    <CaretRight size={13} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Modal Intervensi EWS */}
      {selectedEws && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="rounded bg-danger/20 px-2 py-0.5 text-[10px] font-bold text-danger-ink">
                  EWS Alert ({selectedEws.persen}%)
                </span>
                <h3 className="mt-1 text-base font-bold text-ink">Intervensi Akademik</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEws(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted hover:text-ink cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 rounded-2xl bg-background p-3 text-xs space-y-1">
              <p className="font-bold text-ink text-sm">{selectedEws.nama}</p>
              <p className="text-muted">{selectedEws.nim} · Kelas {selectedEws.kelas}</p>
              <p className="text-danger-ink font-semibold mt-1">
                Persentase Kehadiran: {selectedEws.persen}% (Batas Minimal: 75%)
              </p>
            </div>

            <p className="mt-3 text-xs text-muted leading-relaxed">
              Kirimkan teguran resmi prodi kepada mahasiswa bersangkutan dan tembusan ke Dosen Wali untuk pendampingan konseling akademik.
            </p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedEws(null)}
                className="flex-1 rounded-full border border-line py-2.5 text-xs font-semibold text-muted hover:bg-background cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleKirimPeringatan}
                className="flex-1 rounded-full bg-danger-ink py-2.5 text-xs font-bold text-white hover:bg-danger-ink/90 cursor-pointer"
              >
                Kirim Teguran
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
