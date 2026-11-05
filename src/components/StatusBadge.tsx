import type { KehadiranStatus } from "@/lib/mock";

export function StatusBadge({ status }: { status: KehadiranStatus }) {
  const hadir = status === "Hadir";

  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
        hadir ? "bg-success text-success-ink" : "bg-danger text-danger-ink"
      }`}
    >
      {status}
    </span>
  );
}
