"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/tabs";
import { Table, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge, PayBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { FormGroup, Select, Input } from "@/components/ui/form";
import { Alert } from "@/components/ui/alert";
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
  hospitalId: number;
  hospital: { id: number; name: string };
  items: OrderItem[];
  total: number;
  status: string;
  paymentMode: string;
  payStatus: string;
  date: string;
  transporter: { name: string } | null;
}

interface Gas {
  id: number;
  name: string;
  price: number;
  stock: number;
}

export default function HospitalOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [gases, setGases] = useState<Gas[]>([]);
  const [markup, setMarkup] = useState(0);
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [newOrder, setNewOrder] = useState({ gasId: "", qty: "1" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [ordRes, gasRes, meRes] = await Promise.all([
          fetch("/api/hospital/orders"),
          fetch("/api/gases"),
          fetch("/api/hospital/me"),
        ]);
        if (!ordRes.ok) throw new Error("Failed to load orders");
        if (!gasRes.ok) throw new Error("Failed to load gas products");
        if (!meRes.ok) throw new Error("Failed to load hospital data");
        const o = await ordRes.json();
        const g = await gasRes.json();
        const me = await meRes.json();
        setOrders(Array.isArray(o) ? o : []);
        setGases(Array.isArray(g) ? g : []);
        setMarkup(me.markup ?? 0);
      } catch (err) {
        console.error("Hospital orders load error:", err);
        setLoadError(err instanceof Error ? err.message : "Failed to load data");
      }
    }
    load();
  }, []);

  // Helper to compute effective price with hospital markup
  const effectivePrice = (basePrice: number) =>
    Math.round(basePrice * (1 + markup / 100) * 100) / 100;

  const filters = ["all", "PENDING", "DISPATCHED", "IN_TRANSIT", "DELIVERED"];
  const filtered = orders.filter((o) => filter === "all" || o.status === filter);

  const selGas = gases.find((g) => g.id === parseInt(newOrder.gasId));
  const orderTotal = selGas ? effectivePrice(selGas.price) * parseInt(newOrder.qty || "0") : 0;

  const createOrder = async () => {
    if (!selGas) return;
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/hospital/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: [{ gasId: selGas.id, quantity: parseInt(newOrder.qty), price: effectivePrice(selGas.price) }],
        }),
      });
      if (res.ok) {
        const order = await res.json();
        setOrders((p) => [order, ...p]);
        setModalOpen(false);
        setNewOrder({ gasId: "", qty: "1" });
      } else {
        const data = await res.json();
        setError(data.error || "Failed to create order");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header title="My Orders" subtitle="View and place orders for medical gases" />
      <div className="p-5 flex-1">
        {loadError && (
          <Alert variant="red">{loadError}</Alert>
        )}
        <div className="flex items-center gap-2 mb-3.5">
          <FilterBar filters={filters} active={filter} onChange={setFilter} />
          <Btn size="sm" onClick={() => setModalOpen(true)} className="ml-auto">
            <Plus size={13} />
            New Order
          </Btn>
        </div>

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
              {filtered.length === 0 ? (
                <Tr>
                  <Td colSpan={6} className="text-center text-text-muted py-6">
                    No orders found
                  </Td>
                </Tr>
              ) : (
                filtered.map((o) => (
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
                        year: "numeric",
                      })}
                    </Td>
                  </Tr>
                ))
              )}
            </tbody>
          </Table>
        </Card>

        {/* New Order Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Place New Order">
          {error && <Alert variant="red">{error}</Alert>}
          <FormGroup label="Gas Product">
            <Select
              value={newOrder.gasId}
              onChange={(e) => setNewOrder((p) => ({ ...p, gasId: e.target.value }))}
            >
              <option value="">Select gas...</option>
              {gases.map((g) => {
                const ep = effectivePrice(g.price);
                const hasMarkup = markup !== 0;
                return (
                  <option key={g.id} value={g.id}>
                    {g.name} — {fmtFull(ep)}/{g.name.includes("Bulk") ? "L" : "cylinder"}
                    {hasMarkup ? ` (base: ${fmtFull(g.price)})` : ""}
                    {g.stock <= 0 ? " (Out of stock)" : ""}
                  </option>
                );
              })}
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
            <div className="bg-bg rounded-lg p-3 mb-3.5">
              <div className="flex justify-between items-center">
                <span className="text-text-muted text-[13px]">Order total</span>
                <span className="font-display font-bold text-xl text-brand">
                  {fmtFull(orderTotal)}
                </span>
              </div>
              {markup !== 0 && (
                <div className="text-[11px] text-text-muted mt-1 text-right">
                  {markup > 0 ? `+${markup}% markup applied` : `${markup}% discount applied`}
                </div>
              )}
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Btn variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Btn>
            <Btn
              onClick={createOrder}
              disabled={!newOrder.gasId || orderTotal === 0 || submitting}
            >
              {submitting ? "Placing..." : "Place Order"}
            </Btn>
          </div>
        </Modal>
      </div>
    </>
  );
}
