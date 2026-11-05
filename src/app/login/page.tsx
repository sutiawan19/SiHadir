"use client";

import { useState } from "react";
import Image from "next/image";
import { GoogleButton } from "@/components/GoogleButton";
import {
  ChatCircleDots,
  EnvelopeSimple,
  MapPin,
  Clock,
  X,
  ArrowRight,
} from "@phosphor-icons/react";

export default function LoginPage() {
  const [showBaakHelp, setShowBaakHelp] = useState(false);

  return (
    <div className="relative min-h-dvh w-full overflow-hidden bg-gradient-to-b from-[#468b92] to-[#e5b336]">
      <div className="pointer-events-none absolute -bottom-32 left-1/2 h-[440px] w-[440px] -translate-x-1/2 rounded-full bg-[#e5b336]" />

      <div className="relative z-10 mx-auto flex min-h-dvh w-full max-w-md flex-col px-6">
        <div className="pt-20">
          <p className="text-base font-medium text-white/90">
            Selamat datang kembali!
          </p>
          <h1 className="mt-3 text-[44px] font-light leading-[1.06] tracking-tight text-white">
            Silahkan Masuk Dengan Akun UNSAP Kamu
          </h1>
        </div>

        <div className="mt-20">
          <GoogleButton />
          <p className="mt-4 text-sm text-white">
            Terkendala?{" "}
            <button
              type="button"
              onClick={() => setShowBaakHelp(true)}
              className="font-semibold underline underline-offset-2 hover:text-white/80 cursor-pointer"
            >
              Hubungi BAAK
            </button>
          </p>
        </div>

        <div className="mt-auto flex justify-center pb-4">
          <Image
            src="/login-hero.png"
            alt="Ilustrasi mahasiswi UNSAP"
            width={207}
            height={310}
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* BAAK Helpdesk Modal */}
      {showBaakHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div
            className="w-full max-w-sm rounded-3xl bg-surface p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="text-base font-bold text-ink">Bantuan BAAK UNSAP</h3>
              <button
                type="button"
                onClick={() => setShowBaakHelp(false)}
                className="flex h-7 w-7 items-center justify-center rounded-full bg-background text-muted hover:text-ink cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <p className="mt-3 text-xs text-muted leading-relaxed">
              Jika mengalami kendala login akun Google Kampus UNSAP atau sinkronisasi data NIM/NIDN, hubungi layanan akademik:
            </p>

            <div className="mt-4 space-y-3">
              <div className="flex items-start gap-3 rounded-2xl bg-background p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MapPin size={18} />
                </span>
                <div className="text-xs">
                  <p className="font-semibold text-ink">Lokasi Layanan</p>
                  <p className="text-muted">Gedung Rektorat Lt. 1, Ruang BAAK Kampus Pusat UNSAP</p>
                </div>
              </div>

              <div className="flex items-start gap-3 rounded-2xl bg-background p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Clock size={18} />
                </span>
                <div className="text-xs">
                  <p className="font-semibold text-ink">Jam Operasional</p>
                  <p className="text-muted">Senin - Jumat (08.00 - 15.30 WIB)</p>
                </div>
              </div>

              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between rounded-2xl border border-primary/20 bg-primary/5 p-3 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <ChatCircleDots size={20} />
                  <span>Layanan WhatsApp BAAK</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>Chat</span>
                  <ArrowRight size={13} />
                </div>
              </a>

              <div className="flex items-center gap-2.5 rounded-2xl bg-background p-3 text-xs text-muted">
                <EnvelopeSimple size={18} className="text-primary shrink-0" />
                <span>baak@unsap.ac.id</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowBaakHelp(false)}
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
