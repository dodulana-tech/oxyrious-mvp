"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, MetricCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Btn } from "@/components/ui/button";
import { Input, Select, FormGroup } from "@/components/ui/form";
import { Modal } from "@/components/ui/modal";

interface Gas {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  minStock: number;
  source: string;
}

interface Hospital {
  id: number;
  name: string;
  area: string;
  markup: number;
}

interface GasForm {
  name: string;
  category: string;
  price: string;
  stock: string;
  minStock: string;
  source: string;
}

const emptyForm: GasForm = {
  name: "",
  category: "OXYGEN",
  price: "",
  stock: "",
  minStock: "",
  source: "ISLAND",
};

const catColor: Record<string, "green" | "amber" | "blue" | "gray"> = {
  OXYGEN: "green",
  ANAESTHETIC: "amber",
  SPECIALTY: "blue",
};

export default function InventoryPage() {
  const [gases, setGases] = useState<Gas[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [editingMarkup, setEditingMarkup] = useState<Record<number, number>>({});
  const [savingMarkup, setSavingMarkup] = useState<number | null>(null);

  // Gas product modal state
  const [productModal, setProductModal] = useState(false);
  const [editingGas, setEditingGas] = useState<Gas | null>(null);
  const [form, setForm] = useState<GasForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  // Stock adjustment modal state
  const [stockModal, setStockModal] = useState(false);
  const [stockGas, setStockGas] = useState<Gas | null>(null);
  const [stockDelta, setStockDelta] = useState("");

  // Delete confirmation
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchGases();
    fetch("/api/hospitals")
      .then((r) => r.json())
      .then((data: Hospital[]) => setHospitals(Array.isArray(data) ? data : []));
  }, []);

  const fetchGases = () => {
    fetch("/api/gases")
      .then((r) => r.json())
      .then(setGases);
  };

  // --- Product modal helpers ---
  const openAddModal = () => {
    setEditingGas(null);
    setForm(emptyForm);
    setProductModal(true);
  };

  const openEditModal = (g: Gas) => {
    setEditingGas(g);
    setForm({
      name: g.name,
      category: g.category,
      price: String(g.price),
      stock: String(g.stock),
      minStock: String(g.minStock),
      source: g.source,
    });
    setProductModal(true);
  };

  const closeProductModal = () => {
    setProductModal(false);
    setEditingGas(null);
    setForm(emptyForm);
  };

  const handleFormChange = (field: keyof GasForm, value: string) => {
    setForm((p) => ({ ...p, [field]: value }));
  };

  const submitProduct = async () => {
    setSaving(true);
    const body = {
      name: form.name,
      category: form.category,
      price: parseFloat(form.price) || 0,
      stock: parseFloat(form.stock) || 0,
      minStock: parseFloat(form.minStock) || 0,
      source: form.source,
    };
    try {
      const url = editingGas ? `/api/gases/${editingGas.id}` : "/api/gases";
      const method = editingGas ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        fetchGases();
        closeProductModal();
      }
    } catch (err) {
      console.error("Failed to save product", err);
    } finally {
      setSaving(false);
    }
  };

  // --- Delete ---
  const confirmDelete = async () => {
    if (deleteId === null) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/gases/${deleteId}`, { method: "DELETE" });
      if (res.ok) {
        setGases((p) => p.filter((g) => g.id !== deleteId));
        setDeleteId(null);
      }
    } catch (err) {
      console.error("Failed to delete product", err);
    } finally {
      setDeleting(false);
    }
  };

  // --- Stock adjustment ---
  const openStockModal = (g: Gas) => {
    setStockGas(g);
    setStockDelta("");
    setStockModal(true);
  };

  const submitStockAdjustment = async () => {
    if (!stockGas) return;
    const delta = parseFloat(stockDelta) || 0;
    if (delta === 0) return;
    const newStock = Math.max(0, stockGas.stock + delta);
    setSaving(true);
    try {
      const res = await fetch(`/api/gases/${stockGas.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stock: newStock }),
      });
      if (res.ok) {
        fetchGases();
        setStockModal(false);
        setStockGas(null);
      }
    } catch (err) {
      console.error("Failed to adjust stock", err);
    } finally {
      setSaving(false);
    }
  };

  // Reference gas: first OXYGEN product for effective price display
  const refGas = gases.find((g) => g.category === "OXYGEN");

  const saveHospitalMarkup = async (hospitalId: number) => {
    const newMarkup = editingMarkup[hospitalId];
    if (newMarkup === undefined) return;
    setSavingMarkup(hospitalId);
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markup: newMarkup }),
      });
      if (res.ok) {
        setHospitals((p) => p.map((h) => (h.id === hospitalId ? { ...h, markup: newMarkup } : h)));
        setEditingMarkup((p) => {
          const next = { ...p };
          delete next[hospitalId];
          return next;
        });
      }
    } catch (err) {
      console.error("Failed to save markup", err);
    } finally {
      setSavingMarkup(null);
    }
  };

  const low = gases.filter((g) => g.stock <= g.minStock * 1.2);

  return (
    <>
      <Header title="Inventory" subtitle="Gas products, stock levels and sourcing" />
      <div className="p-5 flex-1">
        {low.length > 0 && (
          <Alert variant="amber">
            <span>
              <strong>{low.length} product(s) low on stock.</strong> Review and reorder from your suppliers.
            </span>
          </Alert>
        )}

        <div className="grid grid-cols-3 gap-3 mb-4">
          <MetricCard label="Total SKUs" value={String(gases.length)} sub="All gas products" accent="green" />
          <MetricCard label="Low stock" value={String(low.length)} sub="Needs attention" accent="amber" />
          <MetricCard
            label="Island sourced"
            value={String(gases.filter((g) => g.source === "ISLAND").length)}
            sub={`${gases.filter((g) => g.source === "MAINLAND").length} from mainland`}
            accent="blue"
          />
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-sm">Gas Products</h2>
          <Btn size="sm" onClick={openAddModal}>+ Add product</Btn>
        </div>

        <Card noPad>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Product", "Category", "Unit price", "Stock", "Level", "Source", "Actions"].map((h) => (
                    <th
                      key={h}
                      className="text-left text-[10px] uppercase tracking-wider text-text-muted p-2.5 border-b border-border font-medium"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {gases.map((g) => {
                  const pct = Math.min(100, (g.stock / (g.minStock * 3)) * 100);
                  const isLow = g.stock <= g.minStock * 1.2;
                  return (
                    <tr key={g.id} className="border-b border-border/50">
                      <td className="p-2.5 font-medium text-xs">{g.name}</td>
                      <td className="p-2.5">
                        <Badge color={catColor[g.category] || "gray"}>
                          {g.category.toLowerCase()}
                        </Badge>
                      </td>
                      <td className="p-2.5 font-medium text-xs">₦{g.price.toLocaleString()}</td>
                      <td className="p-2.5">
                        <span className={`font-semibold text-xs ${isLow ? "text-red-500" : "text-text-primary"}`}>
                          {g.stock.toLocaleString()}
                        </span>
                      </td>
                      <td className="p-2.5">
                        <div className="w-[90px] bg-border rounded-sm h-[5px] overflow-hidden">
                          <div
                            className={`h-full rounded-sm ${isLow ? "bg-red-500" : pct < 50 ? "bg-amber-500" : "bg-emerald-500"}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </td>
                      <td className="p-2.5">
                        <Badge color={g.source === "ISLAND" ? "green" : "blue"}>
                          {g.source === "ISLAND" ? "Island partner" : "Mainland"}
                        </Badge>
                      </td>
                      <td className="p-2.5">
                        <div className="flex gap-1">
                          <Btn size="sm" variant="ghost" onClick={() => openStockModal(g)}>+/- Stock</Btn>
                          <Btn size="sm" variant="ghost" onClick={() => openEditModal(g)}>Edit</Btn>
                          <Btn size="sm" variant="danger" onClick={() => setDeleteId(g.id)}>Delete</Btn>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {gases.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-4 text-center text-text-muted text-xs">
                      No gas products found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Hospital Pricing Section */}
        <div className="mt-6">
          <h2 className="font-display font-bold text-sm mb-3">Hospital Pricing</h2>
          {refGas && (
            <div className="text-[11px] text-text-muted mb-2">
              Reference product: {refGas.name} — Base price: ₦{refGas.price.toLocaleString()}
            </div>
          )}
          <Card noPad>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Hospital", "Area", "Markup %", refGas ? `Effective price (${refGas.name.split("(")[0].trim()})` : "Effective price", "Actions"].map((h) => (
                      <th
                        key={h}
                        className="text-left text-[10px] uppercase tracking-wider text-text-muted p-2.5 border-b border-border font-medium"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {hospitals.map((h) => {
                    const isEditing = editingMarkup[h.id] !== undefined;
                    const currentMarkup = isEditing ? editingMarkup[h.id] : h.markup;
                    const ep = refGas
                      ? Math.round(refGas.price * (1 + currentMarkup / 100) * 100) / 100
                      : null;
                    return (
                      <tr key={h.id} className="border-b border-border/50">
                        <td className="p-2.5 font-medium text-xs">{h.name}</td>
                        <td className="p-2.5 text-text-muted text-xs">{h.area}</td>
                        <td className="p-2.5">
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={currentMarkup}
                              onChange={(e) =>
                                setEditingMarkup((p) => ({
                                  ...p,
                                  [h.id]: parseFloat(e.target.value) || 0,
                                }))
                              }
                              className="w-[70px] text-xs"
                            />
                            <span className="text-[11px] text-text-muted">%</span>
                          </div>
                        </td>
                        <td className="p-2.5">
                          {ep !== null ? (
                            <span className="font-medium text-xs">
                              ₦{ep.toLocaleString()}
                              {currentMarkup !== 0 && (
                                <span className={`ml-1 text-[10px] ${currentMarkup > 0 ? "text-red-500" : "text-emerald-500"}`}>
                                  ({currentMarkup > 0 ? "+" : ""}{currentMarkup}%)
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="text-text-muted text-xs">—</span>
                          )}
                        </td>
                        <td className="p-2.5">
                          {isEditing && (
                            <div className="flex gap-1">
                              <Btn
                                size="sm"
                                onClick={() => saveHospitalMarkup(h.id)}
                                disabled={savingMarkup === h.id}
                              >
                                {savingMarkup === h.id ? "Saving..." : "Save"}
                              </Btn>
                              <Btn
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  setEditingMarkup((p) => {
                                    const next = { ...p };
                                    delete next[h.id];
                                    return next;
                                  })
                                }
                              >
                                Cancel
                              </Btn>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {hospitals.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-text-muted text-xs">
                        No hospitals found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>

      {/* Add / Edit Gas Product Modal */}
      <Modal open={productModal} onClose={closeProductModal} title={editingGas ? "Edit product" : "Add product"}>
        <div className="space-y-0">
          <FormGroup label="Product name">
            <Input
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
              placeholder="e.g. Medical Oxygen (50L)"
            />
          </FormGroup>
          <FormGroup label="Category">
            <Select value={form.category} onChange={(e) => handleFormChange("category", e.target.value)}>
              <option value="OXYGEN">Oxygen</option>
              <option value="ANAESTHETIC">Anaesthetic</option>
              <option value="SPECIALTY">Specialty</option>
            </Select>
          </FormGroup>
          <div className="grid grid-cols-3 gap-3">
            <FormGroup label="Unit price (₦)">
              <Input
                type="number"
                value={form.price}
                onChange={(e) => handleFormChange("price", e.target.value)}
                placeholder="0"
              />
            </FormGroup>
            <FormGroup label="Stock">
              <Input
                type="number"
                value={form.stock}
                onChange={(e) => handleFormChange("stock", e.target.value)}
                placeholder="0"
              />
            </FormGroup>
            <FormGroup label="Min stock">
              <Input
                type="number"
                value={form.minStock}
                onChange={(e) => handleFormChange("minStock", e.target.value)}
                placeholder="0"
              />
            </FormGroup>
          </div>
          <FormGroup label="Source region">
            <Select value={form.source} onChange={(e) => handleFormChange("source", e.target.value)}>
              <option value="ISLAND">Island</option>
              <option value="MAINLAND">Mainland</option>
            </Select>
          </FormGroup>
          <div className="flex justify-end gap-2 pt-2">
            <Btn size="sm" variant="ghost" onClick={closeProductModal}>Cancel</Btn>
            <Btn size="sm" onClick={submitProduct} disabled={saving || !form.name.trim()}>
              {saving ? "Saving..." : editingGas ? "Update product" : "Add product"}
            </Btn>
          </div>
        </div>
      </Modal>

      {/* Stock Adjustment Modal */}
      <Modal open={stockModal} onClose={() => { setStockModal(false); setStockGas(null); }} title="Adjust stock">
        {stockGas && (
          <div>
            <div className="text-xs text-text-muted mb-3">
              <strong>{stockGas.name}</strong> — Current stock: <strong>{stockGas.stock.toLocaleString()}</strong>
            </div>
            <FormGroup label="Adjustment (use negative to subtract)">
              <Input
                type="number"
                value={stockDelta}
                onChange={(e) => setStockDelta(e.target.value)}
                placeholder="e.g. 10 or -5"
              />
            </FormGroup>
            {stockDelta && (
              <div className="text-[11px] text-text-muted mb-3">
                New stock will be: <strong>{Math.max(0, stockGas.stock + (parseFloat(stockDelta) || 0)).toLocaleString()}</strong>
              </div>
            )}
            <div className="flex justify-end gap-2 pt-2">
              <Btn size="sm" variant="ghost" onClick={() => { setStockModal(false); setStockGas(null); }}>Cancel</Btn>
              <Btn size="sm" onClick={submitStockAdjustment} disabled={saving || !stockDelta}>
                {saving ? "Saving..." : "Update stock"}
              </Btn>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={deleteId !== null} onClose={() => setDeleteId(null)} title="Delete product">
        <div>
          <p className="text-xs text-text-muted mb-4">
            Are you sure you want to delete <strong>{gases.find((g) => g.id === deleteId)?.name}</strong>? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-2">
            <Btn size="sm" variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Btn>
            <Btn size="sm" variant="danger" onClick={confirmDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Btn>
          </div>
        </div>
      </Modal>
    </>
  );
}
