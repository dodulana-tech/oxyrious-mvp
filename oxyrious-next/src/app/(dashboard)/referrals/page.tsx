"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, MetricCard } from "@/components/ui/card";
import { Table, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { RefCode } from "@/components/ui/detail-panel";
import { fmt, fmtFull } from "@/lib/utils";

interface Hospital {
  id: number;
  name: string;
  refCode: string;
  referralCount: number;
  refReward: number;
}

interface Referral {
  id: number;
  referrerId: number;
  referrer: { name: string } | null;
  referred: string;
  code: string;
  status: string;
  orderCount: number;
  reward: number;
  date: string;
}

export default function ReferralsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    Promise.all([
      fetch("/api/hospitals").then((r) => r.json()),
      fetch("/api/referrals").then((r) => r.json()).catch(() => []),
    ]).then(([h, r]) => {
      setHospitals(h);
      setReferrals(r);
    });
  }, []);

  const filtered = tab === "all" ? referrals : referrals.filter((r) => r.status === tab.toUpperCase());
  const totalRewards = hospitals.reduce((s, h) => s + h.refReward, 0);

  const dateFormatted = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <>
      <Header title="Referrals" subtitle="Referral tracking, codes and reward payouts" />
      <div className="p-5 flex-1">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <MetricCard label="Total referrals" value={String(referrals.length)} sub="Since launch" accent="purple" />
          <MetricCard
            label="Qualified"
            value={String(referrals.filter((r) => r.status === "QUALIFIED").length)}
            sub="3+ orders placed"
            accent="green"
          />
          <MetricCard
            label="In progress"
            value={String(referrals.filter((r) => r.status === "ACTIVE").length)}
            sub="1-2 orders placed"
            accent="amber"
          />
          <MetricCard label="Rewards issued" value={fmt(totalRewards)} sub="Wallet credits" accent="green" />
        </div>

        <Alert variant="purple">
          <span className="text-[13px]">★</span>
          <span>
            <strong>Mechanic:</strong> When a referred hospital places their 3rd order, the referrer receives a 2% wallet
            credit on their next top-up. Tracked automatically.
          </span>
        </Alert>

        {/* Tabs */}
        <div className="flex border-b border-border mb-3.5">
          {["all", "qualified", "active", "pending"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 text-xs font-medium cursor-pointer border-b-2 -mb-px transition-all bg-transparent capitalize ${
                tab === t ? "text-brand border-brand" : "text-text-muted border-transparent hover:text-text-secondary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        <Card noPad className="mb-4">
          <Table>
            <thead>
              <tr>
                <Th>Referrer</Th>
                <Th>Referred hospital</Th>
                <Th>Code used</Th>
                <Th>Status</Th>
                <Th>Orders placed</Th>
                <Th>Reward</Th>
                <Th>Date</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <Tr key={r.id}>
                  <Td className="font-medium">{r.referrer?.name || "Unknown"}</Td>
                  <Td className="font-medium">{r.referred}</Td>
                  <Td>
                    <RefCode code={r.code} />
                  </Td>
                  <Td>
                    <StatusBadge status={r.status} />
                  </Td>
                  <Td>
                    <span className="font-semibold">{r.orderCount}</span>
                    <span className="text-text-muted text-[11px]"> / 3 to qualify</span>
                  </Td>
                  <Td>
                    <span className={`font-semibold ${r.reward > 0 ? "text-brand" : "text-text-muted"}`}>
                      {r.reward > 0 ? fmtFull(r.reward) : "Pending"}
                    </span>
                  </Td>
                  <Td className="text-text-muted text-[11.5px]">{dateFormatted(r.date)}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>

        <div className="font-display text-[13px] font-bold mb-3">Referral codes by hospital</div>
        <div className="grid grid-cols-2 gap-3">
          {hospitals.map((h) => (
            <Card key={h.id} className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium mb-1.5">{h.name}</div>
                <RefCode code={h.refCode} />
              </div>
              <div className="text-right">
                <div className="font-display text-[22px] font-bold text-purple-500">{h.referralCount}</div>
                <div className="text-[10px] text-text-muted uppercase tracking-wider">referrals</div>
                {h.refReward > 0 && (
                  <div className="text-xs text-brand font-semibold mt-0.5">{fmt(h.refReward)} earned</div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </>
  );
}
