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
  CircleNotch,
  NavigationArrow,
} from "@phosphor-icons/react";
import { recordAttendanceAction } from "@/app/actions/attendance";
import { formatHari, formatJam, formatTanggalIndo } from "@/lib/format";
import type { JadwalKelasDetail, SesiPerkuliahanDetail, PresensiRecord } from "@/services/types";

type PresensiState = "idle" | "memeriksa" | "sukses" | "gagal";
type LocationSource = "preset_valid" | "preset_luar" | "gps";

interface PresensiCardProps {
  jadwal: JadwalKelasDetail | null;
  sesi: SesiPerkuliahanDetail | null;
  sudahAbsen: boolean;
  presensiHariIni?: PresensiRecord | any | null;
  mahasiswaId: string;
  onPresensiSuccess?: () => void;
}

export function PresensiCard({
  jadwal,
  sesi,
  sudahAbsen: initialSudahAbsen,
  presensiHariIni: initialPresensiHariIni,
  mahasiswaId,
  onPresensiSuccess,
}: PresensiCardProps) {
  const [state, setState] = useState<PresensiState>(
    initialSudahAbsen ? "sukses" : "idle"
  );
  const [locationSource, setLocationSource] = useState<LocationSource>("preset_valid");
  const [jarak, setJarak] = useState<number | null>(
    initialPresensiHariIni?.jarak_meter ?? null
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isDaring = sesi?.metode_kelas === "daring";
  const namaMatkul = jadwal?.matkul?.nama_matkul || "Sistem Enterprise";
  const namaDosen = jadwal?.dosen?.nama || "Agun Guntara, S.Kom., M.Kom";
  const namaGedung = jadwal?.gedung?.nama_gedung || "Gedung A";
  const radiusMeter = jadwal?.gedung?.radius_meter || 60;
  const jadwalHari = jadwal ? formatHari(jadwal.hari) : "Rabu";
  const jadwalWaktu = jadwal
    ? `${formatJam(jadwal.waktu_mulai)} - ${formatJam(jadwal.waktu_selesai)} WIB`
    : "08.00 - 10.00 WIB";

  async function executeAbsen(lat?: number | null, long?: number | null) {
    if (!sesi) {
      setState("gagal");
      setErrorMessage("Sesi perkuliahan belum dibuka.");
      return;
    }

    try {
      const res = await recordAttendanceAction({
        sesiId: sesi.id,
        mahasiswaId,
        latMhs: lat,
        longMhs: long,
      });

      if (res.success) {
        setState("sukses");
        setJarak(res.jarakMeter ?? null);
        setSuccessMessage(res.message);
        setErrorMessage(null);
        if (onPresensiSuccess) {
          onPresensiSuccess();
        }
      } else {
        setState("gagal");
        setJarak(res.jarakMeter ?? null);
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setState("gagal");
      setErrorMessage(err?.message || "Terjadi kesalahan saat memproses presensi.");
    }
  }

  function handleAbsen() {
    if (state === "sukses" || state === "memeriksa" || !sesi) return;

    setState("memeriksa");
    setErrorMessage(null);

    if (isDaring) {
      // Daring: instant one-click attendance without geofence enforcement
      executeAbsen(null, null);
      return;
    }

    if (locationSource === "gps") {
      if (typeof window === "undefined" || !navigator.geolocation) {
        setState("gagal");
        setErrorMessage("Browser tidak mendukung geolokasi GPS. Silakan gunakan preset lokasi.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          executeAbsen(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          setState("gagal");
          setErrorMessage(
            `Gagal mengambil sinyal GPS: ${err.message}. Silakan gunakan preset Kampus Gedung A untuk pengujian.`
          );
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else if (locationSource === "preset_valid") {
      // Koordinat Gedung A (-6.85862, 107.91621 -> jarak ~24m, valid <60m)
      executeAbsen(-6.85862, 107.91621);
    } else {
      // Koordinat di luar radius (-6.85980, 107.91740 -> jarak ~180m, ditolak)
      executeAbsen(-6.8598, 107.9174);
    }
  }

  function resetSimulasi() {
    setState("idle");
    setErrorMessage(null);
    setSuccessMessage(null);
    setJarak(null);
  }

  const disabled = state === "memeriksa" || state === "sukses" || !sesi;

  return (
    <section className="rounded-3xl border border-line bg-surface p-5 shadow-sm space-y-4">
      {/* Selector Sumber Lokasi / Skenario GPS */}
      <div className="rounded-2xl bg-background p-2.5">
        <div className="flex items-center justify-between text-[11px] mb-1.5">
          <span className="font-bold text-ink flex items-center gap-1">
            <Broadcast size={14} className="text-primary" />
            Sumber Lokasi Presensi:
          </span>
          {state !== "idle" && (
            <button
              type="button"
              onClick={resetSimulasi}
              className="flex items-center gap-1 font-semibold text-primary hover:underline cursor-pointer"
            >
              <ArrowCounterClockwise size={12} />
              Reset Uji
            </button>
          )}
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => {
              setLocationSource("preset_valid");
              resetSimulasi();
            }}
            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 px-2 text-[10px] font-semibold transition-all cursor-pointer ${
              locationSource === "preset_valid"
                ? "bg-primary text-white shadow-xs"
                : "bg-surface text-muted hover:text-ink"
            }`}
          >
            <Target size={13} className="shrink-0" weight="bold" />
            <span>Gedung A (24m)</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLocationSource("preset_luar");
              resetSimulasi();
            }}
            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 px-2 text-[10px] font-semibold transition-all cursor-pointer ${
              locationSource === "preset_luar"
                ? "bg-danger text-danger-ink shadow-xs"
                : "bg-surface text-muted hover:text-ink"
            }`}
          >
            <Warning size={13} className="shrink-0" weight="bold" />
            <span>Luar Radius</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setLocationSource("gps");
              resetSimulasi();
            }}
            className={`flex items-center justify-center gap-1 rounded-xl py-1.5 px-2 text-[10px] font-semibold transition-all cursor-pointer ${
              locationSource === "gps"
                ? "bg-accent text-ink shadow-xs"
                : "bg-surface text-muted hover:text-ink"
            }`}
          >
            <NavigationArrow size={13} className="shrink-0" weight="bold" />
            <span>GPS Nyata</span>
          </button>
        </div>
      </div>

      {/* Detail Kelas & Sesi */}
      <div>
        <div className="flex items-center justify-between">
          <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
            {sesi ? "Sesi Buka Hari Ini" : "Sesi Belum Dibuka"}
          </span>
          <span className="text-xs font-medium text-muted flex items-center gap-1">
            <Buildings size={14} /> {namaGedung}
          </span>
        </div>
        <h2 className="mt-1.5 text-xl font-bold text-ink">{namaMatkul}</h2>
        <p className="mt-0.5 text-sm text-muted">{namaDosen}</p>
      </div>

      <div className="space-y-2 text-sm text-muted bg-background/50 rounded-2xl p-3">
        <p className="flex items-center gap-2">
          <CalendarBlank size={18} className="text-primary" />
          <span>
            {jadwalHari}, {jadwalWaktu}
          </span>
        </p>
        <p className="flex items-center gap-2">
          <GraduationCap size={18} className="text-primary" />
          <span>
            {isDaring
              ? "Daring · One-click verification"
              : `Luring · Batas Radius ${radiusMeter} meter`}
          </span>
        </p>
      </div>

      {/* Alert Gagal / Di Luar Radius */}
      {state === "gagal" && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-danger/15 border border-danger/30 p-3.5 animate-fade-in">
          <XCircle size={22} className="shrink-0 text-danger-ink" weight="fill" />
          <div className="text-xs text-danger-ink flex-1">
            <p className="font-bold">Presensi Ditolak</p>
            <p className="mt-0.5 leading-relaxed">
              {errorMessage ||
                `Posisi GPS Anda berjarak ${jarak} m dari ${namaGedung} (radius maksimal ${radiusMeter} m). Silakan mendekat ke area kelas.`}
            </p>
          </div>
        </div>
      )}

      {/* Alert Sukses / Lolos Geofencing */}
      {state === "sukses" && (
        <div className="flex items-start gap-2.5 rounded-2xl bg-success/15 border border-success/30 p-3.5 animate-fade-in">
          <CheckCircle size={22} className="shrink-0 text-success-ink" weight="fill" />
          <div className="text-xs text-success-ink flex-1">
            <p className="font-bold">Kehadiran Berhasil Dicatat!</p>
            <p className="mt-0.5 leading-relaxed">
              {successMessage ||
                (isDaring
                  ? "Sesi perkuliahan daring berhasil diverifikasi."
                  : `Validasi geofencing lolos: posisi ${
                      jarak != null ? `${jarak} m` : "dalam jangkauan"
                    } dari ${namaGedung}. Data telah tersimpan di Supabase.`)}
            </p>
          </div>
        </div>
      )}

      {/* Tombol Aksi Utama */}
      <button
        type="button"
        onClick={handleAbsen}
        disabled={disabled}
        className={`flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-bold text-white transition-all cursor-pointer ${
          state === "sukses"
            ? "bg-success-ink shadow-xs"
            : state === "gagal"
            ? "bg-danger-ink shadow-xs"
            : !sesi
            ? "bg-muted cursor-not-allowed opacity-60"
            : "bg-primary hover:bg-primary-strong active:scale-[0.99] disabled:opacity-60 shadow-md"
        }`}
      >
        {state === "memeriksa" ? (
          <>
            <CircleNotch size={20} className="animate-spin" />
            <span>Memvalidasi Geofencing & GPS...</span>
          </>
        ) : state === "sukses" ? (
          <>
            <CheckCircle size={20} weight="fill" />
            <span>Kehadiran Sudah Dicatat</span>
          </>
        ) : state === "gagal" ? (
          <>
            <XCircle size={20} weight="fill" />
            <span>Ulangi Presensi</span>
          </>
        ) : !sesi ? (
          <span>Sesi Belum Dibuka Dosen/PJ</span>
        ) : (
          <>
            <MapPin size={20} />
            <span>Absen Sekarang!</span>
          </>
        )}
      </button>
    </section>
  );
}
