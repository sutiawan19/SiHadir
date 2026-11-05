# SiHadir

**SI-HADIR** — Sistem Informasi Kehadiran Mahasiswa Universitas Sebelas April (UNSAP).

Sistem presensi perkuliahan mobile-first dengan verifikasi Geofencing (GPS Haversine), integrasi Google Workspace SSO UNSAP, pembagian hak akses 5 peran (Mahasiswa, PJ Kelas, Dosen, Kaprodi, BAAK), dan fitur Delegasi PJ Mandiri.

## Tech Stack
- **Framework**: Next.js 16+ (App Router, Turbopack)
- **Language**: TypeScript Strict
- **Styling**: Tailwind CSS v4
- **Icons**: Phosphor Icons (`@phosphor-icons/react`)
- **Backend / DB**: Supabase (PostgreSQL + RLS + Functions)

## Menjalankan Aplikasi
```bash
npm install
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.
