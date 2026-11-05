"use client";

import { type ReactNode, Suspense } from "react";
import { BottomNav, type NavItem } from "@/components/BottomNav";

export function AppShell({
  items,
  children,
}: {
  items: NavItem[];
  children: ReactNode;
}) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col bg-background">
      <main className="flex-1 px-4 pb-28 pt-6">{children}</main>
      <div className="fixed inset-x-0 bottom-0 z-10 mx-auto w-full max-w-md px-4 pb-4 pt-2">
        <Suspense fallback={null}>
          <BottomNav items={items} />
        </Suspense>
      </div>
    </div>
  );
}
