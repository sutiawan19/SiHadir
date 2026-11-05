"use client";

import { useState } from "react";
import {
  UserSwitch,
  X,
  CheckCircle,
  Student,
  ChalkboardTeacher,
  Buildings,
  GraduationCap,
  ClipboardText,
  SignOut,
  EyeSlash,
  ArrowRight,
} from "@phosphor-icons/react";
import { useDemo, DEMO_USERS, type DemoRole } from "@/lib/demo-context";

const ROLE_ICONS: Record<DemoRole, typeof Student> = {
  mahasiswa: Student,
  pj: ClipboardText,
  dosen: ChalkboardTeacher,
  kaprodi: GraduationCap,
  baak: Buildings,
};

export function DemoSwitcher() {
  const { currentUser, loginAs, logout } = useDemo();
  const [isOpen, setIsOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);

  // If on login page, we can hide the floating switcher or show it gently
  if (isHidden) {
    return (
      <button
        type="button"
        onClick={() => setIsHidden(false)}
        className="fixed bottom-3 right-3 z-50 flex h-8 w-8 items-center justify-center rounded-full bg-ink/80 text-white shadow-lg backdrop-blur hover:bg-ink"
        title="Buka Demo Switcher"
      >
        <UserSwitch size={16} />
      </button>
    );
  }

  const ActiveIcon = ROLE_ICONS[currentUser.role] || Student;

  return (
    <>
      {/* Floating Demo Trigger Pill */}
      <div className="fixed top-3 right-3 z-40 max-w-[calc(100vw-24px)]">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 rounded-full border border-primary/20 bg-surface/90 px-3 py-1.5 text-xs font-semibold text-ink shadow-[0_4px_16px_rgba(0,0,0,0.12)] backdrop-blur-md transition-all hover:bg-surface active:scale-95"
        >
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-ink">
            <ActiveIcon size={12} weight="bold" />
          </span>
          <span className="hidden sm:inline text-muted font-normal">Demo:</span>
          <span className="text-primary font-bold capitalize">
            {currentUser.role === "pj" ? "PJ Kelas" : currentUser.role}
          </span>
          <span className="ml-0.5 rounded-full bg-primary/10 px-1.5 py-0.2 text-[10px] text-primary">
            Ganti
          </span>
        </button>
      </div>

      {/* Demo Persona Modal / Bottom Sheet */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4 backdrop-blur-xs transition-opacity animate-fade-in">
          <div
            className="w-full max-w-md rounded-t-3xl sm:rounded-3xl bg-surface p-5 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="inline-block rounded-md bg-accent/20 px-2 py-0.5 text-[10px] font-bold tracking-wider text-accent uppercase">
                  Demo Interactive Mode
                </span>
                <h3 className="text-lg font-bold text-ink">Pilih Persona Pengguna</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-background text-muted hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>

            <p className="mt-2 text-xs text-muted">
              Pilih peran di bawah ini untuk mensimulasikan alur dan antarmuka peran tersebut secara instan.
            </p>

            <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {(Object.keys(DEMO_USERS) as DemoRole[]).map((role) => {
                const user = DEMO_USERS[role];
                const Icon = ROLE_ICONS[role];
                const isCurrent = currentUser.role === role;

                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => {
                      loginAs(role);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left transition-all ${
                      isCurrent
                        ? "border-primary bg-primary/5 shadow-xs"
                        : "border-line bg-surface hover:border-primary/40 hover:bg-background"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${
                          isCurrent
                            ? "bg-primary text-white"
                            : "bg-background text-primary"
                        }`}
                      >
                        <Icon size={22} weight={isCurrent ? "fill" : "regular"} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold text-ink text-sm leading-tight">
                            {user.nama}
                          </p>
                          {isCurrent && (
                            <span className="rounded-full bg-primary px-2 py-0.5 text-[9px] font-bold text-white">
                              Aktif
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-primary font-medium mt-0.5">
                          {user.roleLabel}
                        </p>
                        <p className="text-[11px] text-faint mt-0.5">
                          {user.identitas} · {user.email}
                        </p>
                      </div>
                    </div>
                    {isCurrent ? (
                      <CheckCircle size={22} className="text-primary shrink-0" weight="fill" />
                    ) : (
                      <span className="flex items-center gap-1 text-xs font-semibold text-primary shrink-0">
                        Buka
                        <ArrowRight size={14} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-line pt-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex items-center gap-1.5 font-semibold text-danger-ink hover:underline"
              >
                <SignOut size={16} />
                Ke Halaman Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsHidden(true);
                  setIsOpen(false);
                }}
                className="flex items-center gap-1 text-muted hover:text-ink"
              >
                <EyeSlash size={14} />
                Sembunyikan Pill
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
