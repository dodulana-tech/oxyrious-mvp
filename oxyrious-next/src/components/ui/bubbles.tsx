"use client";

const bubbleConfigs = {
  default: [
    { size: 240, x: "5%", y: "10%", delay: 0, duration: 18, color: "green" },
    { size: 160, x: "72%", y: "5%", delay: 3, duration: 22, color: "emerald" },
    { size: 100, x: "82%", y: "50%", delay: 6, duration: 16, color: "teal" },
    { size: 300, x: "55%", y: "55%", delay: 1, duration: 25, color: "green" },
    { size: 70, x: "28%", y: "65%", delay: 8, duration: 14, color: "magenta" },
    { size: 180, x: "42%", y: "15%", delay: 4, duration: 20, color: "emerald" },
    { size: 55, x: "12%", y: "48%", delay: 10, duration: 12, color: "green" },
    { size: 80, x: "88%", y: "28%", delay: 7, duration: 15, color: "teal" },
    { size: 40, x: "52%", y: "80%", delay: 2, duration: 11, color: "magenta" },
    { size: 50, x: "22%", y: "32%", delay: 5, duration: 13, color: "green" },
    { size: 32, x: "68%", y: "72%", delay: 9, duration: 10, color: "teal" },
    { size: 120, x: "38%", y: "42%", delay: 3, duration: 19, color: "emerald" },
  ],
  sparse: [
    { size: 180, x: "8%", y: "18%", delay: 0, duration: 20, color: "green" },
    { size: 120, x: "78%", y: "25%", delay: 4, duration: 18, color: "teal" },
    { size: 70, x: "48%", y: "55%", delay: 2, duration: 14, color: "magenta" },
    { size: 220, x: "62%", y: "10%", delay: 6, duration: 24, color: "green" },
    { size: 45, x: "22%", y: "65%", delay: 8, duration: 12, color: "teal" },
  ],
};

const colors = {
  green:   { fill: "rgba(13, 150, 104, 0.15)", edge: "rgba(13, 150, 104, 0.06)", border: "rgba(13, 150, 104, 0.08)" },
  emerald: { fill: "rgba(52, 211, 153, 0.12)", edge: "rgba(52, 211, 153, 0.04)", border: "rgba(52, 211, 153, 0.07)" },
  teal:    { fill: "rgba(20, 184, 166, 0.14)", edge: "rgba(20, 184, 166, 0.05)", border: "rgba(20, 184, 166, 0.08)" },
  magenta: { fill: "rgba(217, 70, 239, 0.12)", edge: "rgba(217, 70, 239, 0.04)", border: "rgba(217, 70, 239, 0.07)" },
};

interface BubblesProps {
  density?: "default" | "sparse";
}

export function Bubbles({ density = "default" }: BubblesProps) {
  const config = bubbleConfigs[density];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
      {config.map((b, i) => {
        const c = colors[b.color as keyof typeof colors];
        return (
          <div
            key={i}
            className="absolute rounded-full"
            style={{
              width: b.size,
              height: b.size,
              left: b.x,
              top: b.y,
              background: `radial-gradient(circle at 30% 30%, ${c.fill}, ${c.edge} 60%, transparent 75%)`,
              border: `1px solid ${c.border}`,
              animation: `float-${i % 4} ${b.duration}s ease-in-out ${b.delay}s infinite`,
            }}
          />
        );
      })}
      <style>{`
        @keyframes float-0 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(15px, -22px) scale(1.06); }
          66% { transform: translate(-10px, 14px) scale(0.95); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(-18px, 16px) scale(1.04); }
          75% { transform: translate(12px, -18px) scale(0.94); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          40% { transform: translate(10px, -28px) scale(1.08); }
          80% { transform: translate(-14px, 10px) scale(0.96); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(-12px, -20px) scale(1.05); }
        }
      `}</style>
    </div>
  );
}
