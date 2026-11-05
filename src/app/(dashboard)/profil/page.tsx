"use client";

import Image from "next/image";
import {
  EnvelopeSimple,
  GraduationCap,
  IdentificationBadge,
  SignOut,
  UserSwitch,
  ShieldCheck,
} from "@phosphor-icons/react";
import { useDemo, DEMO_USERS, type DemoRole } from "@/lib/demo-context";

export default function ProfilPage() {
  const { currentUser, logout, loginAs } = useDemo();

  const info = [
    {
      icon: IdentificationBadge,
      label: currentUser.role === "dosen" || currentUser.role === "kaprodi" ? "NIDN" : currentUser.role === "baak" ? "NIP" : "NIM",
      value: currentUser.identitas,
    },
    {
      icon: EnvelopeSimple,
      label: "Email Kampus",
      value: currentUser.email,
    },
    {
      icon: GraduationCap,
      label: "Program Studi / Unit",
      value: currentUser.prodi || "Teknik Informatika",
    },
    {
      icon: ShieldCheck,
      label: "Status Autentikasi",
      value: "Terverifikasi (Google Workspace UNSAP)",
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-ink">Profil</h1>

      {/* Profil Card */}
      <section className="flex flex-col items-center rounded-3xl bg-surface p-6 shadow-sm border border-line">
        <div className="relative">
          <Image
            src={currentUser.avatar}
            alt="Foto profil"
            width={96}
            height={96}
            className="h-24 w-24 rounded-full object-cover border-4 border-primary/20 shadow-xs"
          />
          <span className="absolute bottom-0 right-0 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-white shadow-xs capitalize">
            {currentUser.role}
          </span>
        </div>
        <h2 className="mt-3 text-xl font-bold text-ink text-center">{currentUser.nama}</h2>
        <p className="mt-0.5 text-xs text-primary font-semibold">{currentUser.roleLabel}</p>
      </section>

      {/* Informasi Detail */}
      <section className="rounded-3xl bg-surface p-2 shadow-sm border border-line divide-y divide-line/60">
        {info.map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-4 px-4 py-3.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Icon size={20} />
            </span>
            <div className="flex-1 overflow-hidden">
              <p className="text-xs text-faint">{label}</p>
              <p className="font-semibold text-ink text-sm truncate">{value}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Demo Switcher Quick Menu */}
      <section className="rounded-3xl border border-dashed border-primary/30 bg-primary/5 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <UserSwitch size={18} className="text-primary" />
          <h3 className="text-xs font-bold text-ink">Ganti Akun Demo Instan</h3>
        </div>
        <p className="text-[11px] text-muted">
          Pilih persona lain untuk melihat hak akses dan dasbor masing-masing peran:
        </p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(DEMO_USERS) as DemoRole[]).map((role) => {
            const user = DEMO_USERS[role];
            const isCurrent = currentUser.role === role;
            return (
              <button
                key={role}
                type="button"
                onClick={() => loginAs(role)}
                className={`rounded-xl py-2 px-2.5 text-xs font-semibold text-left transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-primary text-white shadow-xs"
                    : "bg-surface text-ink border border-line hover:border-primary/40"
                }`}
              >
                <p className="truncate text-[11px] capitalize">{role === "pj" ? "PJ Kelas" : role}</p>
                <p className="text-[9px] opacity-75 truncate">{user.nama.split(" ")[0]}</p>
              </button>
            );
          })}
        </div>
      </section>

      {/* Tombol Keluar */}
      <button
        type="button"
        onClick={logout}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-danger py-3.5 font-bold text-sm text-danger-ink transition-transform active:scale-[0.99] hover:bg-danger/80 cursor-pointer"
      >
        <SignOut size={20} />
        Keluar Akun
      </button>
    </div>
  );
}
