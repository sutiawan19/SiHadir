export const dosen = {
  nama: "Agun Guntara, S.Kom., M.Kom",
  role: "Dosen Pengampu",
  stats: [
    { label: "Kelas Aktif", value: "3" },
    { label: "Total Mahasiswa", value: "128" },
    { label: "Kritis (<75%)", value: "7" },
  ],
  kelas: [
    {
      nama: "Sistem Enterprise",
      kelas: "TI-3A",
      bobot: 10,
      pertemuan: ["PT 01", "PT 02", "PT 03", "PT 04"],
      mahasiswa: [
        { nama: "Sutiawan", nim: "20220810001", kehadiran: [true, true, true, true] },
        { nama: "Budi Santoso", nim: "20220810012", kehadiran: [true, false, true, true] },
        { nama: "Citra Ayu", nim: "20220810027", kehadiran: [true, true, false, true] },
        { nama: "Dedi Kurniawan", nim: "20220810033", kehadiran: [true, false, false, true] },
        { nama: "Eka Putri", nim: "20220810041", kehadiran: [false, true, true, true] },
      ],
    },
    {
      nama: "Basis Data",
      kelas: "TI-3B",
      bobot: 10,
      pertemuan: ["PT 01", "PT 02", "PT 03"],
      mahasiswa: [
        { nama: "Sutiawan", nim: "20220810001", kehadiran: [true, true, true] },
        { nama: "Budi Santoso", nim: "20220810012", kehadiran: [true, false, true] },
        { nama: "Citra Ayu", nim: "20220810027", kehadiran: [false, true, true] },
      ],
    },
    {
      nama: "Pemrograman Web",
      kelas: "TI-3C",
      bobot: 15,
      pertemuan: ["PT 01", "PT 02", "PT 03"],
      mahasiswa: [
        { nama: "Dedi Kurniawan", nim: "20220810033", kehadiran: [true, true, false] },
        { nama: "Eka Putri", nim: "20220810041", kehadiran: [true, true, true] },
      ],
    },
  ],
  ews: [
    { nama: "Budi Santoso", nim: "20220810012", kelas: "Sistem Enterprise", persen: 68 },
    { nama: "Citra Ayu", nim: "20220810027", kelas: "Basis Data", persen: 71 },
    { nama: "Dedi Kurniawan", nim: "20220810033", kelas: "Sistem Enterprise", persen: 60 },
  ],
};

export const pj = {
  nama: "Rizky Maulana",
  role: "PJ Mata Kuliah",
  kelasBerikutnya: {
    nama: "Sistem Enterprise",
    dosen: "Agun Guntara, S.Kom., M.Kom",
    hari: "Rabu",
    waktu: "08.00 - 10.00",
  },
  tunggakan: { pertemuan: "PT 03", tanggal: "21 Oktober 2026" },
  temanSekelas: [
    { nama: "Sutiawan", nim: "20220810001" },
    { nama: "Budi Santoso", nim: "20220810012" },
    { nama: "Citra Ayu", nim: "20220810027" },
  ],
};

export const kaprodi = {
  nama: "Dr. Siti Rahayu, M.Kom",
  role: "Kaprodi Teknik Informatika",
  stats: [
    { label: "Kelas Aktif", value: "12" },
    { label: "Total Mahasiswa", value: "320" },
    { label: "Kritis (<75%)", value: "19" },
  ],
  aktivitas: [
    { nama: "Sistem Enterprise", kelas: "TI-3A", dosen: "Agun Guntara", status: "Berlangsung" },
    { nama: "Basis Data", kelas: "TI-3B", dosen: "Bambang S.", status: "Selesai" },
    { nama: "Pemrograman Web", kelas: "TI-3C", dosen: "Cici N.", status: "Belum Mulai" },
  ],
  ews: [
    { nama: "Dedi Kurniawan", nim: "20220810033", kelas: "Sistem Enterprise", persen: 60 },
    { nama: "Eka Putri", nim: "20220810041", kelas: "Basis Data", persen: 66 },
  ],
};

export const baak = {
  nama: "Admin BAAK",
  role: "Bagian Akademik",
  gedung: [
    { nama: "Gedung A", lat: -6.8586, long: 107.9162, radius: 60 },
    { nama: "Gedung B", lat: -6.8588, long: 107.9165, radius: 60 },
    { nama: "Gedung C", lat: -6.8584, long: 107.9159, radius: 80 },
  ],
  jadwalKelas: [
    {
      kelas: "TI-1A",
      matkul: [
        { nama: "Pengantar Teknologi Informasi", hari: "Senin", waktu: "08.00 - 10.00", gedung: "Gedung A" },
        { nama: "Matematika Diskrit", hari: "Selasa", waktu: "10.00 - 12.00", gedung: "Gedung B" },
      ],
    },
    {
      kelas: "TI-1B",
      matkul: [
        { nama: "Pengantar Teknologi Informasi", hari: "Senin", waktu: "10.00 - 12.00", gedung: "Gedung A" },
        { nama: "Matematika Diskrit", hari: "Selasa", waktu: "13.00 - 15.00", gedung: "Gedung B" },
      ],
    },
    {
      kelas: "TI-2A",
      matkul: [
        { nama: "Struktur Data", hari: "Rabu", waktu: "08.00 - 10.00", gedung: "Gedung C" },
        { nama: "Sistem Operasi", hari: "Kamis", waktu: "10.00 - 12.00", gedung: "Gedung A" },
      ],
    },
    {
      kelas: "TI-2B",
      matkul: [
        { nama: "Struktur Data", hari: "Rabu", waktu: "10.00 - 12.00", gedung: "Gedung C" },
        { nama: "Sistem Operasi", hari: "Kamis", waktu: "13.00 - 15.00", gedung: "Gedung A" },
      ],
    },
    {
      kelas: "TI-3A",
      matkul: [
        { nama: "Sistem Enterprise", hari: "Rabu", waktu: "08.00 - 10.00", gedung: "Gedung A" },
        { nama: "Basis Data", hari: "Kamis", waktu: "10.00 - 12.00", gedung: "Gedung B" },
        { nama: "Pemrograman Web", hari: "Jumat", waktu: "13.00 - 15.00", gedung: "Gedung C" },
      ],
    },
    {
      kelas: "TI-3B",
      matkul: [
        { nama: "Sistem Enterprise", hari: "Rabu", waktu: "10.00 - 12.00", gedung: "Gedung A" },
        { nama: "Basis Data", hari: "Kamis", waktu: "13.00 - 15.00", gedung: "Gedung B" },
      ],
    },
    {
      kelas: "SI-3A",
      matkul: [
        { nama: "Analisis Sistem Informasi", hari: "Senin", waktu: "08.00 - 10.00", gedung: "Gedung B" },
        { nama: "Manajemen Proyek TI", hari: "Selasa", waktu: "10.00 - 12.00", gedung: "Gedung C" },
      ],
    },
    {
      kelas: "SI-3B",
      matkul: [
        { nama: "Analisis Sistem Informasi", hari: "Senin", waktu: "10.00 - 12.00", gedung: "Gedung B" },
        { nama: "Manajemen Proyek TI", hari: "Selasa", waktu: "13.00 - 15.00", gedung: "Gedung C" },
      ],
    },
  ],
};
