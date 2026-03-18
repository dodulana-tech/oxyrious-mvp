"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, MetricCard } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { fmtFull } from "@/lib/utils";

interface Transporter {
  id: number;
  name: string;
  driver: string;
  phone: string;
  deliveries: number;
  onTimeRate: number;
  activeCount: number;
}

interface OrderItem {
  id: number;
  gasId: number;
  gas?: { name: string };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  hospital: { name: string };
  items: OrderItem[];
  total: number;
  status: string;
  transporter: { name: string } | null;
}

export default function LogisticsPage() {
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<Order[]>([]);

  useEffect(() => {
    Promise.all([
      fetch("/api/transporters").then((r) => r.json()),
      fetch("/api/orders?status=DISPATCHED").then((r) => r.json()),
      fetch("/api/orders?status=IN_TRANSIT").then((r) => r.json()),
    ]).then(([t, dispatched, inTransit]) => {
      setTransporters(t);
      setActiveDeliveries([...dispatched, ...inTransit]);
    });
  }, []);

  const activeTransporters = transporters.filter((t) => t.activeCount > 0).length;
  const avgOnTime =
    transporters.length > 0
      ? Math.round(transporters.reduce((s, t) => s + t.onTimeRate, 0) / transporters.length)
      : 0;

  return (
    <>
      <Header title="Logistics" subtitle="Transporters and active deliveries" />
      <div className="p-5 flex-1">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <MetricCard
            label="In transit"
            value={String(activeDeliveries.length)}
            sub="Active deliveries"
            accent="blue"
          />
          <MetricCard
            label="Transporters"
            value={String(transporters.length)}
            sub={`${activeTransporters} active today`}
            accent="green"
          />
          <MetricCard
            label="Avg on-time rate"
            value={`${avgOnTime}%`}
            sub="Across all transporters"
            accent="amber"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Transporters */}
          <div>
            <div className="font-display text-[13px] font-bold mb-3">Transporters</div>
            <div className="flex flex-col gap-2.5">
              {transporters.map((t) => (
                <Card key={t.id}>
                  <div className="flex justify-between mb-2.5">
                    <div>
                      <div className="font-semibold mb-0.5">{t.name}</div>
                      <div className="text-[11px] text-text-muted">
                        {t.driver} · {t.phone}
                      </div>
                    </div>
                    <Badge color={t.activeCount > 0 ? "green" : "gray"} dot>
                      {t.activeCount > 0 ? `${t.activeCount} active` : "Idle"}
                    </Badge>
                  </div>
                  <div className="flex gap-5 mb-2.5">
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-text-muted mb-0.5">Deliveries</div>
                      <div className="font-display font-bold text-lg">{t.deliveries}</div>
                    </div>
                    <div>
                      <div className="text-[9px] uppercase tracking-wider text-text-muted mb-0.5">On-time</div>
                      <div className={`font-display font-bold text-lg ${t.onTimeRate >= 90 ? "text-emerald-500" : "text-amber-500"}`}>
                        {t.onTimeRate}%
                      </div>
                    </div>
                  </div>
                  <div className="bg-bg rounded-sm h-1 overflow-hidden">
                    <div
                      className={`h-full rounded-sm ${t.onTimeRate >= 90 ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${t.onTimeRate}%` }}
                    />
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Active deliveries */}
          <div>
            <div className="font-display text-[13px] font-bold mb-3">Active deliveries</div>
            {activeDeliveries.length === 0 ? (
              <Card>
                <div className="text-center text-text-muted py-5">No active deliveries</div>
              </Card>
            ) : (
              <div className="flex flex-col gap-2.5">
                {activeDeliveries.map((o) => (
                  <Card key={o.id}>
                    <div className="flex justify-between mb-2">
                      <span className="font-display font-bold text-xs text-brand">{o.id}</span>
                      <StatusBadge status={o.status} />
                    </div>
                    <div className="font-medium mb-1">{o.hospital?.name}</div>
                    <div className="text-[11.5px] text-text-muted mb-1.5">{o.transporter?.name}</div>
                    <div className="text-xs text-text-muted">
                      {o.items?.map((i) => `${i.quantity}x ${i.gas?.name?.split("(")[0]?.trim() || "Gas"}`).join(", ")}
                    </div>
                    <div className="mt-2 font-display text-[13px] font-bold">{fmtFull(o.total)}</div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
