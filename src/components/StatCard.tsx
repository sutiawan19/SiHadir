import type { ReactNode } from "react";

export function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-surface p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs text-faint">{label}</p>
        {icon}
      </div>
      <p className="mt-1 text-2xl font-bold text-ink">{value}</p>
    </div>
  );
}
