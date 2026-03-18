"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, MetricCard } from "@/components/ui/card";
import { Table, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { RefCode } from "@/components/ui/detail-panel";
import { Modal } from "@/components/ui/modal";
import { Btn } from "@/components/ui/button";
import { FormGroup, Input, Select } from "@/components/ui/form";
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
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [form, setForm] = useState({ referrerId: "", referred: "", code: "" });

  const loadData = () =>
    Promise.all([
      fetch("/api/hospitals").then((r) => r.json()),
      fetch("/api/referrals").then((r) => r.json()).catch(() => []),
    ]).then(([h, r]) => {
      setHospitals(h);
      setReferrals(r);
    });

  useEffect(() => {
    loadData();
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

  const updateStatus = async (id: number, status: string) => {
    setActionLoading(id);
    try {
      const res = await fetch(`/api/referrals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) await loadData();
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreate = async () => {
    if (!form.referrerId || !form.referred || !form.code) return;
    setCreating(true);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referrerId: Number(form.referrerId),
          referred: form.referred,
          code: form.code,
          date: new Date().toISOString(),
        }),
      });
      if (res.ok) {
        await loadData();
        setForm({ referrerId: "", referred: "", code: "" });
        setShowCreate(false);
      }
    } finally {
      setCreating(false);
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

        {/* Tabs + Add referral */}
        <div className="flex items-center justify-between border-b border-border mb-3.5">
          <div className="flex">
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
          <Btn variant="purple" size="sm" onClick={() => setShowCreate(true)}>
            + Add referral
          </Btn>
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
                <Th>Actions</Th>
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
                  <Td>
                    {r.status === "PENDING" && (
                      <Btn
                        variant="primary"
                        size="sm"
                        disabled={actionLoading === r.id}
                        onClick={() => updateStatus(r.id, "ACTIVE")}
                      >
                        {actionLoading === r.id ? "..." : "Approve"}
                      </Btn>
                    )}
                    {r.status === "ACTIVE" && r.orderCount >= 3 && (
                      <Btn
                        variant="purple"
                        size="sm"
                        disabled={actionLoading === r.id}
                        onClick={() => updateStatus(r.id, "QUALIFIED")}
                      >
                        {actionLoading === r.id ? "..." : "Qualify"}
                      </Btn>
                    )}
                  </Td>
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

      {/* Create Referral Modal */}
      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Add referral">
        <FormGroup label="Referrer">
          <Select value={form.referrerId} onChange={(e) => setForm({ ...form, referrerId: e.target.value })}>
            <option value="">Select hospital...</option>
            {hospitals.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </Select>
        </FormGroup>
        <FormGroup label="Referred hospital name">
          <Input
            placeholder="Hospital name"
            value={form.referred}
            onChange={(e) => setForm({ ...form, referred: e.target.value })}
          />
        </FormGroup>
        <FormGroup label="Code used">
          <Input
            placeholder="Referral code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
        </FormGroup>
        <div className="flex justify-end gap-2 mt-4">
          <Btn variant="ghost" onClick={() => setShowCreate(false)}>
            Cancel
          </Btn>
          <Btn
            variant="primary"
            disabled={creating || !form.referrerId || !form.referred || !form.code}
            onClick={handleCreate}
          >
            {creating ? "Saving..." : "Create referral"}
          </Btn>
        </div>
      </Modal>
    </>
  );
}
