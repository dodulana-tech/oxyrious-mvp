import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const colors = {
  green: "bg-emerald-50 text-emerald-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-red-50 text-red-700",
  blue: "bg-blue-50 text-blue-700",
  gray: "bg-slate-100 text-slate-600",
  purple: "bg-purple-50 text-purple-700",
};

const dotColors = {
  green: "bg-emerald-500",
  amber: "bg-amber-500",
  red: "bg-red-500",
  blue: "bg-blue-500",
  gray: "bg-slate-400",
  purple: "bg-purple-500",
};

interface BadgeProps {
  color?: keyof typeof colors;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ color = "gray", dot, children, className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium whitespace-nowrap", colors[color], className)}>
      {dot && <span className={cn("w-1.5 h-1.5 rounded-full", dotColors[color])} />}
      {children}
    </span>
  );
}

const statusMap: Record<string, { color: keyof typeof colors; label: string }> = {
  DELIVERED: { color: "green", label: "Delivered" },
  IN_TRANSIT: { color: "blue", label: "In Transit" },
  DISPATCHED: { color: "amber", label: "Dispatched" },
  PENDING: { color: "gray", label: "Pending" },
  PAID: { color: "green", label: "Paid" },
  AWAITING: { color: "gray", label: "Awaiting" },
  OVERDUE: { color: "red", label: "Overdue" },
  CURRENT: { color: "blue", label: "Current" },
  ACTIVE: { color: "green", label: "Active" },
  QUALIFIED: { color: "purple", label: "Qualified" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = statusMap[status] || { color: "gray" as const, label: status };
  return <Badge color={s.color} dot>{s.label}</Badge>;
}

const payMap: Record<string, { color: keyof typeof colors; label: string }> = {
  WALLET: { color: "green", label: "Wallet" },
  CREDIT: { color: "amber", label: "Credit" },
  CASH: { color: "gray", label: "Cash" },
  TRANSFER: { color: "blue", label: "Transfer" },
};

export function PayBadge({ mode }: { mode: string }) {
  const p = payMap[mode] || { color: "gray" as const, label: mode };
  return <Badge color={p.color}>{p.label}</Badge>;
}

export function TierBadge({ tier }: { tier: number }) {
  const color = tier >= 3 ? "green" : tier >= 2 ? "amber" : "gray";
  return <Badge color={color as keyof typeof colors}>Tier {tier}</Badge>;
}
