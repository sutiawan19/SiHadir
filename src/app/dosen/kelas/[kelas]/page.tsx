"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CaretLeft, Key, PencilSimple, CheckCircle } from "@phosphor-icons/react";
import { StatusBadge } from "@/components/StatusBadge";
import { dosen } from "@/lib/roles";

type KelasDosen = (typeof dosen.kelas)[number];
type MahasiswaDosen = KelasDosen["mahasiswa"][number];

function DosenKelasDetailContent() {
  const params = useParams<{ kelas: string }>();
  const decodedKelas = params.kelas ? decodeURIComponent(params.kelas) : "";
  const kelas = dosen.kelas.find((k) => k.kelas === decodedKelas);

  const [filter, setFilter] = useState<"semua" | number>("semua");
  const [mahasiswa, setMahasiswa] = useState<MahasiswaDosen[]>(() =>
    kelas ? kelas.mahasiswa.map((m) => ({ ...m, kehadiran: [...m.kehadiran] })) : [],
  );
  const [bypassed, setBypassed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!kelas) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-md bg-background px-4 pt-6">
        <Link
          href="/dosen"
          className="flex items-center gap-1 text-sm font-medium text-muted"
        >
          <CaretLeft size={18} />
          Kembali
        </Link>
        <p className="mt-6 text-muted">Kelas tidak ditemukan.</p>
      </div>
    );
  }

  const bobot = kelas.bobot;
  const total = kelas.pertemuan.length;
  const selectedPertemuan = filter === "semua" ? null : filter;

  function persen(m: MahasiswaDosen) {
    const hadir = m.kehadiran.filter(Boolean).length;
    return Math.round((hadir / total) * 100);
  }

  function nilai(m: MahasiswaDosen) {
    return ((persen(m) * bobot) / 100).toFixed(1);
  }

  function koreksi(nim: string, nama: string) {
    if (selectedPertemuan === null) return;
    setMahasiswa((prev) =>
      prev.map((m) => {
        if (m.nim === nim) {
          const nextState = !m.kehadiran[selectedPertemuan];
          setToastMessage(
            `Presensi ${nama} diperbarui menjadi ${nextState ? "Hadir" : "Tidak Hadir"}.`,
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
    <div className="mx-auto min-h-dvh w-full max-w-md bg-background pb-12">
      <header className="flex items-center gap-3 px-4 pt-6">
        <Link
          href="/dosen"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted shadow-sm hover:text-ink transition-colors"
        >
          <CaretLeft size={18} />
        </Link>
        <div>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
            {kelas.kelas}
          </span>
          <h1 className="text-lg font-bold text-ink">{kelas.nama}</h1>
        </div>
      </header>

      <main className="space-y-4 px-4 py-4">
        {/* Toast Notifikasi */}
        {toastMessage && (
          <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-2.5 text-xs font-bold text-primary animate-fade-in border border-primary/20">
            <CheckCircle size={16} weight="fill" className="shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        <div className="flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setFilter("semua")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              filter === "semua" ? "bg-primary text-white" : "bg-line text-muted"
            }`}
          >
            Semua
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

        <div className="space-y-2">
          {mahasiswa.map((m) => (
            <div key={m.nim} className="rounded-2xl bg-surface p-3.5 shadow-sm border border-line">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="font-bold text-ink text-sm">{m.nama}</p>
                  <p className="text-xs text-faint">{m.nim}</p>
                </div>

                {selectedPertemuan === null ? (
                  <div className="text-right">
                    <p className="text-base font-bold text-ink">{persen(m)}%</p>
                    <p className="text-xs text-faint">Poin Kehadiran: {nilai(m)}</p>
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
                  className="mt-2.5 flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer"
                >
                  <PencilSimple size={14} />
                  Koreksi Presensi
                </button>
              )}
            </div>
          ))}
        </div>

        {selectedPertemuan !== null && (
          <button
            type="button"
            onClick={toggleBypass}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-xs font-bold transition-all cursor-pointer shadow-md ${
              bypassed ? "bg-success text-success-ink" : "bg-primary text-white hover:bg-primary-strong"
            }`}
          >
            <Key size={16} />
            {bypassed ? "Bypass Darurat Aktif (Matikan)" : "Buka Kelas (Bypass Darurat)"}
          </button>
        )}
      </main>
    </div>
  );
}

export default function DosenKelasDetailPage() {
  return (
    <Suspense fallback={<div className="mx-auto min-h-dvh w-full max-w-md bg-background p-6 text-center text-xs text-muted">Memuat detail kelas...</div>}>
      <DosenKelasDetailContent />
    </Suspense>
  );
}
