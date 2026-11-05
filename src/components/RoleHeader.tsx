"use client";

import { SignOut } from "@phosphor-icons/react";
import { useDemo } from "@/lib/demo-context";

function initials(name: string) {
  const parts = name.split(/[\s,]+/).filter(Boolean);
  const clean = parts.filter((p) => p.length > 1 && !p.includes("."));
  const letters = clean
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
  return letters || "SI";
}

export function RoleHeader({
  nama,
  role,
}: {
  nama: string;
  role: string;
}) {
  const { logout } = useDemo();

  return (
    <header className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold text-primary uppercase tracking-wider">{role}</p>
        <h1 className="mt-0.5 text-2xl font-bold text-ink">{nama}</h1>
      </div>
      <div className="flex items-center gap-2">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-base font-bold text-white shadow-xs"
          title={nama}
        >
          {initials(nama)}
        </div>
        <button
          type="button"
          onClick={logout}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-danger/10 text-danger-ink hover:bg-danger/20 transition-colors cursor-pointer"
          title="Keluar / Ganti Akun"
        >
          <SignOut size={18} />
        </button>
      </div>
    </header>
  );
}
