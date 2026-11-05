"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Buildings, CalendarBlank, CaretLeft } from "@phosphor-icons/react";
import { baak } from "@/lib/roles";

function BaakJadwalDetailContent() {
  const params = useParams<{ kelas: string }>();
  const decodedKelas = params.kelas ? decodeURIComponent(params.kelas) : "";
  const kelas = baak.jadwalKelas.find((k) => k.kelas === decodedKelas);

  if (!kelas) {
    return (
      <div className="mx-auto min-h-dvh w-full max-w-md bg-background px-4 pt-6">
        <Link
          href="/baak"
          className="flex items-center gap-1 text-sm font-medium text-muted hover:text-ink transition-colors"
        >
          <CaretLeft size={18} />
          Kembali ke BAAK
        </Link>
        <div className="mt-8 rounded-2xl border border-dashed border-line p-6 text-center text-sm text-muted">
          Kelas {decodedKelas} tidak ditemukan dalam master jadwal.
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-md bg-background pb-12">
      <header className="flex items-center gap-3 px-4 pt-6">
        <Link
          href="/baak"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-surface text-muted shadow-sm hover:text-ink transition-colors"
        >
          <CaretLeft size={18} />
        </Link>
        <div>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
            Master Jadwal BAAK
          </span>
          <h1 className="text-lg font-bold text-ink">Kelas {kelas.kelas}</h1>
        </div>
      </header>

      <main className="space-y-3 px-4 py-4">
        <p className="text-xs text-muted">
          Total {kelas.matkul.length} mata kuliah terjadwal untuk kelas ini:
        </p>

        {kelas.matkul.map((matkul) => (
          <div key={matkul.nama} className="rounded-2xl bg-surface p-4 shadow-sm border border-line">
            <h2 className="text-base font-bold text-ink">{matkul.nama}</h2>
            <div className="mt-2.5 space-y-1.5 text-xs text-muted">
              <p className="flex items-center gap-2">
                <CalendarBlank size={16} className="text-primary" />
                <span>{matkul.hari}, {matkul.waktu}</span>
              </p>
              <p className="flex items-center gap-2">
                <Buildings size={16} className="text-primary" />
                <span>Lokasi: {matkul.gedung}</span>
              </p>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}

export default function BaakJadwalDetailPage() {
  return (
    <Suspense fallback={<div className="mx-auto min-h-dvh w-full max-w-md bg-background p-6 text-center text-xs text-muted">Memuat jadwal...</div>}>
      <BaakJadwalDetailContent />
    </Suspense>
  );
}
