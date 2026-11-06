"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
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
  CircleNotch,
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/Badge";
import { RoleHeader } from "@/components/RoleHeader";
import { StatCard } from "@/components/StatCard";
import { StatusBadge } from "@/components/StatusBadge";
import { dosenNav } from "@/lib/nav";
import { useDemo } from "@/lib/demo-context";
import {
  getDosenDashboardDataAction,
  koreksiPresensiDosenAction,
  type KelasDosenDetail,
  type EwsStudentItem,
  type MahasiswaKelasDosen,
} from "@/app/actions/dosen";

const statIcons = [GraduationCap, UsersThree, WarningCircle];

function KelasDetail({
  kelas,
  onPresensiUpdated,
}: {
  kelas: KelasDosenDetail;
  onPresensiUpdated: () => void;
}) {
  const [filterSesiId, setFilterSesiId] = useState<string>("semua");
  const [bypassed, setBypassed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const pertemuans = kelas.pertemuanList;

  async function handleKoreksi(mhs: MahasiswaKelasDosen) {
    if (filterSesiId === "semua") return;
    const currentHadir = Boolean(mhs.kehadiranPerSesi[filterSesiId]);
    const nextStatus = currentHadir ? "alpha" : "hadir";

    setIsUpdating(true);
    try {
      const res = await koreksiPresensiDosenAction({
        sesiId: filterSesiId,
        mahasiswaId: mhs.id,
        status: nextStatus,
      });

      if (res.success) {
        setToastMessage(
          `Presensi ${mhs.nama} diubah menjadi ${nextStatus === "hadir" ? "HADIR" : "ALPHA"}.`
        );
        setTimeout(() => setToastMessage(null), 3000);
        onPresensiUpdated();
      }
    } finally {
      setIsUpdating(false);
    }
  }

  function toggleBypass() {
    const next = !bypassed;
    setBypassed(next);
    setToastMessage(
      next
        ? "Bypass Darurat Aktif: Mahasiswa diizinkan absen tanpa batasan radius untuk sesi ini."
        : "Bypass Darurat Dimatikan: Validasi radius geofencing kembali normal."
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
          onClick={() => setFilterSesiId("semua")}
          className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
            filterSesiId === "semua"
              ? "bg-primary text-white"
              : "bg-line text-muted hover:text-ink"
          }`}
        >
          Semua Pertemuan
        </button>
        {pertemuans.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setFilterSesiId(p.id)}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              filterSesiId === p.id
                ? "bg-primary text-white"
                : "bg-line text-muted hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Daftar Mahasiswa */}
      <div className="space-y-2">
        {kelas.mahasiswaList.map((m) => {
          const isHadirInFiltered =
            filterSesiId !== "semua"
              ? Boolean(m.kehadiranPerSesi[filterSesiId])
              : false;

          return (
            <div key={m.id} className="rounded-xl bg-background p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-semibold text-ink text-xs">{m.nama}</p>
                  <p className="text-[11px] text-faint">{m.nim}</p>
                </div>

                {filterSesiId === "semua" ? (
                  <div className="text-right">
                    <p className="text-sm font-bold text-ink">
                      {m.persenKehadiran}%
                    </p>
                    <p className="text-[10px] text-faint">
                      Poin Nilai: {m.poinKehadiran}
                    </p>
                  </div>
                ) : (
                  <StatusBadge status={isHadirInFiltered ? "Hadir" : "Alpha"} />
                )}
              </div>

              {filterSesiId !== "semua" && (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={() => handleKoreksi(m)}
                  className="mt-2 flex items-center gap-1 text-[11px] font-bold text-primary hover:underline cursor-pointer disabled:opacity-50"
                >
                  <PencilSimple size={13} />
                  <span>Koreksi Presensi ({isHadirInFiltered ? "Jadikan Alpha" : "Jadikan Hadir"})</span>
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Bypass Button */}
      {filterSesiId !== "semua" && (
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
          <span>
            {bypassed
              ? "Bypass Darurat Aktif (Klik untuk Matikan)"
              : "Buka Kelas (Bypass Darurat)"}
          </span>
        </button>
      )}
    </div>
  );
}

export default function DosenPage() {
  const { currentUser } = useDemo();
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<{
    profile: any;
    stats: Array<{ label: string; value: string }>;
    kelasDetails: KelasDosenDetail[];
    ewsStudents: EwsStudentItem[];
  } | null>(null);

  const [expanded, setExpanded] = useState<string | null>("TI-3A");
  const [selectedEws, setSelectedEws] = useState<EwsStudentItem | null>(null);
  const [ewsContacted, setEwsContacted] = useState<string | null>(null);

  const fetchData = useCallback(() => {
    startTransition(async () => {
      try {
        const res = await getDosenDashboardDataAction(currentUser.id);
        setData(res);
      } catch (err) {
        console.error("Gagal memuat data dosen:", err);
      }
    });
  }, [currentUser.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleContactEws = () => {
    if (selectedEws) {
      setEwsContacted(selectedEws.nama);
      setSelectedEws(null);
      setTimeout(() => setEwsContacted(null), 4000);
    }
  };

  const profileNama = data?.profile?.nama || currentUser.nama;
  const statsList = data?.stats || [
    { label: "Kelas Diampu", value: "1" },
    { label: "Total Mahasiswa", value: "2" },
    { label: "Peringatan EWS (<75%)", value: "1" },
  ];
  const kelasList = data?.kelasDetails || [];
  const ewsList = data?.ewsStudents || [];

  return (
    <AppShell items={dosenNav}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <RoleHeader nama={profileNama} role="Dosen Pengampu" />
          {isPending && (
            <CircleNotch size={18} className="animate-spin text-primary" />
          )}
        </div>

        {/* Notifikasi Kontak EWS */}
        {ewsContacted && (
          <div className="flex items-center gap-2 rounded-2xl bg-primary/10 p-3 text-xs font-bold text-primary animate-fade-in border border-primary/20">
            <ChatCircleDots size={20} weight="fill" />
            <span>Pesan peringatan berhasil dikirim ke WhatsApp {ewsContacted}.</span>
          </div>
        )}

        {/* Statistik Nyata */}
        <section id="dasbor" className="grid grid-cols-3 gap-2.5 scroll-mt-6">
          {statsList.map((stat, i) => {
            const Icon = statIcons[i] || GraduationCap;
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
              {kelasList.length} Kelas
            </span>
          </div>

          {kelasList.map((kelas) => {
            const isOpen = expanded === kelas.kelas;
            return (
              <div
                key={kelas.kelas}
                className="rounded-2xl bg-surface p-4 shadow-sm border border-line"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="rounded bg-background px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      {kelas.kelas}
                    </span>
                    <h3 className="mt-1 text-base font-bold text-ink">{kelas.nama}</h3>
                    <p className="text-xs text-muted">
                      {kelas.mahasiswaList.length} mahasiswa terdaftar · Bobot Absen {kelas.bobot}% · Lokasi {kelas.gedung}
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

                {isOpen && (
                  <KelasDetail kelas={kelas} onPresensiUpdated={fetchData} />
                )}
              </div>
            );
          })}
        </section>

        {/* Early Warning System (EWS <75%) */}
        <section id="ews" className="space-y-3 scroll-mt-6">
          <div>
            <h2 className="text-lg font-bold text-ink">Tindak Lanjut (EWS)</h2>
            <p className="text-xs text-muted">Mahasiswa dengan tingkat kehadiran di bawah 75%.</p>
          </div>

          <div className="space-y-2.5">
            {ewsList.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-line p-4 text-center text-xs text-muted">
                Semua mahasiswa memenuhi batas kehadiran &ge;75%.
              </div>
            ) : (
              ewsList.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedEws(item)}
                  className="w-full text-left flex items-center justify-between rounded-2xl bg-surface p-4 shadow-sm border border-line hover:border-danger/40 transition-all cursor-pointer active:scale-[0.99]"
                >
                  <div>
                    <p className="font-bold text-ink text-sm">{item.nama}</p>
                    <p className="text-xs text-faint">
                      {item.nim} · {item.kelas} ({item.matkul})
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
              ))
            )}
          </div>
        </section>

        {/* Modal Tindak Lanjut EWS */}
        {selectedEws && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div
              className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-line pb-3">
                <h3 className="text-base font-bold text-ink">Peringatan Kehadiran</h3>
                <button
                  type="button"
                  onClick={() => setSelectedEws(null)}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted hover:text-ink cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                <div className="rounded-2xl bg-danger/10 p-3.5 border border-danger/20">
                  <p className="font-bold text-danger-ink">{selectedEws.nama}</p>
                  <p className="text-danger-ink/90 mt-0.5">
                    {selectedEws.nim} · Kelas {selectedEws.kelas}
                  </p>
                  <p className="mt-2 text-base font-extrabold text-danger-ink">
                    Persentase: {selectedEws.persen}% (Di bawah 75%)
                  </p>
                </div>
                <p className="text-muted leading-relaxed">
                  Tingkat kehadiran mahasiswa ini berada di zona kritis. Anda dapat mengirimkan surat teguran / pesan pengingat ke kontak mahasiswa.
                </p>
              </div>

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
                  className="flex-1 rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-strong cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <ChatCircleDots size={16} weight="fill" />
                  <span>Kirim Pesan</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
