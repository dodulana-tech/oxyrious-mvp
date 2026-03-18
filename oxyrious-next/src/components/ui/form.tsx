import { cn } from "@/lib/utils";
import { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";

interface FormGroupProps {
  label: string;
  children: ReactNode;
  className?: string;
}

export function FormGroup({ label, children, className }: FormGroupProps) {
  return (
    <div className={cn("mb-3", className)}>
      <label className="block text-[10.5px] font-medium text-text-secondary mb-1 uppercase tracking-wider">
        {label}
      </label>
      {children}
    </div>
  );
}

export const inputClass =
  "w-full bg-bg-input border border-border-light rounded-[7px] text-text-primary text-sm px-3 py-2 outline-none focus:border-brand transition-colors";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputClass, className)} {...props} />;
}

export function Select({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select className={cn(inputClass, "cursor-pointer", className)} {...props}>
      {children}
    </select>
  );
}
