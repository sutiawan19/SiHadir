export type KehadiranStatus = "Hadir" | "Tidak Hadir";

export const profilMahasiswa = {
  nama: "Sutiawan",
  sapaan: "Hello, Sutiawan!",
  nim: "20220810001",
  prodi: "Teknik Informatika",
};

export const kelasBerikutnya: {
  nama: string;
  dosen: string;
  hari: string;
  waktu: string;
  metode: "Luring" | "Daring";
} = {
  nama: "Sistem Enterprise",
  dosen: "Agun Guntara, S.Kom., M.Kom",
  hari: "Rabu",
  waktu: "08.00 - 10.00",
  metode: "Luring",
};

export interface RiwayatItem {
  kode: string;
  nama: string;
  status: KehadiranStatus;
  waktu: string;
}

export const riwayatKehadiran: RiwayatItem[] = [
  {
    kode: "PT 04",
    nama: "Sistem Enterprise",
    status: "Hadir",
    waktu: "08.02, 28 Oktober 2026",
  },
  {
    kode: "PT 03",
    nama: "Sistem Enterprise",
    status: "Hadir",
    waktu: "08.02, 28 Oktober 2026",
  },
  {
    kode: "PT 02",
    nama: "Sistem Enterprise",
    status: "Tidak Hadir",
    waktu: "08.02, 28 Oktober 2026",
  },
  {
    kode: "PT 01",
    nama: "Sistem Enterprise",
    status: "Hadir",
    waktu: "08.02, 28 Oktober 2026",
  },
];

export const aksesCepat = [
  { label: "LMS UNSAP", href: "#" },
  { label: "SIUTER", href: "#" },
];

export const notifikasiMahasiswa = {
  delegasiPj: {
    aktif: true,
    pesan: "Kamu ditunjuk sebagai PJ Pengganti untuk Sistem Enterprise (PT 04).",
  },
};
