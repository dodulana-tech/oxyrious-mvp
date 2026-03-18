import { cn } from "@/lib/utils";

interface ScoreBarProps {
  score: number;
  max?: number;
}

export function ScoreBar({ score, max = 100 }: ScoreBarProps) {
  const pct = Math.min(100, (score / max) * 100);
  const color = score >= 80 ? "bg-emerald-500" : score >= 60 ? "bg-amber-500" : "bg-red-500";

  return (
    <div className="flex items-center gap-2">
      <span className="text-xs font-bold w-6 text-right">{score}</span>
      <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

interface WalletBarProps {
  balance: number;
  minimum: number;
}

export function WalletBar({ balance, minimum }: WalletBarProps) {
  const pct = minimum > 0 ? Math.min(100, (balance / minimum) * 100) : 100;
  const color = pct < 30 ? "bg-red-500" : pct < 50 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="h-1.5 bg-border rounded-full overflow-hidden">
      <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
    </div>
  );
}
