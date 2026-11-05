"use client";

import type { ReactNode } from "react";
import { AppShell } from "@/components/AppShell";
import { mahasiswaNav, pjNav } from "@/lib/nav";
import { useDemo } from "@/lib/demo-context";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { currentUser } = useDemo();
  const items = currentUser.role === "pj" ? pjNav : mahasiswaNav;

  return <AppShell items={items}>{children}</AppShell>;
}
