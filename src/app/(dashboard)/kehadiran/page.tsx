"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import {
  CaretDown,
  CaretRight,
  ClockCounterClockwise,
  Check,
  X,
  Buildings,
  MapPin,
  CircleNotch,
} from "@phosphor-icons/react";
import { PresensiCard } from "@/components/PresensiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { useDemo } from "@/lib/demo-context";
import { getKehadiranDataAction } from "@/app/actions/attendance";
import { formatTanggalIndo } from "@/lib/format";
import type { JadwalKelasDetail, PresensiRecord, SesiPerkuliahanDetail } from "@/services/types";

export default function KehadiranPage() {
  const { currentUser } = useDemo();
  const [isPending, startTransition] = useTransition();

  const [data, setData] = useState<{
    daftarJadwal: JadwalKelasDetail[];
    kelasAktif: JadwalKelasDetail | null;
    sesiHariIni: SesiPerkuliahanDetail | null;
    sudahAbsen: boolean;
    presensiHariIni: any;
    riwayat: PresensiRecord[];
  } | null>(null);

  const [selectedJadwalId, setSelectedJadwalId] = useState<string>("all");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRiwayat, setSelectedRiwayat] = useState<PresensiRecord | null>(null);

  const fetchData = useCallback(() => {
    startTransition(async () => {
      try {
        const res = await getKehadiranDataAction(currentUser.id);
        setData(res);
        if (res.kelasAktif && selectedJadwalId === "all") {
          // Keep "all" or specific
        }
      } catch (err) {
        console.error("Gagal memuat data kehadiran:", err);
      }
    });
  }, [currentUser.id, selectedJadwalId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const daftarJadwal = data?.daftarJadwal || [];
  const activeKelas = data?.kelasAktif || (daftarJadwal.length > 0 ? daftarJadwal[0] : null);
  const activeSesi = data?.sesiHariIni || null;
  const sudahAbsen = data?.sudahAbsen ?? false;
  const presensiHariIni = data?.presensiHariIni ?? null;
  const riwayatList = data?.riwayat || [];

  const filteredRiwayat =
    selectedJadwalId === "all"
      ? riwayatList
      : riwayatList.filter(
          (r) => (r.sesi as any)?.jadwal_id === selectedJadwalId || (r.sesi as any)?.jadwal?.id === selectedJadwalId
        );

  const selectedMatkulLabel =
    selectedJadwalId === "all"
      ? "Semua Mata Kuliah"
      : daftarJadwal.find((j) => j.id === selectedJadwalId)?.matkul?.nama_matkul || "Mata Kuliah Terpilih";

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold text-ink">Kehadiran</h1>
          {isPending && (
            <CircleNotch size={18} className="animate-spin text-primary" />
          )}
        </div>
        <p className="text-xs text-muted mt-0.5">
          Rekam kehadiran perkuliahan dengan GPS & Geofencing
        </p>
      </div>

      <PresensiCard
        jadwal={activeKelas}
        sesi={activeSesi}
        sudahAbsen={sudahAbsen}
        presensiHariIni={presensiHariIni}
        mahasiswaId={currentUser.id}
        onPresensiSuccess={fetchData}
      />

      <section>
        <h2 className="text-lg font-bold text-ink">Riwayat Kehadiran</h2>

        {/* Dropdown Filter Mata Kuliah */}
        <div className="relative mt-3">
          <button
            type="button"
            onClick={() => setIsDropdownOpen((v) => !v)}
            className="flex w-full items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3 shadow-xs hover:border-primary/40 transition-colors cursor-pointer"
          >
            <span className="text-sm font-semibold text-ink">
              {selectedMatkulLabel}
            </span>
            <CaretDown
              size={18}
              className={`text-faint transition-transform ${
                isDropdownOpen ? "rotate-180 text-primary" : ""
              }`}
            />
          </button>

          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 z-20 mt-1.5 rounded-2xl border border-line bg-surface p-1.5 shadow-xl animate-fade-in">
              <button
                type="button"
                onClick={() => {
                  setSelectedJadwalId("all");
                  setIsDropdownOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                  selectedJadwalId === "all"
                    ? "bg-primary/10 font-bold text-primary"
                    : "text-ink hover:bg-background"
                }`}
              >
                <span>Semua Mata Kuliah</span>
                {selectedJadwalId === "all" && <Check size={16} className="text-primary" />}
              </button>

              {daftarJadwal.map((j) => {
                const isSelected = selectedJadwalId === j.id;
                return (
                  <button
                    key={j.id}
                    type="button"
                    onClick={() => {
                      setSelectedJadwalId(j.id);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 font-bold text-primary"
                        : "text-ink hover:bg-background"
                    }`}
                  >
                    <span>
                      {j.matkul?.kode_matkul} - {j.matkul?.nama_matkul} ({j.kelas})
                    </span>
                    {isSelected && <Check size={16} className="text-primary" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* List Riwayat Real */}
        <div className="mt-3 space-y-3">
          {filteredRiwayat.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-6 text-center text-xs text-muted">
              Belum ada riwayat kehadiran untuk mata kuliah ini.
            </div>
          ) : (
            filteredRiwayat.map((item) => {
              const matkulKode = item.sesi?.jadwal?.matkul?.kode_matkul || "TI-301";
              const matkulNama = item.sesi?.jadwal?.matkul?.nama_matkul || "Sistem Enterprise";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedRiwayat(item)}
                  className="w-full text-left rounded-2xl border border-line bg-surface p-4 shadow-sm hover:border-primary/20 transition-all active:scale-[0.99] cursor-pointer"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="rounded bg-background px-1.5 py-0.5 text-[10px] font-semibold text-faint">
                        {matkulKode}
                      </span>
                      <h3 className="mt-1 text-base font-semibold text-ink">{matkulNama}</h3>
                    </div>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-2 flex items-center gap-2 text-xs text-muted">
                    <ClockCounterClockwise size={15} />
                    <span>{formatTanggalIndo(item.waktu_hadir)}</span>
                    <span className="ml-auto flex items-center gap-0.5 text-primary font-medium">
                      <span>Detail</span>
                      <CaretRight size={13} />
                    </span>
                  </p>
                </button>
              );
            })
          )}
        </div>
      </section>

      {/* Modal Detail Presensi Real */}
      {selectedRiwayat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {selectedRiwayat.sesi?.jadwal?.matkul?.kode_matkul || "TI-301"}
                </span>
                <h3 className="mt-1 text-base font-bold text-ink">Detail Presensi</h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRiwayat(null)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted hover:text-ink cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <p className="text-xs text-muted">Mata Kuliah</p>
                <p className="text-sm font-bold text-ink">
                  {selectedRiwayat.sesi?.jadwal?.matkul?.nama_matkul || "Sistem Enterprise"}
                </p>
                <p className="text-xs text-muted mt-0.5">
                  Kelas {selectedRiwayat.sesi?.jadwal?.kelas || "TI-3A"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-background p-3">
                  <p className="text-[11px] text-muted">Status</p>
                  <div className="mt-1">
                    <StatusBadge status={selectedRiwayat.status} />
                  </div>
                </div>
                <div className="rounded-xl bg-background p-3">
                  <p className="text-[11px] text-muted">Metode</p>
                  <p className="mt-1 text-xs font-bold text-ink">
                    {selectedRiwayat.sesi?.metode_kelas === "daring"
                      ? "Daring (Online)"
                      : "Luring (Tatap Muka)"}
                  </p>
                </div>
              </div>

              <div className="rounded-xl bg-background p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted flex items-center gap-1.5">
                    <ClockCounterClockwise size={14} /> Waktu Tercatat
                  </span>
                  <span className="font-semibold text-ink">
                    {formatTanggalIndo(selectedRiwayat.waktu_hadir)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted flex items-center gap-1.5">
                    <Buildings size={14} /> Lokasi
                  </span>
                  <span className="font-semibold text-ink">
                    {selectedRiwayat.sesi?.jadwal?.gedung?.nama_gedung || "Gedung A"}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted flex items-center gap-1.5">
                    <MapPin size={14} /> Jarak Geofencing
                  </span>
                  <span className="font-semibold text-success-ink">
                    {selectedRiwayat.jarak_meter != null
                      ? `${selectedRiwayat.jarak_meter} meter (Valid <60m)`
                      : "Sesi Daring (Valid)"}
                  </span>
                </div>
                {selectedRiwayat.lat_mhs && selectedRiwayat.long_mhs && (
                  <div className="flex items-center justify-between text-[11px] text-muted pt-1 border-t border-line/60">
                    <span>Koordinat GPS</span>
                    <span className="font-mono">
                      {selectedRiwayat.lat_mhs.toFixed(5)}, {selectedRiwayat.long_mhs.toFixed(5)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => setSelectedRiwayat(null)}
              className="mt-5 w-full rounded-full bg-primary py-2.5 text-xs font-semibold text-white cursor-pointer"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
