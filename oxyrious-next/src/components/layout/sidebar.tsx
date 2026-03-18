"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/dashboard", label: "Dashboard", section: "main" },
  { href: "/orders", label: "Orders", section: "main", badge: 2, badgeColor: "bg-red-500 text-white" },
  { href: "/hospitals", label: "Hospitals", section: "main" },
  { href: "/inventory", label: "Inventory", section: "main", badge: 1, badgeColor: "bg-amber-500 text-white" },
  { href: "/logistics", label: "Logistics", section: "ops" },
  { href: "/receivables", label: "Receivables", section: "ops", badge: 1, badgeColor: "bg-red-500 text-white" },
  { href: "/growth", label: "Growth Hub", section: "growth", badge: "NEW", badgeColor: "bg-purple-500 text-white" },
  { href: "/referrals", label: "Referrals", section: "growth" },
  { href: "/reports", label: "Supply Reports", section: "growth" },
];

const sectionLabels: Record<string, string> = {
  main: "Main",
  ops: "Operations",
  growth: "Growth",
};

export function MobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center gap-2.5 px-4 py-3 border-b border-border bg-bg-card">
        <button onClick={() => setOpen(true)} className="cursor-pointer text-text-secondary">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand rounded-md flex items-center justify-center font-black text-[10px] text-white">
            O₂
          </div>
          <span className="font-display text-sm font-bold">
            Oxy<span className="text-brand">rious</span>
          </span>
        </div>
      </div>

      {/* Mobile drawer overlay */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative w-[260px] bg-bg-card border-r border-border flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-black text-xs text-white">
                  O₂
                </div>
                <div>
                  <div className="font-display text-[13px] font-bold">Oxy<span className="text-brand">rious</span></div>
                  <div className="text-[8px] text-text-muted uppercase tracking-[.06em]">Medical Oxygen. Elevated.</div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="cursor-pointer text-text-muted">
                <X size={18} />
              </button>
            </div>
            <SidebarNav />
            <SidebarUser />
          </div>
        </div>
      )}
    </>
  );
}

function SidebarNav() {
  const pathname = usePathname();
  const sections = ["main", "ops", "growth"];

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="p-2 flex-1">
      {sections.map((sec) => (
        <div key={sec}>
          <div className="text-[9px] uppercase tracking-[.1em] text-text-muted px-2 mb-1.5 mt-2.5">
            {sectionLabels[sec]}
          </div>
          {NAV.filter((n) => n.section === sec).map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between px-2.5 py-2 rounded-[7px] mb-0.5 text-[13px] transition-all no-underline",
                  active
                    ? "text-brand bg-brand/12 border border-brand/15 font-medium"
                    : "text-text-secondary border border-transparent hover:text-text-primary"
                )}
              >
                {item.label}
                {item.badge && (
                  <span className={cn("text-[9px] font-bold px-1.5 py-px rounded-full", item.badgeColor)}>
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function SidebarUser() {
  return (
    <div className="p-2.5 border-t border-border">
      <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[7px]">
        <div className="w-7 h-7 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-[10px] font-bold text-brand">
          AD
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium">Admin</div>
          <div className="text-[10px] text-text-muted">Oxyrious</div>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-text-muted hover:text-red-500 cursor-pointer transition-colors"
          title="Sign out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden md:flex w-[215px] min-w-[215px] bg-bg-card border-r border-border flex-col overflow-y-auto">
      {/* Logo */}
      <div className="p-4 border-b border-border flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] bg-brand rounded-lg flex items-center justify-center font-black text-sm text-white shrink-0">
          O₂
        </div>
        <div>
          <div className="font-display text-[13px] font-bold leading-tight">
            Oxy<span className="text-brand">rious</span>
          </div>
          <div className="text-[9px] text-text-muted uppercase tracking-[.06em]">
            Medical Oxygen. Elevated.
          </div>
        </div>
      </div>

      <SidebarNav />
      <SidebarUser />
    </aside>
  );
}
