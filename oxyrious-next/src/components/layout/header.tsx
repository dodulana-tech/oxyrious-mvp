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
      <div className="ml-auto" />
    </div>
  );
}
