"use client";

import { Suspense, useEffect, useState, useTransition, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  CaretLeft,
  Key,
  PencilSimple,
  CheckCircle,
  CircleNotch,
} from "@phosphor-icons/react";
import { StatusBadge } from "@/components/StatusBadge";
import { useDemo } from "@/lib/demo-context";
import {
  getDosenDashboardDataAction,
  koreksiPresensiDosenAction,
  type KelasDosenDetail,
  type MahasiswaKelasDosen,
} from "@/app/actions/dosen";

function DosenKelasDetailContent() {
  const params = useParams<{ kelas: string }>();
  const decodedKelas = params.kelas ? decodeURIComponent(params.kelas) : "";
  const { currentUser } = useDemo();
  const [isPending, startTransition] = useTransition();

  const [kelasData, setKelasData] = useState<KelasDosenDetail | null>(null);
  const [filterSesiId, setFilterSesiId] = useState<string>("semua");
  const [bypassed, setBypassed] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const loadData = useCallback(() => {
    startTransition(async () => {
      try {
        const res = await getDosenDashboardDataAction(currentUser.id);
        const match = res.kelasDetails.find((k) => k.kelas === decodedKelas);
        if (match) {
          setKelasData(match);
        } else if (res.kelasDetails.length > 0) {
          setKelasData(res.kelasDetails[0]);
        }
      } catch (err) {
        console.error("Gagal memuat detail kelas dosen:", err);
      }
    });
  }, [currentUser.id, decodedKelas]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (!kelasData && isPending) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-md bg-background px-4 pt-12 text-center text-xs text-muted flex flex-col items-center justify-center gap-2">
        <CircleNotch size={24} className="animate-spin text-primary" />
        <span>Memuat data kelas perkuliahan...</span>
      </div>
    );
  }

  if (!kelasData) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-md bg-background px-4 pt-6">
        <Link
          href="/dosen"
          className="flex items-center gap-1 text-sm font-medium text-muted hover:text-ink"
        >
          <CaretLeft size={18} />
          Kembali
        </Link>
        <p className="mt-6 text-muted text-xs">Kelas tidak ditemukan.</p>
      </div>
    );
  }

  const pertemuans = kelasData.pertemuanList;

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
          `Presensi ${mhs.nama} diubah menjadi ${
            nextStatus === "hadir" ? "HADIR" : "ALPHA"
          }.`
        );
        setTimeout(() => setToastMessage(null), 3000);
        loadData();
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
        ? "Bypass Darurat Aktif: Mahasiswa diizinkan absen tanpa batasan radius."
        : "Bypass Darurat Dimatikan: Validasi radius geofencing kembali normal."
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
            {kelasData.kelas}
          </span>
          <h1 className="text-lg font-bold text-ink">{kelasData.nama}</h1>
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
            onClick={() => setFilterSesiId("semua")}
            className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer ${
              filterSesiId === "semua"
                ? "bg-primary text-white"
                : "bg-line text-muted hover:text-ink"
            }`}
          >
            Semua
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

        <div className="space-y-2">
          {kelasData.mahasiswaList.map((m) => {
            const isHadirInFiltered =
              filterSesiId !== "semua"
                ? Boolean(m.kehadiranPerSesi[filterSesiId])
                : false;

            return (
              <div
                key={m.id}
                className="rounded-2xl bg-surface p-3.5 shadow-sm border border-line"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-ink text-sm">{m.nama}</p>
                    <p className="text-xs text-faint">{m.nim}</p>
                  </div>

                  {filterSesiId === "semua" ? (
                    <div className="text-right">
                      <p className="text-base font-bold text-ink">
                        {m.persenKehadiran}%
                      </p>
                      <p className="text-xs text-faint">
                        Poin Kehadiran: {m.poinKehadiran}
                      </p>
                    </div>
                  ) : (
                    <StatusBadge
                      status={isHadirInFiltered ? "Hadir" : "Alpha"}
                    />
                  )}
                </div>

                {filterSesiId !== "semua" && (
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={() => handleKoreksi(m)}
                    className="mt-2.5 flex items-center gap-1 text-xs font-bold text-primary hover:underline cursor-pointer disabled:opacity-50"
                  >
                    <PencilSimple size={14} />
                    <span>
                      Koreksi Presensi ({isHadirInFiltered ? "Jadikan Alpha" : "Jadikan Hadir"})
                    </span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {filterSesiId !== "semua" && (
          <button
            type="button"
            onClick={toggleBypass}
            className={`flex w-full items-center justify-center gap-2 rounded-full py-3 text-xs font-bold transition-all cursor-pointer shadow-md ${
              bypassed
                ? "bg-success text-success-ink"
                : "bg-primary text-white hover:bg-primary-strong"
            }`}
          >
            <Key size={16} />
            <span>
              {bypassed
                ? "Bypass Darurat Aktif (Matikan)"
                : "Buka Kelas (Bypass Darurat)"}
            </span>
          </button>
        )}
      </main>
    </div>
  );
}

export default function DosenKelasDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto min-h-dvh w-full max-w-md bg-background p-6 text-center text-xs text-muted">
          Memuat detail kelas...
        </div>
      }
    >
      <DosenKelasDetailContent />
    </Suspense>
  );
}
