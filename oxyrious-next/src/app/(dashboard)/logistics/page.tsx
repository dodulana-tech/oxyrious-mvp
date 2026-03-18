"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, MetricCard } from "@/components/ui/card";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Btn } from "@/components/ui/button";
import { FormGroup, Input } from "@/components/ui/form";
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

const emptyForm = { name: "", driver: "", phone: "" };

export default function LogisticsPage() {
  const [transporters, setTransporters] = useState<Transporter[]>([]);
  const [activeDeliveries, setActiveDeliveries] = useState<Order[]>([]);

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Transporter | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Transporter | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = () => {
    Promise.all([
      fetch("/api/transporters").then((r) => r.json()),
      fetch("/api/orders?status=DISPATCHED").then((r) => r.json()),
      fetch("/api/orders?status=IN_TRANSIT").then((r) => r.json()),
    ]).then(([t, dispatched, inTransit]) => {
      setTransporters(t);
      setActiveDeliveries([...dispatched, ...inTransit]);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  /* ---- modal helpers ---- */

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEdit = (t: Transporter) => {
    setEditing(t);
    setForm({ name: t.name, driver: t.driver, phone: t.phone });
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editing) {
        await fetch(`/api/transporters/${editing.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      } else {
        await fetch("/api/transporters", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
      }
      closeForm();
      loadData();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await fetch(`/api/transporters/${deleteTarget.id}`, { method: "DELETE" });
      setDeleteTarget(null);
      loadData();
    } finally {
      setDeleting(false);
    }
  };

  /* ---- derived metrics ---- */

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
            <div className="flex items-center justify-between mb-3">
              <div className="font-display text-[13px] font-bold">Transporters</div>
              <Btn variant="primary" size="sm" onClick={openAdd}>
                + Add transporter
              </Btn>
            </div>
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
                  <div className="bg-bg rounded-sm h-1 overflow-hidden mb-2.5">
                    <div
                      className={`h-full rounded-sm ${t.onTimeRate >= 90 ? "bg-emerald-500" : "bg-amber-500"}`}
                      style={{ width: `${t.onTimeRate}%` }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Btn variant="ghost" size="sm" onClick={() => openEdit(t)}>
                      Edit
                    </Btn>
                    <Btn variant="danger" size="sm" onClick={() => setDeleteTarget(t)}>
                      Delete
                    </Btn>
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

      {/* Add / Edit transporter modal */}
      <Modal open={formOpen} onClose={closeForm} title={editing ? "Edit transporter" : "Add transporter"}>
        <div className="flex flex-col gap-3">
          <FormGroup label="Name">
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Transporter name"
            />
          </FormGroup>
          <FormGroup label="Driver">
            <Input
              value={form.driver}
              onChange={(e) => setForm({ ...form, driver: e.target.value })}
              placeholder="Driver name"
            />
          </FormGroup>
          <FormGroup label="Phone">
            <Input
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              placeholder="Phone number"
            />
          </FormGroup>
          <div className="flex justify-end gap-2 mt-2">
            <Btn variant="ghost" size="md" onClick={closeForm}>
              Cancel
            </Btn>
            <Btn
              variant="primary"
              size="md"
              onClick={handleSave}
              disabled={saving || !form.name.trim() || !form.driver.trim() || !form.phone.trim()}
            >
              {saving ? "Saving..." : editing ? "Update" : "Add"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Delete confirmation modal */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete transporter">
        <p className="text-sm text-text-muted mb-4">
          Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <Btn variant="ghost" size="md" onClick={() => setDeleteTarget(null)}>
            Cancel
          </Btn>
          <Btn variant="danger" size="md" onClick={handleDelete} disabled={deleting}>
            {deleting ? "Deleting..." : "Delete"}
          </Btn>
        </div>
      </Modal>
    </>
  );
}
