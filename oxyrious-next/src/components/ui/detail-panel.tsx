import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function DetailPanel({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("shrink-0 flex flex-col gap-2.5 w-[320px]", className)}>
      {children}
    </div>
  );
}

export function RefCode({ code }: { code: string }) {
  return (
    <span className="font-mono bg-bg-input border border-border rounded-md px-2.5 py-1 text-sm font-bold tracking-widest text-brand">
      {code}
    </span>
  );
}
