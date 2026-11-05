"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Buildings,
  CalendarBlank,
  CaretDown,
  CaretLeft,
  CaretRight,
  MapPin,
  Plus,
  X,
  Minus,
  ArrowSquareOut,
} from "@phosphor-icons/react";
import { AppShell } from "@/components/AppShell";
import { RoleHeader } from "@/components/RoleHeader";
import { baakNav } from "@/lib/nav";
import { baak } from "@/lib/roles";

const PAGE_SIZE = 3;

interface GedungItem {
  nama: string;
  lat: number;
  long: number;
  radius: number;
}

interface JadwalKelasItem {
  kelas: string;
  matkul: {
    nama: string;
    hari: string;
    waktu: string;
    gedung: string;
  }[];
}

export default function BaakPage() {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  // State: Gedung
  const [gedungList, setGedungList] = useState<GedungItem[]>(baak.gedung);
  const [showAddGedung, setShowAddGedung] = useState(false);
  const [newGedungNama, setNewGedungNama] = useState("");
  const [newGedungLat, setNewGedungLat] = useState("-6.8592");
  const [newGedungLong, setNewGedungLong] = useState("107.9172");
  const [newGedungRadius, setNewGedungRadius] = useState(60);

  // State: Jadwal
  const [jadwalList, setJadwalList] = useState<JadwalKelasItem[]>(baak.jadwalKelas);
  const [showAddJadwal, setShowAddJadwal] = useState(false);
  const [newJadwalKelas, setNewJadwalKelas] = useState("TI-3A");
  const [newJadwalMatkul, setNewJadwalMatkul] = useState("");
  const [newJadwalHari, setNewJadwalHari] = useState("Senin");
  const [newJadwalWaktu, setNewJadwalWaktu] = useState("08.00 - 10.00");
  const [newJadwalGedung, setNewJadwalGedung] = useState("Gedung A");

  const totalPages = Math.ceil(jadwalList.length / PAGE_SIZE);
  const pageKelas = jadwalList.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  function goTo(next: number) {
    setPage(next);
    setExpanded(null);
  }

  function handleSaveGedung() {
    if (!newGedungNama.trim()) return;
    const item: GedungItem = {
      nama: newGedungNama.trim(),
      lat: parseFloat(newGedungLat) || -6.8586,
      long: parseFloat(newGedungLong) || 107.9162,
      radius: newGedungRadius,
    };
    setGedungList((prev) => [...prev, item]);
    setNewGedungNama("");
    setShowAddGedung(false);
  }

  function handleSaveJadwal() {
    if (!newJadwalMatkul.trim()) return;
    setJadwalList((prev) => {
      const existing = prev.find((k) => k.kelas === newJadwalKelas);
      const newMatkulItem = {
        nama: newJadwalMatkul.trim(),
        hari: newJadwalHari,
        waktu: newJadwalWaktu,
        gedung: newJadwalGedung,
      };

      if (existing) {
        return prev.map((k) =>
          k.kelas === newJadwalKelas
            ? { ...k, matkul: [...k.matkul, newMatkulItem] }
            : k,
        );
      } else {
        return [
          {
            kelas: newJadwalKelas,
            matkul: [newMatkulItem],
          },
          ...prev,
        ];
      }
    });
    setNewJadwalMatkul("");
    setShowAddJadwal(false);
  }

  function updateRadius(nama: string, delta: number) {
    setGedungList((prev) =>
      prev.map((g) =>
        g.nama === nama
          ? { ...g, radius: Math.max(20, Math.min(200, g.radius + delta)) }
          : g,
      ),
    );
  }

  return (
    <AppShell items={baakNav}>
      <div className="space-y-6">
        <RoleHeader nama={baak.nama} role={baak.role} />

        {/* Master Gedung */}
        <section id="gedung" className="space-y-3 scroll-mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Master Gedung</h2>
              <p className="text-xs text-muted">Daftar gedung dan titik pusat koordinat kampus.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {gedungList.length} Gedung
            </span>
          </div>

          <div className="space-y-2.5">
            {gedungList.map((gedung) => (
              <div key={gedung.nama} className="rounded-2xl bg-surface p-4 shadow-sm border border-line">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Buildings size={20} />
                    </span>
                    <div>
                      <p className="font-bold text-ink text-sm">{gedung.nama}</p>
                      <p className="text-xs text-faint">
                        {gedung.lat}, {gedung.long}
                      </p>
                    </div>
                  </div>
                  <span className="rounded-full bg-line px-2.5 py-1 text-xs font-bold text-primary">
                    {gedung.radius} m
                  </span>
                </div>
              </div>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setShowAddGedung(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-3 text-xs font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Tambah Gedung Baru
          </button>
        </section>

        {/* Master Jadwal */}
        <section id="jadwal" className="space-y-3 scroll-mt-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-ink">Master Jadwal</h2>
              <p className="text-xs text-muted">Jadwal perkuliahan per kelas semester aktif.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
              {jadwalList.length} Kelas
            </span>
          </div>

          <div className="space-y-2.5">
            {pageKelas.map((kelas) => {
              const isOpen = expanded === kelas.kelas;
              return (
                <div key={kelas.kelas} className="rounded-2xl bg-surface p-4 shadow-sm border border-line">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-bold text-ink">{kelas.kelas}</h3>
                      <p className="text-xs text-faint">{kelas.matkul.length} mata kuliah terjadwal</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Link
                        href={`/baak/jadwal/${encodeURIComponent(kelas.kelas)}`}
                        className="flex items-center gap-1 rounded-full bg-background px-2.5 py-1.5 text-xs font-semibold text-muted hover:text-ink transition-colors"
                        title="Buka Halaman Penuh"
                      >
                        <ArrowSquareOut size={14} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : kelas.kelas)}
                        className="flex shrink-0 items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary cursor-pointer hover:bg-primary/20 transition-colors"
                      >
                        Detail
                        <CaretDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-3 space-y-2 border-t border-line/60 pt-3 animate-fade-in">
                      {kelas.matkul.map((matkul) => (
                        <div key={matkul.nama} className="rounded-xl bg-background p-3">
                          <p className="font-semibold text-ink text-xs">{matkul.nama}</p>
                          <div className="mt-1 flex items-center justify-between text-[11px] text-muted">
                            <span className="flex items-center gap-1">
                              <CalendarBlank size={13} className="text-primary" />
                              {matkul.hari}, {matkul.waktu}
                            </span>
                            <span className="flex items-center gap-1">
                              <Buildings size={13} className="text-primary" />
                              {matkul.gedung}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => goTo(page - 1)}
              disabled={page === 1}
              className="flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-sm disabled:opacity-40 cursor-pointer"
            >
              <CaretLeft size={14} />
              Sebelumnya
            </button>
            <span className="text-xs text-muted">
              Halaman {page} dari {totalPages}
            </span>
            <button
              type="button"
              onClick={() => goTo(page + 1)}
              disabled={page === totalPages}
              className="flex items-center gap-1 rounded-full bg-surface px-3 py-1.5 text-xs font-medium text-ink shadow-sm disabled:opacity-40 cursor-pointer"
            >
              Berikutnya
              <CaretRight size={14} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setShowAddJadwal(true)}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-3 text-xs font-bold text-primary hover:bg-primary/10 transition-colors cursor-pointer"
          >
            <Plus size={16} />
            Tambah Jadwal Kelas Baru
          </button>
        </section>

        {/* Radius Lokasi Presensi */}
        <section id="radius" className="space-y-3 scroll-mt-6">
          <div>
            <h2 className="text-lg font-bold text-ink">Radius Geofencing Lokasi</h2>
            <p className="text-xs text-muted">
              Batas toleransi jarak presensi luring mahasiswa per gedung (meter).
            </p>
          </div>

          <div className="space-y-2.5">
            {gedungList.map((gedung) => (
              <div
                key={gedung.nama}
                className="flex items-center justify-between rounded-2xl bg-surface p-4 shadow-sm border border-line"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <MapPin size={20} />
                  </span>
                  <div>
                    <p className="font-bold text-ink text-sm">{gedung.nama}</p>
                    <p className="text-xs text-faint">Toleransi GPS Haversine</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => updateRadius(gedung.nama, -10)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-background text-muted hover:text-ink cursor-pointer"
                    title="Kurangi 10m"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="min-w-14 text-center rounded-lg bg-primary/10 py-1 px-2 text-xs font-bold text-primary">
                    {gedung.radius} m
                  </span>
                  <button
                    type="button"
                    onClick={() => updateRadius(gedung.nama, 10)}
                    className="flex h-7 w-7 items-center justify-center rounded-lg bg-background text-muted hover:text-ink cursor-pointer"
                    title="Tambah 10m"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Modal Tambah Gedung */}
      {showAddGedung && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-bold text-ink">Tambah Master Gedung</h3>
              <button
                type="button"
                onClick={() => setShowAddGedung(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted hover:text-ink cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">Nama Gedung</label>
                <input
                  type="text"
                  placeholder="Contoh: Gedung D (Lab Komputer)"
                  value={newGedungNama}
                  onChange={(e) => setNewGedungNama(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-line bg-background text-ink text-xs focus:outline-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Latitude</label>
                  <input
                    type="text"
                    value={newGedungLat}
                    onChange={(e) => setNewGedungLat(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-line bg-background text-ink text-xs focus:outline-primary"
                  />
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Longitude</label>
                  <input
                    type="text"
                    value={newGedungLong}
                    onChange={(e) => setNewGedungLong(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-line bg-background text-ink text-xs focus:outline-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">
                  Radius Geofencing Presensi: {newGedungRadius} meter
                </label>
                <input
                  type="range"
                  min="30"
                  max="150"
                  step="5"
                  value={newGedungRadius}
                  onChange={(e) => setNewGedungRadius(Number(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddGedung(false)}
                className="flex-1 rounded-full border border-line py-2.5 text-xs font-semibold text-muted hover:bg-background cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveGedung}
                className="flex-1 rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-strong cursor-pointer"
              >
                Simpan Gedung
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Jadwal */}
      {showAddJadwal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-bold text-ink">Tambah Jadwal Kelas</h3>
              <button
                type="button"
                onClick={() => setShowAddJadwal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted hover:text-ink cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div>
                <label className="font-bold text-ink block mb-1">Kelas</label>
                <input
                  type="text"
                  placeholder="Contoh: TI-3A, SI-2B"
                  value={newJadwalKelas}
                  onChange={(e) => setNewJadwalKelas(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-line bg-background text-ink text-xs focus:outline-primary"
                />
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Nama Mata Kuliah</label>
                <input
                  type="text"
                  placeholder="Contoh: Kecerdasan Buatan"
                  value={newJadwalMatkul}
                  onChange={(e) => setNewJadwalMatkul(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-line bg-background text-ink text-xs focus:outline-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-ink block mb-1">Hari</label>
                  <select
                    value={newJadwalHari}
                    onChange={(e) => setNewJadwalHari(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-line bg-background text-ink text-xs focus:outline-primary cursor-pointer"
                  >
                    <option value="Senin">Senin</option>
                    <option value="Selasa">Selasa</option>
                    <option value="Rabu">Rabu</option>
                    <option value="Kamis">Kamis</option>
                    <option value="Jumat">Jumat</option>
                    <option value="Sabtu">Sabtu</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-ink block mb-1">Waktu</label>
                  <input
                    type="text"
                    placeholder="08.00 - 10.00"
                    value={newJadwalWaktu}
                    onChange={(e) => setNewJadwalWaktu(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-line bg-background text-ink text-xs focus:outline-primary"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-ink block mb-1">Lokasi Gedung</label>
                <select
                  value={newJadwalGedung}
                  onChange={(e) => setNewJadwalGedung(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-line bg-background text-ink text-xs focus:outline-primary cursor-pointer"
                >
                  {gedungList.map((g) => (
                    <option key={g.nama} value={g.nama}>
                      {g.nama}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddJadwal(false)}
                className="flex-1 rounded-full border border-line py-2.5 text-xs font-semibold text-muted hover:bg-background cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleSaveJadwal}
                className="flex-1 rounded-full bg-primary py-2.5 text-xs font-bold text-white hover:bg-primary-strong cursor-pointer"
              >
                Simpan Jadwal
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
