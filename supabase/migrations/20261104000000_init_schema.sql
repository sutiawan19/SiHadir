-- =============================================================
-- SI-HADIR — Skema Dasar Supabase (Prototipe)
-- Migrasi 0001: enum, tabel, trigger, RLS, view
-- =============================================================

create extension if not exists pgcrypto;

-- -------------------------------------------------------------
-- 1. Enum
-- -------------------------------------------------------------
do $$ begin
  create type public.user_role as enum ('mahasiswa', 'dosen', 'kaprodi', 'baak');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.metode_kelas as enum ('daring', 'luring');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.status_dosen as enum ('hadir', 'terlambat', 'izin', 'sakit', 'tidak_hadir');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.status_presensi as enum ('hadir', 'terlambat', 'izin', 'sakit', 'alpha');
exception when duplicate_object then null;
end $$;

-- -------------------------------------------------------------
-- 2. Tabel: prodi
-- -------------------------------------------------------------
create table if not exists public.prodi (
  id          uuid primary key default gen_random_uuid(),
  nama_prodi  text not null,
  fakultas    text,
  created_at  timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 3. Tabel: profiles (menaut ke auth.users)
-- -------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  nama        text not null,
  role        public.user_role not null default 'mahasiswa',
  prodi_id    uuid references public.prodi(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Kolom relasi kaprodi ke profiles
alter table public.prodi
  add column if not exists kaprodi_id uuid references public.profiles(id) on delete set null;

-- -------------------------------------------------------------
-- 4. Helper role check (Dibuat SETELAH tabel profiles ada)
-- -------------------------------------------------------------
create or replace function public.has_role(r public.user_role)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = r
  );
end;
$$;

-- -------------------------------------------------------------
-- 5. Tabel: master_gedung
-- -------------------------------------------------------------
create table if not exists public.master_gedung (
  id            uuid primary key default gen_random_uuid(),
  nama_gedung   text not null,
  lat_pusat     double precision not null,
  long_pusat    double precision not null,
  radius_meter  integer not null default 60,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 6. Tabel: mata_kuliah
-- -------------------------------------------------------------
create table if not exists public.mata_kuliah (
  id                 uuid primary key default gen_random_uuid(),
  kode_matkul        text not null unique,
  nama_matkul        text not null,
  sks                smallint not null default 2,
  prodi_id           uuid references public.prodi(id) on delete set null,
  bobot_nilai_absen  numeric(5,2) not null default 0,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 7. Tabel: jadwal_kelas
-- hari: 0=Senin, 1=Selasa, 2=Rabu, 3=Kamis, 4=Jumat, 5=Sabtu, 6=Minggu
-- -------------------------------------------------------------
create table if not exists public.jadwal_kelas (
  id            uuid primary key default gen_random_uuid(),
  matkul_id     uuid not null references public.mata_kuliah(id) on delete cascade,
  dosen_id      uuid not null references public.profiles(id) on delete cascade,
  pj_id         uuid references public.profiles(id) on delete set null,
  gedung_id     uuid references public.master_gedung(id) on delete set null,
  kelas         text not null,
  hari          smallint not null,
  waktu_mulai   time not null,
  waktu_selesai time not null,
  created_at    timestamptz not null default now()
);

-- -------------------------------------------------------------
-- 8. Tabel: peserta_kelas (enrollment mahasiswa per jadwal)
-- -------------------------------------------------------------
create table if not exists public.peserta_kelas (
  id            uuid primary key default gen_random_uuid(),
  jadwal_id     uuid not null references public.jadwal_kelas(id) on delete cascade,
  mahasiswa_id  uuid not null references public.profiles(id) on delete cascade,
  created_at    timestamptz not null default now(),
  unique (jadwal_id, mahasiswa_id)
);

-- -------------------------------------------------------------
-- 9. Tabel: delegasi_pj (handover mandiri, berlaku 1 pertemuan)
-- -------------------------------------------------------------
create table if not exists public.delegasi_pj (
  id              uuid primary key default gen_random_uuid(),
  jadwal_id       uuid not null references public.jadwal_kelas(id) on delete cascade,
  tanggal         date not null,
  pj_asal_id      uuid not null references public.profiles(id) on delete cascade,
  pj_pengganti_id uuid not null references public.profiles(id) on delete cascade,
  alasan          text,
  created_at      timestamptz not null default now(),
  unique (jadwal_id, tanggal)
);

-- -------------------------------------------------------------
-- 10. Tabel: sesi_perkuliahan (instance pertemuan per tanggal)
-- -------------------------------------------------------------
create table if not exists public.sesi_perkuliahan (
  id              uuid primary key default gen_random_uuid(),
  jadwal_id       uuid not null references public.jadwal_kelas(id) on delete cascade,
  tanggal         date not null,
  status_dosen    public.status_dosen,
  metode_kelas    public.metode_kelas not null default 'luring',
  timestamp_buka  timestamptz,
  timestamp_tutup timestamptz,
  pj_pengganti_id uuid references public.profiles(id) on delete set null,
  dilaporkan_oleh uuid references public.profiles(id) on delete set null,
  created_at      timestamptz not null default now(),
  unique (jadwal_id, tanggal)
);

-- -------------------------------------------------------------
-- 11. Tabel: presensi_mahasiswa
-- -------------------------------------------------------------
create table if not exists public.presensi_mahasiswa (
  id            uuid primary key default gen_random_uuid(),
  sesi_id       uuid not null references public.sesi_perkuliahan(id) on delete cascade,
  mahasiswa_id  uuid not null references public.profiles(id) on delete cascade,
  waktu_hadir   timestamptz not null default now(),
  lat_mhs       double precision,
  long_mhs      double precision,
  jarak_meter   numeric(10,2),
  status        public.status_presensi not null default 'hadir',
  created_at    timestamptz not null default now(),
  unique (sesi_id, mahasiswa_id)
);

-- -------------------------------------------------------------
-- 12. View: agregat nilai kehadiran per mahasiswa per mata kuliah
-- -------------------------------------------------------------
create or replace view public.nilai_absensi as
select
  pk.mahasiswa_id,
  j.matkul_id,
  count(pm.id)                              as total_hadir,
  count(s.id)                               as total_sesi,
  case
    when count(s.id) = 0 then 0
    else round((100.0 * count(pm.id)) / count(s.id), 2)
  end                                       as persentase_kehadiran
from public.peserta_kelas pk
join public.jadwal_kelas j on j.id = pk.jadwal_id
left join public.sesi_perkuliahan s on s.jadwal_id = j.id
left join public.presensi_mahasiswa pm
  on pm.sesi_id = s.id
  and pm.mahasiswa_id = pk.mahasiswa_id
  and pm.status in ('hadir', 'terlambat')
group by pk.mahasiswa_id, j.matkul_id;

-- -------------------------------------------------------------
-- 13. Trigger: sinkronisasi profiles saat user baru dibuat
-- -------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, nama, role)
  values (
    new.id,
    new.email,
    coalesce(
      new.raw_user_meta_data ->> 'full_name',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1)
    ),
    'mahasiswa'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- -------------------------------------------------------------
-- 14. RLS — aktifkan untuk semua tabel
-- -------------------------------------------------------------
alter table public.prodi             enable row level security;
alter table public.profiles          enable row level security;
alter table public.master_gedung     enable row level security;
alter table public.mata_kuliah       enable row level security;
alter table public.jadwal_kelas      enable row level security;
alter table public.peserta_kelas     enable row level security;
alter table public.delegasi_pj       enable row level security;
alter table public.sesi_perkuliahan  enable row level security;
alter table public.presensi_mahasiswa enable row level security;

-- ---------------- Kebijakan RLS (Idempotent: Drop & Recreate) ----------------
drop policy if exists "prodi_baca_semua" on public.prodi;
create policy "prodi_baca_semua" on public.prodi for select to authenticated using (true);

drop policy if exists "prodi_kelola_baak" on public.prodi;
create policy "prodi_kelola_baak" on public.prodi for all to authenticated using (public.has_role('baak')) with check (public.has_role('baak'));

drop policy if exists "profiles_baca_sendiri" on public.profiles;
create policy "profiles_baca_sendiri" on public.profiles for select to authenticated using (id = auth.uid() or public.has_role('baak'));

drop policy if exists "profiles_update_sendiri" on public.profiles;
create policy "profiles_update_sendiri" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists "profiles_kelola_baak" on public.profiles;
create policy "profiles_kelola_baak" on public.profiles for all to authenticated using (public.has_role('baak')) with check (public.has_role('baak'));

drop policy if exists "gedung_baca_semua" on public.master_gedung;
create policy "gedung_baca_semua" on public.master_gedung for select to authenticated using (true);

drop policy if exists "gedung_kelola_baak" on public.master_gedung;
create policy "gedung_kelola_baak" on public.master_gedung for all to authenticated using (public.has_role('baak')) with check (public.has_role('baak'));

drop policy if exists "matkul_baca_semua" on public.mata_kuliah;
create policy "matkul_baca_semua" on public.mata_kuliah for select to authenticated using (true);

drop policy if exists "matkul_kelola_baak" on public.mata_kuliah;
create policy "matkul_kelola_baak" on public.mata_kuliah for all to authenticated using (public.has_role('baak')) with check (public.has_role('baak'));

drop policy if exists "jadwal_baca_mahasiswa" on public.jadwal_kelas;
create policy "jadwal_baca_mahasiswa" on public.jadwal_kelas for select to authenticated using (
  exists (select 1 from public.peserta_kelas pk where pk.jadwal_id = jadwal_kelas.id and pk.mahasiswa_id = auth.uid())
  or pj_id = auth.uid()
);

drop policy if exists "jadwal_baca_dosen" on public.jadwal_kelas;
create policy "jadwal_baca_dosen" on public.jadwal_kelas for select to authenticated using (dosen_id = auth.uid());

drop policy if exists "jadwal_baca_kaprodi" on public.jadwal_kelas;
create policy "jadwal_baca_kaprodi" on public.jadwal_kelas for select to authenticated using (
  exists (
    select 1 from public.mata_kuliah mk
    join public.profiles p on p.prodi_id = mk.prodi_id
    where mk.id = jadwal_kelas.matkul_id and p.id = auth.uid() and p.role = 'kaprodi'
  )
);

drop policy if exists "jadwal_kelola_baak" on public.jadwal_kelas;
create policy "jadwal_kelola_baak" on public.jadwal_kelas for all to authenticated using (public.has_role('baak')) with check (public.has_role('baak'));

drop policy if exists "peserta_baca_mahasiswa" on public.peserta_kelas;
create policy "peserta_baca_mahasiswa" on public.peserta_kelas for select to authenticated using (mahasiswa_id = auth.uid());

drop policy if exists "peserta_baca_dosen" on public.peserta_kelas;
create policy "peserta_baca_dosen" on public.peserta_kelas for select to authenticated using (
  exists (select 1 from public.jadwal_kelas j where j.id = peserta_kelas.jadwal_id and j.dosen_id = auth.uid())
);

drop policy if exists "peserta_kelola_baak" on public.peserta_kelas;
create policy "peserta_kelola_baak" on public.peserta_kelas for all to authenticated using (public.has_role('baak')) with check (public.has_role('baak'));

drop policy if exists "delegasi_buat_pj" on public.delegasi_pj;
create policy "delegasi_buat_pj" on public.delegasi_pj for insert to authenticated with check (
  exists (select 1 from public.jadwal_kelas j where j.id = jadwal_id and j.pj_id = auth.uid())
);

drop policy if exists "delegasi_baca_terkait" on public.delegasi_pj;
create policy "delegasi_baca_terkait" on public.delegasi_pj for select to authenticated using (
  pj_asal_id = auth.uid() or pj_pengganti_id = auth.uid()
  or exists (
    select 1 from public.jadwal_kelas j
    where j.id = delegasi_pj.jadwal_id and (j.dosen_id = auth.uid() or public.has_role('baak') or public.has_role('kaprodi'))
  )
);

drop policy if exists "delegasi_hapus_pj" on public.delegasi_pj;
create policy "delegasi_hapus_pj" on public.delegasi_pj for delete to authenticated using (pj_asal_id = auth.uid());

drop policy if exists "sesi_buat_pj" on public.sesi_perkuliahan;
create policy "sesi_buat_pj" on public.sesi_perkuliahan for insert to authenticated with check (
  exists (
    select 1 from public.jadwal_kelas j
    where j.id = jadwal_id and (
      j.pj_id = auth.uid()
      or exists (
        select 1 from public.delegasi_pj d
        where d.jadwal_id = j.id and d.tanggal = sesi_perkuliahan.tanggal and d.pj_pengganti_id = auth.uid()
      )
    )
  )
);

drop policy if exists "sesi_update_pj_dosen" on public.sesi_perkuliahan;
create policy "sesi_update_pj_dosen" on public.sesi_perkuliahan for update to authenticated using (
  exists (
    select 1 from public.jadwal_kelas j
    where j.id = jadwal_id and (
      j.pj_id = auth.uid() or j.dosen_id = auth.uid()
      or exists (
        select 1 from public.delegasi_pj d
        where d.jadwal_id = j.id and d.tanggal = sesi_perkuliahan.tanggal and d.pj_pengganti_id = auth.uid()
      )
    )
  )
) with check (
  exists (
    select 1 from public.jadwal_kelas j
    where j.id = jadwal_id and (
      j.pj_id = auth.uid() or j.dosen_id = auth.uid()
      or exists (
        select 1 from public.delegasi_pj d
        where d.jadwal_id = j.id and d.tanggal = sesi_perkuliahan.tanggal and d.pj_pengganti_id = auth.uid()
      )
    )
  )
);

drop policy if exists "sesi_baca_mahasiswa" on public.sesi_perkuliahan;
create policy "sesi_baca_mahasiswa" on public.sesi_perkuliahan for select to authenticated using (
  exists (
    select 1 from public.peserta_kelas pk
    where pk.jadwal_id = sesi_perkuliahan.jadwal_id and pk.mahasiswa_id = auth.uid()
  )
  or exists (
    select 1 from public.jadwal_kelas j
    where j.id = sesi_perkuliahan.jadwal_id and (j.pj_id = auth.uid() or j.dosen_id = auth.uid())
  )
  or public.has_role('baak')
  or public.has_role('kaprodi')
);

drop policy if exists "presensi_buat_mahasiswa" on public.presensi_mahasiswa;
create policy "presensi_buat_mahasiswa" on public.presensi_mahasiswa for insert to authenticated with check (
  mahasiswa_id = auth.uid() and exists (
    select 1 from public.peserta_kelas pk
    join public.sesi_perkuliahan s on s.jadwal_id = pk.jadwal_id
    where s.id = presensi_mahasiswa.sesi_id and pk.mahasiswa_id = auth.uid()
  )
);

drop policy if exists "presensi_baca_sendiri" on public.presensi_mahasiswa;
create policy "presensi_baca_sendiri" on public.presensi_mahasiswa for select to authenticated using (
  mahasiswa_id = auth.uid()
  or exists (
    select 1 from public.sesi_perkuliahan s
    join public.jadwal_kelas j on j.id = s.jadwal_id
    where s.id = presensi_mahasiswa.sesi_id and (j.dosen_id = auth.uid() or public.has_role('kaprodi'))
  )
  or public.has_role('baak')
);

drop policy if exists "presensi_koreksi_dosen" on public.presensi_mahasiswa;
create policy "presensi_koreksi_dosen" on public.presensi_mahasiswa for update to authenticated using (
  exists (
    select 1 from public.sesi_perkuliahan s
    join public.jadwal_kelas j on j.id = s.jadwal_id
    where s.id = presensi_mahasiswa.sesi_id and j.dosen_id = auth.uid()
  )
) with check (
  exists (
    select 1 from public.sesi_perkuliahan s
    join public.jadwal_kelas j on j.id = s.jadwal_id
    where s.id = presensi_mahasiswa.sesi_id and j.dosen_id = auth.uid()
  )
);
