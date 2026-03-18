"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const revenueData = [
  { m: "Oct", v: 820000 },
  { m: "Nov", v: 1040000 },
  { m: "Dec", v: 950000 },
  { m: "Jan", v: 1280000 },
  { m: "Feb", v: 1150000 },
  { m: "Mar", v: 762000 },
];

export function RevenueChart() {
  return (
    <ResponsiveContainer width="100%" height={140}>
      <AreaChart data={revenueData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="m" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} tickFormatter={(v) => `₦${(v / 1000).toFixed(0)}K`} />
        <Tooltip
          contentStyle={{ background: "var(--color-bg-card)", border: "1px solid var(--color-border)", borderRadius: 7, fontSize: 11, color: "var(--color-text-primary)" }}
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          formatter={(v: any) => [`₦${(Number(v) / 1000).toFixed(0)}K`, "Revenue"]}
        />
        <Area type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} fill="url(#tg)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
