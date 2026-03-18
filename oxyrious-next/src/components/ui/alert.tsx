import { cn } from "@/lib/utils";
import { ReactNode } from "react";

const variants = {
  red: "bg-red-50 border-red-200 text-red-700",
  amber: "bg-amber-50 border-amber-200 text-amber-700",
  green: "bg-emerald-50 border-emerald-200 text-emerald-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
};

interface AlertProps {
  variant?: keyof typeof variants;
  children: ReactNode;
  className?: string;
}

export function Alert({ variant = "amber", children, className }: AlertProps) {
  return (
    <div className={cn("p-2.5 rounded-lg text-xs flex items-start gap-2 mb-3 border", variants[variant], className)}>
      {children}
    </div>
  );
}
