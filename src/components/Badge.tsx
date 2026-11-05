import type { ReactNode } from "react";

type Variant = "success" | "danger" | "primary" | "neutral" | "warning";

const styles: Record<Variant, string> = {
  success: "bg-success text-success-ink",
  danger: "bg-danger text-danger-ink",
  primary: "bg-primary text-white",
  neutral: "bg-line text-muted",
  warning: "bg-accent/30 text-ink",
};

export function Badge({
  variant = "neutral",
  children,
}: {
  variant?: Variant;
  children: ReactNode;
}) {
  return (
    <span
      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
