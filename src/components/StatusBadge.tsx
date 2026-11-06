export function StatusBadge({ status }: { status: string }) {
  const s = (status || "").toLowerCase();

  let bgClass = "bg-success/15 text-success-ink border border-success/30";
  let label = "Hadir";

  if (s === "hadir") {
    bgClass = "bg-success/15 text-success-ink border border-success/30";
    label = "Hadir";
  } else if (s === "terlambat") {
    bgClass = "bg-accent/20 text-ink border border-accent/40";
    label = "Terlambat";
  } else if (s === "izin" || s === "sakit") {
    bgClass = "bg-primary/15 text-primary border border-primary/30";
    label = s === "sakit" ? "Sakit" : "Izin";
  } else if (s === "alpha" || s === "alpa") {
    bgClass = "bg-danger/15 text-danger-ink border border-danger/30";
    label = "Alpha";
  } else {
    label = status;
  }

  return (
    <span
      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold ${bgClass}`}
    >
      {label}
    </span>
  );
}
