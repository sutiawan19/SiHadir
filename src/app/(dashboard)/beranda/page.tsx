"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  BellSimple,
  CalendarBlank,
  ClockCounterClockwise,
  GraduationCap,
  MapPin,
  CheckCircle,
  X,
  Buildings,
  ArrowRight,
  CaretRight,
  CircleNotch,
} from "@phosphor-icons/react";
import { StatusBadge } from "@/components/StatusBadge";
import { aksesCepat } from "@/lib/mock";
import { useDemo } from "@/lib/demo-context";
import { getBerandaDataAction } from "@/app/actions/attendance";
import { formatHari, formatJam, formatTanggalIndo } from "@/lib/format";
import type { PresensiRecord } from "@/services/types";

export default function BerandaPage() {
  const { currentUser } = useDemo();
  const [isPending, startTransition] = useTransition();

  const [berandaData, setBerandaData] = useState<{
    profile: any;
    kelasBerikutnya: any;
    sesiHariIni: any;
    sudahAbsenHariIni: boolean;
    riwayat: PresensiRecord[];
    delegasiNotification: { aktif: boolean; pesan: string } | null;
  } | null>(null);

  const [selectedRiwayat, setSelectedRiwayat] = useState<PresensiRecord | null>(null);
  const [modalAkses, setModalAkses] = useState<string | null>(null);

  useEffect(() => {
    startTransition(async () => {
      try {
        const res = await getBerandaDataAction(currentUser.id);
        setBerandaData(res);
      } catch (err) {
        console.error("Gagal memuat data beranda:", err);
      }
    });
  }, [currentUser.id]);

  const profileNama = berandaData?.profile?.nama || currentUser.nama;
  const firstName = profileNama.split(" ")[0];
  const kelas = berandaData?.kelasBerikutnya;
  const sesi = berandaData?.sesiHariIni;
  const sudahAbsen = berandaData?.sudahAbsenHariIni ?? false;
  const riwayatList = berandaData?.riwayat || [];
  const delegasi = berandaData?.delegasiNotification;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-muted">Halo, {firstName}!</p>
            {isPending && (
              <CircleNotch size={14} className="animate-spin text-primary" />
            )}
          </div>
          <h1 className="mt-1 text-2xl font-bold leading-tight text-ink">
            Semangat ya
            <br />
            belajarnya
          </h1>
        </div>
        <div className="relative">
          <Image
            src={currentUser.avatar}
            alt="Foto profil"
            width={56}
            height={56}
            className="h-14 w-14 rounded-full object-cover border-2 border-primary/20 shadow-xs"
          />
          {currentUser.role === "pj" && (
            <span className="absolute -bottom-1 -right-1 rounded-full bg-accent px-1.5 py-0.2 text-[9px] font-bold text-ink shadow-xs">
              PJ
            </span>
          )}
        </div>
      </header>

      {/* Pemberitahuan Delegasi PJ */}
      {delegasi?.aktif && (
        <Link
          href="/pj"
          className="flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 transition-all hover:bg-primary/15 active:scale-[0.99] group"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-white">
            <BellSimple size={20} weight="fill" />
          </span>
          <div className="text-sm flex-1">
            <div className="flex items-center justify-between">
              <p className="font-bold text-ink">Pemberitahuan Tugas PJ</p>
              <span className="flex items-center gap-1 text-xs font-semibold text-primary group-hover:translate-x-0.5 transition-transform">
                <span>Buka Tugas</span>
                <ArrowRight size={13} />
              </span>
            </div>
            <p className="text-muted mt-0.5">{delegasi.pesan}</p>
          </div>
        </Link>
      )}

      {/* Kartu Kelas Hari Ini / Berikutnya */}
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#468b92] to-[#e5b336] p-4 shadow-sm">
        <div className="flex items-stretch gap-3">
          <div className="flex-1 rounded-2xl bg-surface p-4">
            <div className="flex items-center justify-between">
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                {sesi ? "Sesi Aktif Hari Ini" : "Jadwal Perkuliahan"}
              </span>
              <span className="text-[11px] font-medium text-accent">
                {kelas?.gedung?.nama_gedung || "Gedung A"}
              </span>
            </div>
            <h2 className="mt-2 text-lg font-bold text-ink">
              {kelas?.matkul?.nama_matkul || "Sistem Enterprise"}
            </h2>
            <p className="mt-0.5 text-xs text-muted">
              {kelas?.dosen?.nama || "Agun Guntara, S.Kom., M.Kom"}
            </p>

            <div className="mt-3 space-y-1.5 text-xs text-muted">
              <p className="flex items-center gap-2">
                <CalendarBlank size={16} className="text-primary" />
                <span>
                  {kelas
                    ? `${formatHari(kelas.hari)}, ${formatJam(kelas.waktu_mulai)} - ${formatJam(kelas.waktu_selesai)} WIB`
                    : "Rabu, 08.00 - 10.00 WIB"}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <GraduationCap size={16} className="text-primary" />
                <span>
                  {sesi?.metode_kelas === "daring"
                    ? "Daring (One-Click)"
                    : `Luring (Radius ${kelas?.gedung?.radius_meter || 60}m)`}
                </span>
              </p>
            </div>

            <div className="my-3.5 h-px bg-line" />

            {sudahAbsen ? (
              <div className="flex items-center justify-center gap-2 rounded-full bg-success/15 border border-success/30 py-2.5 text-center text-xs font-bold text-success-ink">
                <CheckCircle size={16} weight="fill" />
                <span>Sudah Presensi Hari Ini</span>
              </div>
            ) : (
              <Link
                href="/kehadiran"
                className="block rounded-full bg-primary py-2.5 text-center text-xs font-bold text-white shadow-xs transition-colors hover:bg-primary-strong active:scale-[0.98]"
              >
                Absen Sekarang!
              </Link>
            )}
          </div>

          <div className="relative w-24 shrink-0 flex items-center justify-center">
            <Image
              src="/beranda-hero.png"
              alt="Ilustrasi dosen"
              width={129}
              height={197}
              className="h-full w-full object-contain drop-shadow-md"
            />
          </div>
        </div>
      </section>

      {/* Riwayat Kehadiran (Real dari Supabase) */}
      <section>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-ink">Riwayat Kehadiran</h2>
          <Link href="/kehadiran" className="text-xs font-semibold text-primary hover:underline">
            Lihat Semua
          </Link>
        </div>
        <div className="mt-3 space-y-3">
          {riwayatList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-6 text-center text-xs text-muted">
              Belum ada riwayat kehadiran tercatat.
            </div>
          ) : (
            riwayatList.slice(0, 3).map((item) => {
              const matkulKode = item.sesi?.jadwal?.matkul?.kode_matkul || "TI-301";
              const matkulNama = item.sesi?.jadwal?.matkul?.nama_matkul || "Sistem Enterprise";
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedRiwayat(item)}
                  className="w-full text-left rounded-2xl bg-surface p-4 shadow-sm border border-transparent hover:border-primary/20 transition-all active:scale-[0.99] cursor-pointer"
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
                  <p className="mt-2 flex items-center gap-1.5 text-xs text-muted">
                    <ClockCounterClockwise size={14} />
                    {formatTanggalIndo(item.waktu_hadir)}
                    <span className="flex items-center gap-0.5 text-primary font-medium ml-auto">
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

      {/* Akses Cepat */}
      <section>
        <h2 className="text-lg font-bold text-ink">Akses Cepat</h2>
        <div className="mt-3 space-y-3">
          {aksesCepat.map((akses) => (
            <button
              key={akses.label}
              type="button"
              onClick={() => setModalAkses(akses.label)}
              className="w-full flex items-center gap-3 rounded-2xl bg-surface p-4 shadow-sm hover:border-primary/30 border border-transparent transition-all active:scale-[0.99] cursor-pointer"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-[10px] font-extrabold text-ink">
                UNSAP
              </span>
              <span className="flex-1 font-semibold text-left text-ink text-sm">
                {akses.label}
              </span>
              <ArrowUpRight size={20} className="text-primary" />
            </button>
          ))}
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

      {/* Modal Simulasi Akses Cepat */}
      {modalAkses && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl text-center animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-accent/20 text-ink">
              <CheckCircle size={32} className="text-accent" weight="fill" />
            </div>
            <h3 className="mt-3 text-lg font-bold text-ink">{modalAkses}</h3>
            <p className="mt-2 text-xs text-muted leading-relaxed">
              Tautan Single Sign-On ke sistem {modalAkses}. Akun Google UNSAP Anda otomatis terhubung tanpa perlu login ulang.
            </p>
            <button
              type="button"
              onClick={() => setModalAkses(null)}
              className="mt-5 w-full rounded-full bg-primary py-2.5 text-xs font-semibold text-white cursor-pointer"
            >
              Kembali ke SI-HADIR
            </button>
          </div>
        </div>
      )}
    </div>
  );
}