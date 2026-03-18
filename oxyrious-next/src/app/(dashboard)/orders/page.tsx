"use client";

import { useState, useEffect } from "react";
import { Plus, Truck, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/tabs";
import { Table, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge, PayBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { FormGroup, Select, Input, inputClass } from "@/components/ui/form";
import { Alert } from "@/components/ui/alert";
import { fmt, fmtFull } from "@/lib/utils";

interface OrderItem {
  id: number;
  gasId: number;
  gas?: { name: string };
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  hospitalId: number;
  hospital: { id: number; name: string };
  items: OrderItem[];
  total: number;
  status: string;
  paymentMode: string;
  payStatus: string;
  transporterId: number | null;
  transporter: { id: number; name: string } | null;
  date: string;
  source: string;
}

interface Hospital {
  id: number;
  name: string;
  paymentMode: string;
  walletBalance: number;
}

interface Gas {
  id: number;
  name: string;
  price: number;
}

interface Transporter {
  id: number;
  name: string;
  driver: string;
  phone: string;
  onTimeRate: number;
  activeCount: number;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [gases, setGases] = useState<Gas[]>([]);
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [filter, setFilter] = useState("all");
  const [modal, setModal] = useState<string | null>(null);
  const [dispatchOrder, setDispatchOrder] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState({ hospitalId: "", gasId: "", qty: "1", pmOverride: "" });
  const [dispatchTransporter, setDispatchTransporter] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [ordRes, hosRes, gasRes, transRes] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/hospitals"),
          fetch("/api/gases"),
          fetch("/api/transporters"),
        ]);

        if (!ordRes.ok) throw new Error("Failed to load orders");
        if (!hosRes.ok) throw new Error("Failed to load hospitals");
        if (!gasRes.ok) throw new Error("Failed to load gases");
        if (!transRes.ok) throw new Error("Failed to load transporters");

        const [o, h, g, t] = await Promise.all([
          ordRes.json(),
          hosRes.json(),
          gasRes.json(),
          transRes.json(),
        ]);

        setOrders(Array.isArray(o) ? o : []);
        setHospitals(Array.isArray(h) ? h : []);
        setGases(Array.isArray(g) ? g : []);
        setTransporters(Array.isArray(t) ? t : []);
      } catch (err) {
        console.error("Orders page load error:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      }
    }
    load();
  }, []);

  const filters = ["all", "PENDING", "DISPATCHED", "IN_TRANSIT", "DELIVERED"];
  const filtered = orders.filter(
    (o) => filter === "all" || o.status === filter || (filter === "OVERDUE" && o.payStatus === "OVERDUE")
  );

  const selHosp = hospitals.find((h) => h.id === parseInt(newOrder.hospitalId));
  const selGas = gases.find((g) => g.id === parseInt(newOrder.gasId));
  const orderTotal = selGas ? selGas.price * parseInt(newOrder.qty || "0") : 0;
  const effectivePm = newOrder.pmOverride || selHosp?.paymentMode || "CASH";

  const createOrder = async () => {
    if (!selHosp || !selGas) return;
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hospitalId: selHosp.id,
          paymentMode: effectivePm,
          source: "ISLAND",
          items: [{ gasId: selGas.id, quantity: parseInt(newOrder.qty), price: selGas.price }],
        }),
      });
      if (res.ok) {
        const order = await res.json();
        setOrders((p) => [order, ...p]);
        setModal(null);
        setNewOrder({ hospitalId: "", gasId: "", qty: "1", pmOverride: "" });
      }
    } catch (err) {
      console.error("Failed to create order", err);
    }
  };

  const doDispatch = async () => {
    if (!dispatchOrder || !dispatchTransporter) return;
    try {
      const res = await fetch(`/api/orders/${dispatchOrder.id}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transporterId: parseInt(dispatchTransporter) }),
      });
      if (res.ok) {
        const updated = await res.json();
        setOrders((p) => p.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
        setDispatchOrder(null);
        setDispatchTransporter("");
        setModal(null);
      }
    } catch (err) {
      console.error("Failed to dispatch order", err);
    }
  };

  const cancelOrder = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/cancel`, { method: "POST" });
      if (res.ok) {
        setOrders((p) => p.filter((o) => o.id !== id));
      }
    } catch (err) {
      console.error("Failed to cancel order", err);
    }
  };

  const confirmPOD = async (id: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/pod`, { method: "POST" });
      if (res.ok) {
        const updated = await res.json();
        setOrders((p) => p.map((o) => (o.id === updated.id ? { ...o, ...updated } : o)));
      }
    } catch (err) {
      console.error("Failed to confirm POD", err);
    }
  };

  return (
    <>
      <Header title="Orders" subtitle="Create, dispatch and track all orders" />
      <div className="p-5 flex-1">
        {error && (
          <Alert variant="red">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </Alert>
        )}
        <div className="flex items-center gap-2 mb-3.5">
          <FilterBar filters={filters} active={filter} onChange={setFilter} />
          <Btn size="sm" onClick={() => setModal("new")} className="ml-auto">
            <Plus size={13} />
            New order
          </Btn>
        </div>

        <Card noPad>
          <Table>
            <thead>
              <tr>
                <Th>Order ID</Th>
                <Th>Hospital</Th>
                <Th>Items</Th>
                <Th>Total</Th>
                <Th>Status</Th>
                <Th>Payment</Th>
                <Th>Transporter</Th>
                <Th></Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <Tr key={o.id}>
                  <Td>
                    <span className="font-bold text-brand text-[11.5px]">{o.id}</span>
                  </Td>
                  <Td className="font-medium">{o.hospital?.name}</Td>
                  <Td className="text-text-muted text-[11.5px] max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">
                    {o.items?.map((i) => `${i.quantity}x ${i.gas?.name?.split("(")[0]?.trim() || "Gas"}`).join(", ")}
                  </Td>
                  <Td className="font-semibold">{fmtFull(o.total)}</Td>
                  <Td>
                    <StatusBadge status={o.status} />
                    {o.payStatus === "OVERDUE" && (
                      <span className="ml-1">
                        <StatusBadge status="OVERDUE" />
                      </span>
                    )}
                  </Td>
                  <Td>
                    <PayBadge mode={o.paymentMode} />
                  </Td>
                  <Td className="text-xs text-text-muted">{o.transporter?.name || "\u2014"}</Td>
                  <Td>
                    <div className="flex gap-1.5">
                      {o.status === "PENDING" && (o.payStatus === "PAID" || o.paymentMode === "CREDIT") && (
                        <Btn
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setDispatchOrder(o);
                            setModal("dispatch");
                          }}
                        >
                          <Truck size={11} />
                          Dispatch
                        </Btn>
                      )}
                      {o.status === "PENDING" && (
                        <Btn
                          size="sm"
                          variant="ghost"
                          onClick={() => cancelOrder(o.id)}
                          className="text-red-500"
                        >
                          <XCircle size={11} />
                          Cancel
                        </Btn>
                      )}
                      {o.status === "DISPATCHED" && (
                        <Btn size="sm" variant="ghost" onClick={() => confirmPOD(o.id)} className="text-brand">
                          <CheckCircle size={11} />
                          POD
                        </Btn>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))}
            </tbody>
          </Table>
        </Card>

        {/* New Order Modal */}
        <Modal open={modal === "new"} onClose={() => setModal(null)} title="Create new order">
          <FormGroup label="Hospital">
            <Select
              value={newOrder.hospitalId}
              onChange={(e) => setNewOrder((p) => ({ ...p, hospitalId: e.target.value }))}
            >
              <option value="">Select hospital...</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.paymentMode.toLowerCase()})
                </option>
              ))}
            </Select>
          </FormGroup>
          {selHosp && (
            <Alert variant={effectivePm === "WALLET" && selHosp.walletBalance < orderTotal ? "amber" : "green"}>
              Default payment:{" "}
              <strong>
                {effectivePm === "WALLET" ? `Wallet (Balance: ${fmt(selHosp.walletBalance)})` : effectivePm.toLowerCase()}
              </strong>
              {effectivePm === "WALLET" && selHosp.walletBalance < orderTotal && (
                <span className="ml-1.5">Warning: Insufficient balance</span>
              )}
            </Alert>
          )}
          <FormGroup label="Override payment (optional)">
            <Select
              value={newOrder.pmOverride}
              onChange={(e) => setNewOrder((p) => ({ ...p, pmOverride: e.target.value }))}
            >
              <option value="">Use hospital default</option>
              <option value="WALLET">Wallet</option>
              <option value="CASH">Cash on delivery</option>
              <option value="TRANSFER">Bank transfer</option>
              <option value="CREDIT">Credit NET 30</option>
            </Select>
          </FormGroup>
          <FormGroup label="Gas product">
            <Select
              value={newOrder.gasId}
              onChange={(e) => setNewOrder((p) => ({ ...p, gasId: e.target.value }))}
            >
              <option value="">Select gas...</option>
              {gases.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} — ₦{g.price.toLocaleString()}/{g.name.includes("Bulk") ? "L" : "cylinder"}
                </option>
              ))}
            </Select>
          </FormGroup>
          <FormGroup label="Quantity">
            <Input
              type="number"
              min="1"
              value={newOrder.qty}
              onChange={(e) => setNewOrder((p) => ({ ...p, qty: e.target.value }))}
            />
          </FormGroup>
          {orderTotal > 0 && (
            <div className="bg-bg rounded-lg p-3 mb-3.5 flex justify-between items-center">
              <span className="text-text-muted text-[13px]">Order total</span>
              <span className="font-display font-bold text-xl text-brand">{fmtFull(orderTotal)}</span>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn onClick={createOrder} disabled={!newOrder.hospitalId || !newOrder.gasId || orderTotal === 0}>
              Create order
            </Btn>
          </div>
        </Modal>

        {/* Dispatch Modal */}
        <Modal
          open={modal === "dispatch" && !!dispatchOrder}
          onClose={() => setModal(null)}
          title={`Dispatch ${dispatchOrder?.id || ""}`}
          width="max-w-sm"
        >
          <div className="mb-3 text-text-muted text-xs">
            {dispatchOrder?.hospital?.name} · {dispatchOrder ? fmtFull(dispatchOrder.total) : ""}
          </div>
          <FormGroup label="Assign transporter">
            <Select value={dispatchTransporter} onChange={(e) => setDispatchTransporter(e.target.value)}>
              <option value="">Select...</option>
              {transporters.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.onTimeRate}% on-time · {t.activeCount} active)
                </option>
              ))}
            </Select>
          </FormGroup>
          <div className="flex gap-2 justify-end">
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn onClick={doDispatch} disabled={!dispatchTransporter}>
              <Truck size={13} />
              Dispatch now
            </Btn>
          </div>
        </Modal>
      </div>
    </>
  );
}
