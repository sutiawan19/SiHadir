"use client";

import { useState } from "react";
import Link from "next/link";
import {
  GraduationCap,
  Key,
  PencilSimple,
  UsersThree,
  WarningCircle,
  ArrowSquareOut,
  X,
  CheckCircle,
  ChatCircleDots,
  CaretRight,
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { RoleHeader } from "@/components/RoleHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { dosenNav } from "@/lib/nav";
import { dosen } from "@/lib/roles";

const statIcons = [GraduationCap, UsersThree, WarningCircle];

type KelasDosen = (typeof dosen.kelas)[number];
type MahasiswaDosen = KelasDosen["mahasiswa"][number];

interface EwsItem {
  nama: string;
  nim: string;
  kelas: string;
  persen: number;
}

function KelasDetail({ kelas }: { kelas: KelasDosen }) {
  const [filter, setFilter] = useState<"semua" | number>("semua");
  const [mahasiswa, setMahasiswa] = useState<MahasiswaDosen[]>(() =>
    kelas.mahasiswa.map((m) => ({ ...m, kehadiran: [...m.kehadiran] })),
  );
  const [bypassed, setBypassed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const total = kelas.pertemuan.length;
  const selectedPertemuan = filter === "semua" ? null : filter;

  function persen(m: MahasiswaDosen) {
    const hadir = m.kehadiran.filter(Boolean).length;
    return Math.round((hadir / total) * 100);
  }

  function nilai(m: MahasiswaDosen) {
    return ((persen(m) * kelas.bobot) / 100).toFixed(1);
  }

  function koreksi(nim: string, nama: string) {
    if (selectedPertemuan === null) return;
    setMahasiswa((prev) =>
      prev.map((m) => {
        if (m.nim === nim) {
          const nextState = !m.kehadiran[selectedPertemuan];
          setToastMessage(
            `Presensi ${nama} untuk ${kelas.pertemuan[selectedPertemuan]} diubah menjadi ${
              nextState ? "Hadir" : "Tidak Hadir"
            }.`,
          );
          setTimeout(() => setToastMessage(null), 3000);
          return {
            ...m,
            kehadiran: m.kehadiran.map((k, i) =>
              i === selectedPertemuan ? nextState : k,
            ),
          };
        }
        return m;
      }),
    );
  }

  function toggleBypass() {
    const next = !bypassed;
    setBypassed(next);
    setToastMessage(
      next
        ? "Bypass Darurat Aktif: Mahasiswa diizinkan absen tanpa batasan radius."
        : "Bypass Darurat Dimatikan: Validasi radius geofencing kembali normal.",
    );
    setTimeout(() => setToastMessage(null), 3500);
  }

  return (
    <div className="mt-4 space-y-3 border-t border-line/60 pt-3">
      {/* Toast Notifikasi */}
      {toastMessage && (
        <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-2.5 text-xs font-bold text-primary animate-fade-in border border-primary/20">
          <CheckCircle size={16} weight="fill" className="shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Filter Pertemuan */}
      <div className="flex gap-1.5 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => setFilter("semua")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
            filter === "semua" ? "bg-primary text-white" : "bg-line text-muted"
          }`}
        >
          Semua Pertemuan
        </button>
        {kelas.pertemuan.map((pertemuan, index) => (
          <button
            key={pertemuan}
            type="button"
            onClick={() => setFilter(index)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              filter === index ? "bg-primary text-white" : "bg-line text-muted"
            }`}
          >
            {pertemuan}
          </button>
        ))}
      </div>

      {/* Daftar Mahasiswa */}
      <div className="space-y-2">
        {mahasiswa.map((m) => (
          <div key={m.nim} className="rounded-xl bg-background p-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="font-semibold text-ink text-xs">{m.nama}</p>
                <p className="text-[11px] text-faint">{m.nim}</p>
              </div>

              {selectedPertemuan === null ? (
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">{persen(m)}%</p>
                  <p className="text-[10px] text-faint">Poin Kehadiran: {nilai(m)}</p>
                </div>
              ) : (
                <StatusBadge
                  status={m.kehadiran[selectedPertemuan] ? "Hadir" : "Tidak Hadir"}
                />
              )}
            </div>

            {selectedPertemuan !== null && (
              <button
                type="button"
                onClick={() => koreksi(m.nim, m.nama)}
                className="mt-2 flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer"
              >
                <PencilSimple size={13} />
                Koreksi Presensi
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Bypass Button */}
      {selectedPertemuan !== null && (
        <button
          type="button"
          onClick={toggleBypass}
          className={`flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-xs font-bold transition-all cursor-pointer ${
            bypassed
              ? "bg-success text-success-ink shadow-xs"
              : "bg-primary text-white hover:bg-primary-strong shadow-md"
          }`}
        >
          <Key size={16} />
          {bypassed ? "Bypass Darurat Aktif (Klik untuk Matikan)" : "Buka Kelas (Bypass Darurat)"}
        </button>
      )}
    </div>
  );
}

export default function DosenPage() {
  const [expanded, setExpanded] = useState<string | null>("TI-3A");
  const [selectedEws, setSelectedEws] = useState<EwsItem | null>(null);
  const [ewsContacted, setEwsContacted] = useState<string | null>(null);

  const handleContactEws = () => {
    if (selectedEws) {
      setEwsContacted(selectedEws.nama);
      setSelectedEws(null);
      setTimeout(() => setEwsContacted(null), 4000);
    }
  };

  return (
    <AppShell items={dosenNav}>
      <div className="space-y-6">
        <RoleHeader nama={dosen.nama} role={dosen.role} />

        {/* Notifikasi Kontak EWS */}
        {ewsContacted && (
          <div className="flex items-center gap-2 rounded-2xl bg-primary/10 p-3 text-xs font-bold text-primary animate-fade-in border border-primary/20">
            <ChatCircleDots size={20} weight="fill" />
            <span>Pesan peringatan berhasil dikirim ke WhatsApp {ewsContacted}.</span>
          </div>
        )}

        {/* Statistik */}
        <section id="dasbor" className="grid grid-cols-3 gap-2.5 scroll-mt-6">
          {dosen.stats.map((stat, i) => {
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

        {/* Daftar Kelas */}
        <section id="kelas" className="space-y-3 scroll-mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Kelas yang Diampu</h2>
              <p className="text-xs text-muted">Semester Ganjil 2026/2027</p>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {dosen.kelas.length} Kelas
            </span>
          </div>

          {dosen.kelas.map((kelas) => {
            const isOpen = expanded === kelas.kelas;
            return (
              <div key={kelas.kelas} className="rounded-2xl bg-surface p-4 shadow-sm border border-line">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="rounded bg-background px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      {kelas.kelas}
                    </span>
                    <h3 className="mt-1 text-base font-bold text-ink">{kelas.nama}</h3>
                    <p className="text-xs text-muted">
                      {kelas.mahasiswa.length} mahasiswa terdaftar · Bobot Absen {kelas.bobot}%
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Link
                      href={`/dosen/kelas/${encodeURIComponent(kelas.kelas)}`}
                      className="flex items-center gap-1 rounded-full bg-background px-2.5 py-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
                      title="Buka Halaman Penuh"
                    >
                      <ArrowSquareOut size={14} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => setExpanded(isOpen ? null : kelas.kelas)}
                      className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20 transition-colors cursor-pointer"
                    >
                      {isOpen ? "Tutup" : "Detail"}
                    </button>
                  </div>
                </div>

                {isOpen && <KelasDetail kelas={kelas} />}
              </div>
            );
          })}
        </section>

        {/* EWS */}
        <section id="ews" className="space-y-3 scroll-mt-6">
          <div>
            <h2 className="text-lg font-bold text-ink">Peringatan Dini (EWS)</h2>
            <p className="text-xs text-muted">Mahasiswa dengan tingkat kehadiran di bawah 75%.</p>
          </div>

          <div className="space-y-2.5">
            {dosen.ews.map((item) => (
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
                    <span>Tindakan</span>
                    <CaretRight size={13} />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </section>
      </div>

      {/* Modal Tindakan EWS Dosen */}
      {selectedEws && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="rounded bg-danger/20 px-2 py-0.5 text-[10px] font-bold text-danger-ink">
                  Kehadiran Kritis ({selectedEws.persen}%)
                </span>
                <h3 className="mt-1 text-base font-bold text-ink">Beri Peringatan Mahasiswa</h3>
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
              <p className="text-muted">{selectedEws.nim} · {selectedEws.kelas}</p>
              <p className="text-danger-ink font-semibold mt-1">
                Total Kehadiran: {selectedEws.persen}% (Syarat Ujian Minimal: 75%)
              </p>
            </div>

            <p className="mt-3 text-xs text-muted leading-relaxed">
              Kirimkan teguran melalui pesan WhatsApp resmi dosen pengampu untuk meminta konfirmasi kendala kehadiran mahasiswa.
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
                onClick={handleContactEws}
                className="flex-1 rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-strong cursor-pointer"
              >
                Kirim Chat WA
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
