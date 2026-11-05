import type { Metadata } from "next";
import { type ReactNode, Suspense } from "react";
import { Figtree, Inter } from "next/font/google";
import "./globals.css";
import { DemoProvider } from "@/lib/demo-context";
import { DemoSwitcher } from "@/components/DemoSwitcher";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SI-HADIR",
  description: "Sistem Informasi Kehadiran Mahasiswa",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="id"
      className={`${figtree.variable} ${inter.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full">
        <Suspense fallback={null}>
          <DemoProvider>
            {children}
            <DemoSwitcher />
          </DemoProvider>
        </Suspense>
      </body>
    </html>
  );
}
