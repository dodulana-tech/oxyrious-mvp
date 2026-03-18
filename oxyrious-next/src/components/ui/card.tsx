import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  noPad?: boolean;
}

export function Card({ children, className, noPad }: CardProps) {
  return (
    <div className={cn("bg-bg-card border border-border rounded-xl shadow-sm", !noPad && "p-3.5", className)}>
      {children}
    </div>
  );
}

const accentColors = {
  green: "border-t-emerald-500",
  amber: "border-t-amber-500",
  red: "border-t-red-500",
  blue: "border-t-blue-500",
  purple: "border-t-purple-500",
};

interface MetricCardProps {
  label: string;
  value: string;
  sub?: string;
  accent?: keyof typeof accentColors;
  className?: string;
}

export function MetricCard({ label, value, sub, accent, className }: MetricCardProps) {
  return (
    <div className={cn("bg-bg-card border border-border rounded-xl shadow-sm p-3.5 border-t-2 relative overflow-hidden", accent ? accentColors[accent] : "border-t-border", className)}>
      <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">{label}</div>
      <div className="font-display text-xl font-bold">{value}</div>
      {sub && <div className="text-[10.5px] text-text-muted mt-1">{sub}</div>}
    </div>
  );
}
