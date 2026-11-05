"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";

export interface NavItem {
  href: string;
  label: string;
  icon: ElementType;
}

export function BottomNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");

  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash);
    onHashChange();
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  return (
    <nav className="flex items-center justify-between rounded-full bg-surface p-1.5 shadow-[0_10px_30px_rgba(0,0,0,0.10)]">
      {items.map(({ href, label, icon: Icon }, index) => {
        const isAnchor = href.startsWith("#");
        const active = isAnchor
          ? hash === href || (hash === "" && index === 0)
          : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-1 flex-col items-center gap-0.5 rounded-full px-2 py-2 text-[11px] font-medium transition-colors ${
              active ? "bg-primary text-white" : "text-faint hover:text-muted"
            }`}
          >
            <Icon size={22} weight={active ? "fill" : "regular"} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
