import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, ReactNode } from "react";

const variants = {
  primary: "bg-brand text-white hover:bg-brand-dark",
  ghost: "bg-bg-card border border-border text-text-secondary hover:text-text-primary hover:border-border-light",
  danger: "bg-red-50 text-red-700 hover:bg-red-100",
  purple: "bg-purple-50 text-purple-700 hover:bg-purple-100",
};

const sizes = {
  md: "px-3.5 py-1.5 text-xs",
  sm: "px-2.5 py-1 text-[11px]",
};

interface BtnProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  children: ReactNode;
}

export function Btn({ variant = "primary", size = "md", className, children, ...props }: BtnProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center gap-1.5 rounded-lg font-medium cursor-pointer border-none transition-all whitespace-nowrap",
        variants[variant],
        sizes[size],
        props.disabled && "opacity-40 cursor-not-allowed",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
