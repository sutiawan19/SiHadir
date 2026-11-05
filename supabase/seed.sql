-- =============================================================
-- SI-HADIR — Seed Data Master (Prototipe)
-- Catatan: profiles/jadwal/peserta dibuat lewat SSO + dasbor BAAK,
-- karena profiles menaut ke auth.users yang dibuat oleh Supabase Auth.
-- =============================================================

-- -------------------------------------------------------------
-- Program Studi
-- -------------------------------------------------------------
insert into public.prodi (id, nama_prodi, fakultas) values
  ('00000000-0000-0000-0000-000000000001', 'Teknik Informatika', 'Fakultas Teknik'),
  ('00000000-0000-0000-0000-000000000002', 'Sistem Informasi',   'Fakultas Teknik'),
  ('00000000-0000-0000-0000-000000000003', 'Manajemen',          'Fakultas Ekonomi dan Bisnis')
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Gedung (koordinat contoh area kampus, sesuaikan saat live)
-- -------------------------------------------------------------
insert into public.master_gedung (id, nama_gedung, lat_pusat, long_pusat, radius_meter) values
  ('00000000-0000-0000-0000-000000000011', 'Gedung A', -6.858600, 107.916200, 60),
  ('00000000-0000-0000-0000-000000000012', 'Gedung B', -6.858800, 107.916500, 60),
  ('00000000-0000-0000-0000-000000000013', 'Gedung C', -6.858400, 107.915900, 80)
on conflict (id) do nothing;

-- -------------------------------------------------------------
-- Mata Kuliah
-- -------------------------------------------------------------
insert into public.mata_kuliah (id, kode_matkul, nama_matkul, sks, prodi_id, bobot_nilai_absen) values
  ('00000000-0000-0000-0000-000000000021', 'TI-101', 'Algoritma dan Pemrograman', 3, '00000000-0000-0000-0000-000000000001', 10.00),
  ('00000000-0000-0000-0000-000000000022', 'TI-102', 'Basis Data',                 3, '00000000-0000-0000-0000-000000000001', 10.00),
  ('00000000-0000-0000-0000-000000000023', 'SI-101', 'Analisis Sistem Informasi',  3, '00000000-0000-0000-0000-000000000002', 15.00)
on conflict (id) do nothing;
