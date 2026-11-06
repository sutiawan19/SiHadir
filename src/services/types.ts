export type UserRole = "mahasiswa" | "dosen" | "kaprodi" | "baak";
export type MetodeKelas = "daring" | "luring";
export type StatusDosen = "hadir" | "terlambat" | "izin" | "sakit" | "tidak_hadir";
export type StatusPresensi = "hadir" | "terlambat" | "izin" | "sakit" | "alpha";

export interface ProfileRecord {
  id: string;
  email: string;
  nama: string;
  role: UserRole;
  prodi_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface MasterGedungRecord {
  id: string;
  nama_gedung: string;
  lat_pusat: number;
  long_pusat: number;
  radius_meter: number;
}

export interface MataKuliahRecord {
  id: string;
  kode_matkul: string;
  nama_matkul: string;
  sks: number;
  prodi_id: string | null;
  bobot_nilai_absen: number;
}

export interface JadwalKelasDetail {
  id: string;
  kelas: string;
  hari: number;
  waktu_mulai: string;
  waktu_selesai: string;
  matkul: MataKuliahRecord;
  gedung: MasterGedungRecord | null;
  dosen: { id: string; nama: string; email: string };
  pj: { id: string; nama: string; email: string } | null;
}

export interface SesiPerkuliahanDetail {
  id: string;
  jadwal_id: string;
  tanggal: string;
  status_dosen: StatusDosen | null;
  metode_kelas: MetodeKelas;
  timestamp_buka: string | null;
  timestamp_tutup: string | null;
  pj_pengganti_id: string | null;
  dilaporkan_oleh: string | null;
  jadwal?: JadwalKelasDetail;
}

export interface PresensiRecord {
  id: string;
  sesi_id: string;
  mahasiswa_id: string;
  waktu_hadir: string;
  lat_mhs: number | null;
  long_mhs: number | null;
  jarak_meter: number | null;
  status: StatusPresensi;
  sesi?: SesiPerkuliahanDetail;
}

