"use client";

import { useState } from "react";
import {
  CalendarBlank,
  CheckCircle,
  GraduationCap,
  MapPin,
  XCircle,
  ArrowCounterClockwise,
  Broadcast,
  Buildings,
  Target,
  Warning,
  Globe,
} from "@phosphor-icons/react";

type Metode = "Luring" | "Daring";
type PresensiState = "idle" | "memeriksa" | "sukses" | "gagal";
type DemoScenario = "valid" | "luar_radius" | "daring";

export function PresensiCard({
  nama,
  dosen,
  hari,
  waktu,
  metode: initialMetode,
}: {
  nama: string;
  dosen: string;
  hari: string;
  waktu: string;
  metode: Metode;
}) {
  const [metode, setMetode] = useState<Metode>(initialMetode);
  const [state, setState] = useState<PresensiState>("idle");
  const [jarak, setJarak] = useState<number | null>(null);
  const [waktuAbsen, setWaktuAbsen] = useState<string | null>(null);
  const [scenario, setScenario] = useState<DemoScenario>("valid");

  const isLuring = metode === "Luring";

  function absen() {
    if (state === "sukses" || state === "memeriksa") return;

    setState("memeriksa");
    setJarak(null);

    const now = new Date();
    const timeString = `${String(now.getHours()).padStart(2, "0")}.${String(
      now.getMinutes(),
    ).padStart(2, "0")} WIB`;
    setWaktuAbsen(timeString);

    if (scenario === "daring" || !isLuring) {
      // Daring: one-click instant lock
      setTimeout(() => {
        setState("sukses");
      }, 700);
      return;
    }

    // Luring based on demo scenario
    setTimeout(() => {
      if (scenario === "valid") {
        setJarak(38);
        setState("sukses");
      } else {
        setJarak(118);
        setState("gagal");
      }
    }, 1000);
  }

  function resetSimulasi() {
    setState("idle");
    setJarak(null);
    setWaktuAbsen(null);
  }

  const label = {
    idle: "Absen Sekarang!",
    memeriksa: isLuring ? "Memvalidasi GPS & Geofencing..." : "Merekam kehadiran...",
    sukses: "Kehadiran Berhasil Dicatat",
    gagal: "Di Luar Batas Radius Kampus",
  }[state];

  const disabled = state === "memeriksa" || state === "sukses";

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm space-y-4">
      {/* Demo Scenario Controller Bar */}
      <div className="rounded-2xl bg-background p-2.5">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="font-bold text-ink flex items-center gap-1">
            <Broadcast size={14} className="text-primary" />
            Skenario Demo Absensi:
          </span>
          {state !== "idle" && (
            <button
              type="button"
              onClick={resetSimulasi}
              className="flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
            >
              <ArrowCounterClockwise size={12} />
              Reset
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setScenario("valid");
              setMetode("Luring");
              resetSimulasi();
            }}
            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 px-2 text-[10px] font-semibold transition-all cursor-pointer ${
              scenario === "valid" && isLuring
                ? "bg-primary text-white shadow-xs"
                : "bg-surface text-muted hover:text-ink"
            }`}
          >
            <Target size={13} className="shrink-0" weight="bold" />
            <span>Valid (38m)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setScenario("luar_radius");
              setMetode("Luring");
              resetSimulasi();
            }}
            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 px-2 text-[10px] font-semibold transition-all cursor-pointer ${
              scenario === "luar_radius" && isLuring
                ? "bg-danger text-danger-ink shadow-xs"
                : "bg-surface text-muted hover:text-ink"
            }`}
          >
            <Warning size={13} className="shrink-0" weight="bold" />
            <span>Luar (118m)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setScenario("daring");
              setMetode("Daring");
              resetSimulasi();
            }}
            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 px-2 text-[10px] font-semibold transition-all cursor-pointer ${
              scenario === "daring" || !isLuring
                ? "bg-accent text-ink shadow-xs"
                : "bg-surface text-muted hover:text-ink"
            }`}
          >
            <Globe size={13} className="shrink-0" weight="bold" />
            <span>Daring</span>
          </button>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            PT 04 · Sesi Buka
          </span>
          <span className="text-xs font-medium text-muted flex items-center gap-1">
            <Buildings size={14} /> Gedung A
          </span>
        </div>
        <h2 className="mt-1.5 text-xl font-bold text-ink">{nama}</h2>
        <p className="mt-0.5 text-sm text-muted">{dosen}</p>
      </div>

      <div className="space-y-2 text-sm text-muted bg-background/50 rounded-2xl p-3">
        <p className="flex items-center gap-2">
          <CalendarBlank size={18} className="text-primary" />
          <span>{hari}, {waktu}</span>
        </p>
        <p className="flex items-center gap-2">
          <GraduationCap size={18} className="text-primary" />
          <span>
            {metode} {isLuring ? "· Batas Radius 60 meter" : "· One-click verification"}
          </span>
        </p>
      </div>

      {state === "gagal" && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-danger p-3.5 animate-fade-in">
          <XCircle size={22} className="shrink-0 text-danger-ink" weight="fill" />
          <div className="text-xs text-danger-ink flex-1">
            <p className="font-bold">Presensi Ditolak: Di Luar Jangkauan</p>
            <p className="mt-0.5">
              Posisi GPS Anda berjarak <span className="font-bold">{jarak} m</span> dari Gedung A (radius maksimal adalah 60 m). Silakan mendekat ke area kelas.
            </p>
          </div>
        </div>
      )}

      {state === "sukses" && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-success p-3.5 animate-fade-in">
          <CheckCircle size={22} className="shrink-0 text-success-ink" weight="fill" />
          <div className="text-xs text-success-ink flex-1">
            <p className="font-bold">Kehadiran Berhasil Dicatat!</p>
            <p className="mt-0.5">
              {isLuring
                ? `Validasi geofencing lolos: jarak ${jarak} m dari pusat gedung pada pukul ${waktuAbsen}.`
                : `Sesi daring terverifikasi pada pukul ${waktuAbsen}.`}
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={absen}
        disabled={disabled}
        className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition-all cursor-pointer ${
          state === "sukses"
            ? "bg-success-ink shadow-xs"
            : state === "gagal"
            ? "bg-danger-ink shadow-xs"
            : "bg-primary hover:bg-primary-strong active:scale-[0.99] disabled:opacity-60 shadow-md"
        }`}
      >
        {isLuring && state === "idle" && <MapPin size={20} />}
        {state === "sukses" && <CheckCircle size={20} weight="fill" />}
        {label}
      </button>
    </section>
  );
}
