# SI-HADIR — Rencana Implementasi Teknis

Versi: Final V2 (dengan fitur Delegasi Akses PJ)

## 1. Pendekatan Arsitektur

- Single app **Next.js 14+ App Router** (TypeScript strict), **Tailwind CSS**, **Phosphor Icons** (`@phosphor-icons/react`), **Supabase** (`@supabase/supabase-js` + `@supabase/ssr`), deploy **Vercel**.
- **Single codebase, role-based routing**: satu aplikasi dengan middleware guard role yang redirect per peran ke dasbor masing-masing.
- **Supabase sebagai prototipe + Service Abstraction**: seluruh akses data lewat interface service (bukan query Supabase langsung di komponen) agar mudah beralih ke API SIUTER.

## 2. Keputusan Desain Penting

- Tabel publik `profiles` (bukan `users`) yang menaut ke `auth.users.id`.
- **Role enum**: `mahasiswa`, `dosen`, `kaprodi`, `baak`. Status **PJ bukan role**, melainkan relasi `jadwal_kelas.pj_id` yang menunjuk ke mahasiswa. PJ Pengganti direpresentasikan `sesi_perkuliahan.pj_pengganti_id` + tabel audit `delegasi_pj`.
- **Jadwal berulang (mingguan)**: `jadwal_kelas` menyimpan pola (hari + jam), `sesi_perkuliahan` adalah instance per pertemuan/tanggal.

## 3. Struktur Project

```
src/
  app/
    (auth)/login, auth/callback
    dashboard/mahasiswa, pj, dosen, kaprodi, baak
    api/attendance/...    # Server Actions / Route Handlers (Haversine)
  components/
  services/               # Abstraksi akses data (Supabase -> SIUTER)
  lib/                    # supabase client, haversine, utils
  types/                  # generated via Supabase CLI
supabase/
  migrations/             # SQL skema + RLS
  seed.sql
docs/
  IMPLEMENTATION_PLAN.md
```

## 4. Skema Database (Draft Final)

- `prodi`: id, nama_prodi, fakultas, kaprodi_id (nullable).
- `profiles`: id (FK auth.users), email, nama, role (enum), prodi_id, timestamps.
- `master_gedung`: id, nama_gedung, lat_pusat, long_pusat, radius_meter.
- `mata_kuliah`: id, kode_matkul, nama_matkul, sks, prodi_id, bobot_nilai_absen.
- `jadwal_kelas`: id, matkul_id, dosen_id, pj_id, gedung_id (nullable untuk daring), hari, waktu_mulai, waktu_selesai, kelas.
- `peserta_kelas`: id, jadwal_id, mahasiswa_id (enrollment untuk daftar kelas & delegasi).
- `sesi_perkuliahan`: id, jadwal_id, tanggal, status_dosen (enum), metode_kelas (enum `daring`/`luring`), timestamp_buka, timestamp_tutup, pj_pengganti_id (nullable), dilaporkan_oleh, created_at.
- `delegasi_pj`: id, jadwal_id, tanggal, pj_asal_id, pj_pengganti_id, alasan, created_at, unique(jadwal_id, tanggal).
- `presensi_mahasiswa`: id, sesi_id, mahasiswa_id, waktu_hadir, lat_mhs, long_mhs, jarak_meter, status, unique(sesi_id, mahasiswa_id).
- View `nilai_absensi`: agregat % kehadiran per mahasiswa per mata kuliah.

## 5. RLS (Ringkas)

- `profiles`: user baca/edit dirinya; BAAK baca semua.
- `jadwal_kelas` & `peserta_kelas`: mahasiswa baca jadwal/kelasnya; dosen baca jadwal yang diampu; BAAK kelola.
- `sesi_perkuliahan`: PJ/PJ Pengganti buat & update sesi jadwalnya; dosen bypass (update); mahasiswa baca sesi kelasnya.
- `delegasi_pj`: hanya PJ asal yang insert untuk jadwalnya.
- `presensi_mahasiswa`: mahasiswa insert untuk sesi kelasnya (validasi jarak di server action); update hanya dosen (koreksi).

## 6. Autentikasi & Peran

- Google SSO domain-terbatas (`@unsap.ac.id` + domain lain yang diizinkan) via Supabase Auth + trigger sinkronisasi `profiles`.
- Middleware membaca session Supabase, ambil `role`, redirect ke dasbor sesuai peran.
- Role disimpan di `profiles.role` (bukan claim JWT) agar mudah berubah tanpa re-login.

## 7. Service Abstraction (Siap Migrasi SIUTER)

- Interface: `ProfileService`, `JadwalService`, `SesiService`, `PresensiService`, `LaporanService`.
- Implementasi `SupabaseXxxService` untuk prototipe; `SiuterXxxService` dipasang via env `DATA_PROVIDER`.

## 8. Geofencing (Luring)

- Client kirim `lat/long` mentah ke Server Action/Route Handler.
- Server ambil `master_gedung.radius_meter`, hitung **Haversine**, tolak jika di luar 50–80m.
- Deteksi dasar Mock Location (accuracy buruk/altitude tidak wajar/kecepatan) sebagai heuristik.
- `lat_mhs`, `long_mhs`, `jarak_meter` disimpan hanya setelah validasi server lolos.

## 9. Modul & Rute

- `/dashboard/mahasiswa`: jadwal, rekam presensi (luring geofencing / daring one-click lock), notifikasi delegasi.
- `/dashboard/pj`: form laporan cepat (metode + status dosen, trigger buka sesi), lock tunggakan (Force Action), menu Delegasi Tugas.
- `/dashboard/dosen`: nilai absensi otomatis, bypass darurat, koreksi presensi, EWS.
- `/dashboard/kaprodi`: indikator aktivitas kelas, EWS mahasiswa Tindak Lanjut.
- `/dashboard/baak`: master gedung, jadwal, radius lokasi.

## 10. Urutan Implementasi (Fase)

1. **Fondasi** — scaffold Next.js + Tailwind + Supabase local, env, `supabase init`, skema SQL + RLS + seed, generate types, setup Phosphor.
2. **Auth & Role** — Google SSO domain-terbatas, trigger profiles, middleware guard, skeleton dasbor per role.
3. **Service Abstraction** — interface + implementasi Supabase, seed data.
4. **Modul PJ** — form laporan + trigger buka sesi, Force Action tunggakan, Delegasi Tugas + PJ Pengganti.
5. **Modul Presensi** — Server Action Haversine luring + one-click lock daring, deteksi mock dasar.
6. **Dasbor Dosen & EWS** — nilai absensi otomatis, bypass, koreksi, peringatan Tindak Lanjut <75%.
7. **Kaprodi & BAAK** — indikator kelas, master data.
8. **Polish & Deploy** — styling sesuai Figma, validasi, deploy Vercel.

## 11. Input yang Dibutuhkan

- URL + anon key + service role key Supabase.
- Google Cloud OAuth Client ID/Secret + daftar domain yang diizinkan.
- Data master awal (prodi, gedung + koordinat/radius, matkul, jadwal, kelas) — atau seed contoh.
