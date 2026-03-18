"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { LogOut, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/portal", label: "Overview" },
  { href: "/portal/orders", label: "My Orders" },
  { href: "/portal/wallet", label: "Wallet" },
  { href: "/portal/support", label: "Support" },
];

function PortalSidebarNav() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/portal") return pathname === "/portal";
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <div className="p-2 flex-1">
      <div className="text-[9px] uppercase tracking-[.1em] text-text-muted px-2 mb-1.5 mt-2.5">
        Portal
      </div>
      {NAV.map((item) => {
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
          </Link>
        );
      })}
    </div>
  );
}

function PortalSidebarUser() {
  const { data: session } = useSession();
  const name = session?.user?.name || "Hospital";
  const initials = name
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="p-2.5 border-t border-border">
      <div className="flex items-center gap-2.5 px-2.5 py-2 rounded-[7px]">
        <div className="w-7 h-7 rounded-full bg-brand/15 border border-brand/30 flex items-center justify-center text-[10px] font-bold text-brand">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium truncate">{name}</div>
          <div className="text-[10px] text-text-muted">Hospital Portal</div>
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

function PortalMobileHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      <div className="md:hidden flex items-center gap-2.5 px-4 py-3 border-b border-border bg-bg-card">
        <button onClick={() => setOpen(true)} className="cursor-pointer text-text-secondary">
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-brand rounded-md flex items-center justify-center font-black text-[10px] text-white">
            O2
          </div>
          <span className="font-display text-sm font-bold">
            Oxy<span className="text-brand">rious</span>
          </span>
        </div>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <div className="relative w-[260px] bg-bg-card border-r border-border flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-black text-xs text-white">
                  O2
                </div>
                <div>
                  <div className="font-display text-[13px] font-bold">
                    Oxy<span className="text-brand">rious</span>
                  </div>
                  <div className="text-[8px] text-text-muted uppercase tracking-[.06em]">
                    Hospital Portal
                  </div>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="cursor-pointer text-text-muted">
                <X size={18} />
              </button>
            </div>
            <PortalSidebarNav />
            <PortalSidebarUser />
          </div>
        </div>
      )}
    </>
  );
}

function PortalSidebar() {
  return (
    <aside className="hidden md:flex w-[215px] min-w-[215px] bg-bg-card border-r border-border flex-col overflow-y-auto">
      <div className="p-4 border-b border-border flex items-center gap-2.5">
        <div className="w-[34px] h-[34px] bg-brand rounded-lg flex items-center justify-center font-black text-sm text-white shrink-0">
          O2
        </div>
        <div>
          <div className="font-display text-[13px] font-bold leading-tight">
            Oxy<span className="text-brand">rious</span>
          </div>
          <div className="text-[9px] text-text-muted uppercase tracking-[.06em]">
            Hospital Portal
          </div>
        </div>
      </div>

      <PortalSidebarNav />
      <PortalSidebarUser />
    </aside>
  );
}

export default function HospitalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      <PortalSidebar />
      <div className="flex-1 overflow-y-auto flex flex-col min-w-0">
        <PortalMobileHeader />
        {children}
      </div>
    </div>
  );
}
