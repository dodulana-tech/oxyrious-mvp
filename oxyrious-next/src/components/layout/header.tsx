interface HeaderProps {
  title: string;
  subtitle: string;
}

export function Header({ title, subtitle }: HeaderProps) {
  return (
    <div className="px-5 py-3 border-b border-border flex items-center bg-bg sticky top-0 z-10 gap-2.5">
      <div>
        <div className="font-display text-[17px] font-bold">{title}</div>
        <div className="text-[11px] text-text-muted mt-px">{subtitle}</div>
      </div>
      <div className="ml-auto flex gap-2">
        <button className="bg-bg-card border border-border rounded-[7px] text-text-secondary cursor-pointer px-2.5 py-1.5 hover:text-text-primary transition-colors">
          🔔
        </button>
        <button className="bg-bg-card border border-border rounded-[7px] text-text-secondary cursor-pointer px-2.5 py-1.5 hover:text-text-primary transition-colors">
          ⚙
        </button>
      </div>
    </div>
  );
}
