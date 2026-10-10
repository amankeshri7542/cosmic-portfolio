"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Destination } from "./Finder";

export function NavLinks({ items, className }: { items: Destination[]; className?: string }) {
  const path = usePathname();
  return (
    <nav aria-label="Primary" className={className}>
      {items.map((d) => {
        const current = path === d.href || path.startsWith(`${d.href}/`);
        return (
          <Link key={d.href} href={d.href} aria-current={current ? "page" : undefined}>
            {d.label}
          </Link>
        );
      })}
    </nav>
  );
}
