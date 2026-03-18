"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { MetricCard } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { Alert } from "@/components/ui/alert";
import { Table, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge, PayBadge } from "@/components/ui/badge";
import { WalletBar } from "@/components/ui/bars";
import { fmt, fmtFull } from "@/lib/utils";
import { AlertTriangle, Star } from "lucide-react";
import Link from "next/link";
import { Btn } from "@/components/ui/button";
import { RevenueChart } from "@/components/dashboard/revenue-chart";

interface Hospital {
  id: number;
  name: string;
  paymentMode: string;
  walletBalance: number;
  walletMinimum: number;
  milestone: boolean;
  streak: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  paymentMode: string;
  hospital: { name: string };
  transporter: { name: string } | null;
}

export default function DashboardPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState({ overdueAmt: 0, activeOrders: 0, avgStreak: 0, outstanding: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [hosRes, ordRes, statsRes] = await Promise.all([
          fetch("/api/hospitals"),
          fetch("/api/orders"),
          fetch("/api/dashboard/stats"),
        ]);

        if (!hosRes.ok) throw new Error("Failed to load hospitals");
        if (!ordRes.ok) throw new Error("Failed to load orders");
        if (!statsRes.ok) throw new Error("Failed to load stats");

        const hosData = await hosRes.json();
        const ordData = await ordRes.json();
        const statsData = await statsRes.json();

        setHospitals(Array.isArray(hosData) ? hosData : []);
        setOrders(Array.isArray(ordData) ? ordData.slice(0, 5) : []);
        setStats({
          overdueAmt: statsData.overdueAmount || 0,
          activeOrders: statsData.activeOrders || 0,
          avgStreak: statsData.avgStreak || 0,
          outstanding: statsData.outstandingAmount || 0,
        });
      } catch (err) {
        console.error("Dashboard load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const walletHospitals = hospitals.filter((h) => h.paymentMode === "WALLET");
  const walletLow = walletHospitals.filter((h) => h.walletBalance < h.walletMinimum);
  const nudges = hospitals.filter((h) => h.milestone);
  const totalFloat = walletHospitals.reduce((s, h) => s + h.walletBalance, 0);

  if (loading) {
    return (
      <>
        <Header title="Dashboard" subtitle="Welcome back, Admin" />
        <div className="p-5 flex-1 flex items-center justify-center text-text-muted text-sm">Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header title="Dashboard" subtitle="Welcome back, Admin" />
        <div className="p-5 flex-1 flex items-center justify-center">
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Dashboard" subtitle="Welcome back, Admin" />
      <div className="p-5 flex-1">
        {/* Alerts */}
        {nudges.length > 0 && (
          <Alert variant="purple">
            <Star size={14} className="shrink-0 mt-0.5" />
            <span>
              <strong>{nudges.length} wallet milestone{nudges.length > 1 ? "s" : ""} ready</strong> — {nudges.map((h) => h.name).join(", ")} have 3+ orders. Send wallet nudge now.
            </span>
            <Link href="/growth" className="ml-auto shrink-0">
              <Btn size="sm" variant="purple">View nudges</Btn>
            </Link>
          </Alert>
        )}
        {stats.overdueAmt > 0 && (
          <Alert variant="red">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              <strong>{fmt(stats.overdueAmt)} overdue</strong> — Past due invoices require attention.
            </span>
          </Alert>
        )}
        {walletLow.length > 0 && (
          <Alert variant="amber">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              <strong>{walletLow.length} wallet(s) below minimum</strong> — {walletLow.map((h) => h.name).join(", ")}
            </span>
          </Alert>
        )}

        {/* Metric cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <MetricCard label="Mar Revenue MTD" value="₦762K" sub="↑ 6% vs Feb" accent="green" />
          <MetricCard label="Outstanding" value={fmt(stats.outstanding)} sub={`${fmt(stats.overdueAmt)} overdue`} accent="amber" />
          <MetricCard label="Active orders" value={String(stats.activeOrders)} sub="Pending + in transit" accent="blue" />
          <MetricCard label="Avg supply streak" value={`${stats.avgStreak}d`} sub="0 missed deliveries" accent="green" />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-3.5 mb-3.5">
          <Card>
            <div className="flex justify-between items-center mb-3">
              <div className="font-display text-[13px] font-bold">Revenue trend</div>
              <span className="text-[10px] text-text-muted">6 months</span>
            </div>
            <RevenueChart />
          </Card>

          <Card>
            <div className="flex justify-between items-center mb-3.5">
              <div className="font-display text-[13px] font-bold">Wallet float</div>
              <span className="text-[10px] text-text-muted">Live balances</span>
            </div>
            {walletHospitals.map((h) => (
              <div key={h.id} className="mb-3">
                <div className="flex justify-between mb-1">
                  <span className="text-xs font-medium">{h.name}</span>
                  <span className="text-[10px] text-text-muted">{fmtFull(h.walletBalance)}</span>
                </div>
                <WalletBar balance={h.walletBalance} minimum={h.walletMinimum} />
              </div>
            ))}
            <div className="border-t border-border pt-2.5 mt-1 flex justify-between text-xs">
              <span className="text-text-muted">Total float held</span>
              <span className="font-bold text-brand">{fmt(totalFloat)}</span>
            </div>
          </Card>
        </div>

        {/* Recent orders */}
        <Card noPad>
          <div className="px-4 py-3 border-b border-border flex justify-between items-center">
            <div className="font-display text-[13px] font-bold">Recent orders</div>
            <Link href="/orders">
              <Btn size="sm">View all</Btn>
            </Link>
          </div>
          <Table>
            <thead>
              <tr>
                <Th>Order</Th>
                <Th>Hospital</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th>Payment</Th>
                <Th>Transporter</Th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Tr key={o.id}>
                  <Td><span className="font-bold text-brand text-[11.5px]">{o.id}</span></Td>
                  <Td className="font-medium">{o.hospital.name}</Td>
                  <Td className="font-semibold">{fmtFull(o.total)}</Td>
                  <Td><StatusBadge status={o.status} /></Td>
                  <Td><PayBadge mode={o.paymentMode} /></Td>
                  <Td className="text-text-secondary text-xs">{o.transporter?.name || "—"}</Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>
      </div>
    </>
  );
}
