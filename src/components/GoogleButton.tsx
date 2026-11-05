"use client";

import { useState } from "react";
import {
  Student,
  ChalkboardTeacher,
  Buildings,
  GraduationCap,
  ClipboardText,
  X,
  CircleNotch,
} from "@phosphor-icons/react";
import { useDemo, DEMO_USERS, type DemoRole } from "@/lib/demo-context";

function GoogleLogo() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden="true" className="shrink-0">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const ROLE_ICONS: Record<DemoRole, typeof Student> = {
  mahasiswa: Student,
  pj: ClipboardText,
  dosen: ChalkboardTeacher,
  kaprodi: GraduationCap,
  baak: Buildings,
};

export function GoogleButton() {
  const { loginAs } = useDemo();
  const [showModal, setShowModal] = useState(false);
  const [loadingRole, setLoadingRole] = useState<DemoRole | null>(null);

  const handleSelect = (role: DemoRole) => {
    setLoadingRole(role);
    setTimeout(() => {
      loginAs(role);
    }, 600);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setShowModal(true)}
        className="flex w-full items-center gap-4 rounded-2xl bg-surface px-6 py-5 text-left shadow-[0_10px_30px_rgba(0,0,0,0.08)] transition-all hover:shadow-[0_14px_35px_rgba(0,0,0,0.12)] active:scale-[0.99] cursor-pointer"
      >
        <GoogleLogo />
        <span className="flex flex-col">
          <span className="text-lg font-semibold text-ink">Google</span>
          <span className="text-sm text-muted">
            @unsap.ac.id / @student.unsap.ac.id
          </span>
        </span>
      </button>

      {/* Google SSO Account Chooser Dialog */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <GoogleLogo />
                <div>
                  <h3 className="text-base font-bold text-ink">Pilih Akun UNSAP</h3>
                  <p className="text-xs text-muted">untuk melanjutkan ke SI-HADIR</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted hover:text-ink cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="mt-5 space-y-2 max-h-[380px] overflow-y-auto">
              {(Object.keys(DEMO_USERS) as DemoRole[]).map((role) => {
                const user = DEMO_USERS[role];
                const Icon = ROLE_ICONS[role];
                const isLoading = loadingRole === role;

                return (
                  <button
                    key={role}
                    type="button"
                    disabled={loadingRole !== null}
                    onClick={() => handleSelect(role)}
                    className="flex w-full items-center justify-between rounded-2xl border border-line p-3 text-left transition-colors hover:border-primary/50 hover:bg-background active:scale-[0.99] disabled:opacity-50 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon size={20} />
                      </div>
                      <div className="overflow-hidden">
                        <p className="truncate text-sm font-semibold text-ink">
                          {user.nama}
                        </p>
                        <p className="truncate text-xs text-muted">{user.email}</p>
                        <span className="inline-block mt-0.5 rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-ink">
                          {user.roleLabel}
                        </span>
                      </div>
                    </div>
                    {isLoading && (
                      <CircleNotch size={18} className="animate-spin text-primary shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 border-t border-line pt-3 text-center">
              <p className="text-[11px] text-faint">
                Akun terverifikasi oleh Sistem Single Sign-On (SSO) UNSAP
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
