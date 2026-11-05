"use client";

import { useState } from "react";
import {
  CaretDown,
  CaretRight,
  ClockCounterClockwise,
  Check,
  X,
  Buildings,
  MapPin,
} from "@phosphor-icons/react";
import { PresensiCard } from "@/components/PresensiCard";
import { StatusBadge } from "@/components/StatusBadge";
import { kelasBerikutnya, riwayatKehadiran, type RiwayatItem } from "@/lib/mock";

const MATA_KULIAH_LIST = [
  { id: "all", nama: "Semua Mata Kuliah", dosen: "", hari: "", waktu: "", metode: "Luring" as const },
  { id: "se", nama: "Sistem Enterprise", dosen: "Agun Guntara, S.Kom., M.Kom", hari: "Rabu", waktu: "08.00 - 10.00", metode: "Luring" as const },
  { id: "bd", nama: "Basis Data", dosen: "Bambang S., M.Kom", hari: "Kamis", waktu: "10.00 - 12.00", metode: "Luring" as const },
  { id: "pw", nama: "Pemrograman Web", dosen: "Cici N., M.Kom", hari: "Jumat", waktu: "13.00 - 15.00", metode: "Daring" as const },
];

export default function KehadiranPage() {
  const [selectedMatkul, setSelectedMatkul] = useState(MATA_KULIAH_LIST[1]); // default Sistem Enterprise
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedRiwayat, setSelectedRiwayat] = useState<RiwayatItem | null>(null);

  const filteredRiwayat =
    selectedMatkul.id === "all"
      ? riwayatKehadiran
      : riwayatKehadiran.filter((r) => r.nama === selectedMatkul.nama);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-ink">Kehadiran</h1>
        <p className="text-xs text-muted mt-0.5">
          Rekam kehadiran perkuliahan dengan GPS & Geofencing
        </p>
      </div>

      <PresensiCard
        nama={selectedMatkul.nama === "Semua Mata Kuliah" ? kelasBerikutnya.nama : selectedMatkul.nama}
        dosen={selectedMatkul.nama === "Semua Mata Kuliah" ? kelasBerikutnya.dosen : selectedMatkul.dosen}
        hari={selectedMatkul.nama === "Semua Mata Kuliah" ? kelasBerikutnya.hari : selectedMatkul.hari}
        waktu={selectedMatkul.nama === "Semua Mata Kuliah" ? kelasBerikutnya.waktu : selectedMatkul.waktu}
        metode={selectedMatkul.nama === "Semua Mata Kuliah" ? kelasBerikutnya.metode : selectedMatkul.metode}
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
              {selectedMatkul.nama}
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
              {MATA_KULIAH_LIST.map((m) => {
                const isSelected = selectedMatkul.id === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => {
                      setSelectedMatkul(m);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs text-left transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-primary/10 font-bold text-primary"
                        : "text-ink hover:bg-background"
                    }`}
                  >
                    <span>{m.nama}</span>
                    {isSelected && <Check size={16} className="text-primary" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* List Riwayat */}
        <div className="mt-3 space-y-3">
          {filteredRiwayat.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-6 text-center text-xs text-muted">
              Belum ada riwayat kehadiran untuk mata kuliah ini.
            </div>
          ) : (
            filteredRiwayat.map((item) => (
              <button
                key={item.kode}
                type="button"
                onClick={() => setSelectedRiwayat(item)}
                className="w-full text-left rounded-2xl border border-line bg-surface p-4 shadow-sm hover:border-primary/20 transition-all active:scale-[0.99] cursor-pointer"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="rounded bg-background px-1.5 py-0.5 text-[10px] font-semibold text-faint">
                      {item.kode}
                    </span>
                    <h3 className="mt-1 text-base font-semibold text-ink">{item.nama}</h3>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
                <p className="mt-2 flex items-center gap-2 text-xs text-muted">
                  <ClockCounterClockwise size={15} />
                  <span>{item.waktu}</span>
                  <span className="ml-auto flex items-center gap-0.5 text-primary font-medium">
                    <span>Detail</span>
                    <CaretRight size={13} />
                  </span>
                </p>
              </button>
            ))
          )}
        </div>
      </section>

      {/* Modal Detail Presensi */}
      {selectedRiwayat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {selectedRiwayat.kode}
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
                <p className="text-sm font-bold text-ink">{selectedRiwayat.nama}</p>
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
                  <p className="mt-1 text-xs font-bold text-ink">Luring (Tatap Muka)</p>
                </div>
              </div>

              <div className="rounded-xl bg-background p-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted flex items-center gap-1.5">
                    <ClockCounterClockwise size={14} /> Waktu Tercatat
                  </span>
                  <span className="font-semibold text-ink">{selectedRiwayat.waktu}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted flex items-center gap-1.5">
                    <Buildings size={14} /> Lokasi
                  </span>
                  <span className="font-semibold text-ink">Gedung A (R. 302)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted flex items-center gap-1.5">
                    <MapPin size={14} /> Jarak Geofencing
                  </span>
                  <span className="font-semibold text-success-ink">
                    38 meter (Valid &lt;60m)
                  </span>
                </div>
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
