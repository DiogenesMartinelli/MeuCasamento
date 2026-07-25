"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/admin", label: "Painel" },
  { href: "/admin/configuracoes", label: "Site" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/convidados", label: "Convidados" },
  { href: "/admin/presentes", label: "Presentes" },
  { href: "/admin/recados", label: "Recados" },
];

export function AdminNav({ className }: { className?: string }) {
  const pathname = usePathname();

  return (
    <nav className={cn("flex flex-col gap-1", className)}>
      {NAV_ITEMS.map((item) => {
        const active = item.href === "/admin" ? pathname === "/admin" : pathname?.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "rounded-md px-3 py-2 text-sm transition-colors hover:bg-muted",
              active ? "bg-muted font-medium" : "text-muted-foreground",
            )}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
