// Tipe domain — mirror skema database Supabase (source of truth).
// Dipakai di seluruh FE agar integrasi backend tinggal memetakan 1:1.

export type UserRole = "mahasiswa" | "dosen" | "kaprodi" | "baak";
export type MetodeKelas = "daring" | "luring";
export type StatusPresensi = "hadir" | "terlambat" | "izin" | "sakit" | "alpha";

export interface Profile {
  id: string;
  email: string;
  nama: string;
  role: UserRole;
  prodi_id: string | null;
}

export interface MasterGedung {
  id: string;
  nama_gedung: string;
  lat_pusat: number;
  long_pusat: number;
  radius_meter: number;
}

export interface MataKuliah {
  id: string;
  kode_matkul: string;
  nama_matkul: string;
  sks: number;
  prodi_id: string | null;
  bobot_nilai_absen: number;
}

export interface JadwalKelas {
  id: string;
  matkul_id: string;
  dosen_id: string;
  pj_id: string | null;
  gedung_id: string | null;
  kelas: string;
  hari: number;
  waktu_mulai: string;
  waktu_selesai: string;
}

export interface SesiPerkuliahan {
  id: string;
  jadwal_id: string;
  tanggal: string;
  status_dosen: string | null;
  metode_kelas: MetodeKelas;
  timestamp_buka: string | null;
  pj_pengganti_id: string | null;
}

export interface PresensiMahasiswa {
  id: string;
  sesi_id: string;
  mahasiswa_id: string;
  waktu_hadir: string;
  lat_mhs: number | null;
  long_mhs: number | null;
  jarak_meter: number | null;
  status: StatusPresensi;
}
