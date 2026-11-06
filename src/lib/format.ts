const NAMA_HARI = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
];

const NAMA_BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export function formatHari(hariIndex: number): string {
  return NAMA_HARI[hariIndex] ?? "Senin";
}

export function formatJam(jamStr?: string | null): string {
  if (!jamStr) return "08.00";
  const parts = jamStr.split(":");
  if (parts.length >= 2) {
    return `${parts[0]}.${parts[1]}`;
  }
  return jamStr;
}

export function formatTanggalIndo(dateStr?: string | null): string {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    const tgl = d.getDate();
    const bln = NAMA_BULAN[d.getMonth()];
    const thn = d.getFullYear();
    const jam = String(d.getHours()).padStart(2, "0");
    const mnt = String(d.getMinutes()).padStart(2, "0");
    return `${tgl} ${bln} ${thn}, ${jam}.${mnt} WIB`;
  } catch {
    return dateStr;
  }
}
