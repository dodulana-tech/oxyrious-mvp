"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card, MetricCard } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Btn } from "@/components/ui/button";
import { Input } from "@/components/ui/form";

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

  useEffect(() => {
    fetch("/api/gases")
      .then((r) => r.json())
      .then(setGases);
    fetch("/api/hospitals")
      .then((r) => r.json())
      .then((data: Hospital[]) => setHospitals(Array.isArray(data) ? data : []));
  }, []);

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

        <Card noPad>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Product", "Category", "Unit price", "Stock", "Level", "Source"].map((h) => (
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
                    </tr>
                  );
                })}
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
    </>
  );
}
