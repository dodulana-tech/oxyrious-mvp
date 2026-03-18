"use client";

import { cn } from "@/lib/utils";

interface TabsProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex border-b border-border mb-3.5">
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={cn(
            "px-3 py-2 text-xs font-medium cursor-pointer border-b-2 transition-all bg-transparent",
            active === tab
              ? "text-brand border-brand"
              : "text-text-muted border-transparent hover:text-text-secondary"
          )}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

interface FilterBarProps {
  filters: string[];
  active: string;
  onChange: (filter: string) => void;
}

export function FilterBar({ filters, active, onChange }: FilterBarProps) {
  return (
    <div className="flex gap-1.5 mb-3.5 flex-wrap items-center">
      {filters.map((f) => (
        <button
          key={f}
          onClick={() => onChange(f)}
          className={cn(
            "px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer border transition-all capitalize",
            active === f
              ? "bg-brand/15 text-brand border-brand/25"
              : "bg-bg-card text-text-muted border-border hover:text-text-secondary"
          )}
        >
          {f}
        </button>
      ))}
    </div>
  );
}
