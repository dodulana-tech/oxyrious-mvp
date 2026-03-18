"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { MetricCard } from "@/components/ui/card";
import { Card } from "@/components/ui/card";
import { Table, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge, PayBadge } from "@/components/ui/badge";
import { WalletBar } from "@/components/ui/bars";
import { fmtFull } from "@/lib/utils";

interface OrderItem {
  id: number;
  gasId: number;
  gas?: { name: string };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  total: number;
  status: string;
  paymentMode: string;
  payStatus: string;
  date: string;
  items: OrderItem[];
  transporter: { name: string } | null;
}

interface HospitalData {
  id: number;
  name: string;
  walletBalance: number;
  walletMinimum: number;
  streak: number;
  tier: number;
  orders: Order[];
  stats: {
    activeOrders: number;
    lastDeliveredDate: string | null;
    nextDeliveryDate: string | null;
  };
}

export default function HospitalPortalPage() {
  const [data, setData] = useState<HospitalData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/hospital/me");
        if (!res.ok) throw new Error("Failed to load hospital data");
        const d = await res.json();
        setData(d);
      } catch (err) {
        console.error("Portal load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load hospital data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <>
        <Header title="Portal" subtitle="Loading..." />
        <div className="p-5 flex-1 flex items-center justify-center">
          <div className="text-text-muted text-sm">Loading your dashboard...</div>
        </div>
      </>
    );
  }

  if (error || !data) {
    return (
      <>
        <Header title="Portal" subtitle="Error" />
        <div className="p-5 flex-1 flex items-center justify-center">
          <div className="text-red-500 text-sm">{error || "Failed to load hospital data."}</div>
        </div>
      </>
    );
  }

  const nextDelivery = data.stats.nextDeliveryDate
    ? new Date(data.stats.nextDeliveryDate).toLocaleDateString("en-NG", {
        day: "numeric",
        month: "short",
      })
    : "None scheduled";

  return (
    <>
      <Header title={`Welcome, ${data.name}`} subtitle="Your hospital overview" />
      <div className="p-5 flex-1 space-y-4">
        {/* Metric cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <MetricCard
            label="Wallet Balance"
            value={fmtFull(data.walletBalance)}
            sub={`Min: ${fmtFull(data.walletMinimum)}`}
            accent="green"
          />
          <MetricCard
            label="Active Orders"
            value={String(data.stats.activeOrders)}
            sub="Pending / In transit"
            accent="blue"
          />
          <MetricCard
            label="Supply Streak"
            value={`${data.streak} orders`}
            sub={`Tier ${data.tier}`}
            accent="purple"
          />
          <MetricCard
            label="Next Delivery"
            value={nextDelivery}
            sub="Estimated date"
            accent="amber"
          />
        </div>

        {/* Wallet balance bar */}
        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">
              Wallet Health
            </span>
            <span className="text-xs font-medium">
              {fmtFull(data.walletBalance)} / {fmtFull(data.walletMinimum)}
            </span>
          </div>
          <WalletBar balance={data.walletBalance} minimum={data.walletMinimum} />
        </Card>

        {/* Recent orders */}
        <div>
          <h3 className="font-display text-sm font-bold mb-2">Recent Orders</h3>
          <Card noPad>
            <Table>
              <thead>
                <tr>
                  <Th>Order ID</Th>
                  <Th>Items</Th>
                  <Th>Total</Th>
                  <Th>Status</Th>
                  <Th>Payment</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {data.orders.length === 0 ? (
                  <Tr>
                    <Td colSpan={6} className="text-center text-text-muted py-6">
                      No orders yet
                    </Td>
                  </Tr>
                ) : (
                  data.orders.map((o) => (
                    <Tr key={o.id}>
                      <Td>
                        <span className="font-bold text-brand text-[11.5px]">{o.id}</span>
                      </Td>
                      <Td className="text-text-muted text-[11.5px] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
                        {o.items
                          ?.map(
                            (i) =>
                              `${i.quantity}x ${i.gas?.name?.split("(")[0]?.trim() || "Gas"}`
                          )
                          .join(", ")}
                      </Td>
                      <Td className="font-semibold">{fmtFull(o.total)}</Td>
                      <Td>
                        <StatusBadge status={o.status} />
                      </Td>
                      <Td>
                        <PayBadge mode={o.paymentMode} />
                      </Td>
                      <Td className="text-text-muted text-[11px]">
                        {new Date(o.date).toLocaleDateString("en-NG", {
                          day: "numeric",
                          month: "short",
                        })}
                      </Td>
                    </Tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card>
        </div>
      </div>
    </>
  );
}
