import { cn } from "@/lib/utils";
import { ReactNode, TdHTMLAttributes, HTMLAttributes } from "react";

export function Table({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className="overflow-x-auto">
      <table className={cn("w-full border-collapse", className)}>
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className }: { children?: ReactNode; className?: string }) {
  return (
    <th className={cn("text-left text-[10px] uppercase tracking-wider text-text-muted p-2.5 border-b border-border font-medium", className)}>
      {children}
    </th>
  );
}

interface TrProps extends HTMLAttributes<HTMLTableRowElement> {
  children: ReactNode;
  highlight?: boolean;
}

export function Tr({ children, highlight, className, ...props }: TrProps) {
  return (
    <tr
      className={cn(
        "border-b border-border/50 transition-colors",
        highlight && "bg-brand/5",
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

interface TdProps extends TdHTMLAttributes<HTMLTableCellElement> {
  children: ReactNode;
}

export function Td({ children, className, ...props }: TdProps) {
  return (
    <td className={cn("p-2.5 text-xs", className)} {...props}>
      {children}
    </td>
  );
}
