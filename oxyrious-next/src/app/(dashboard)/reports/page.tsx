"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { Badge, StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import { FormGroup, Select, inputClass } from "@/components/ui/form";
import { fmt, fmtFull } from "@/lib/utils";

interface Hospital {
  id: number;
  name: string;
  contact: string;
  area: string;
  paymentMode: string;
  walletBalance: number;
  discount: number;
  streak: number;
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
  hospitalId: number;
  hospital: { name: string };
  items: OrderItem[];
  total: number;
  status: string;
}

export default function ReportsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [selId, setSelId] = useState<number | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [sendChannel, setSendChannel] = useState<"WHATSAPP" | "EMAIL">("WHATSAPP");
  const [sending, setSending] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sendResult, setSendResult] = useState<{ status: string; message: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [hosRes, ordRes] = await Promise.all([
          fetch("/api/hospitals"),
          fetch("/api/orders"),
        ]);
        if (!hosRes.ok) throw new Error("Failed to load hospitals");
        if (!ordRes.ok) throw new Error("Failed to load orders");
        const h = await hosRes.json();
        const o = await ordRes.json();
        const hosArr = Array.isArray(h) ? h : [];
        const ordArr = Array.isArray(o) ? o : [];
        setHospitals(hosArr);
        setOrders(ordArr);
        if (hosArr.length > 0 && !selId) setSelId(hosArr[0].id);
      } catch (err) {
        console.error("Reports page load error:", err);
      }
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const h = hospitals.find((x) => x.id === selId) || hospitals[0];
  const hOrders = h ? orders.filter((o) => o.hospitalId === h.id && o.status === "DELIVERED") : [];
  const monthSpend = hOrders.reduce((s, o) => s + o.total, 0);

  async function handleDownloadPdf() {
    if (!h) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId: h.id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate report");

      // Decode base64 and trigger download
      const byteChars = atob(data.pdf);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) {
        byteNumbers[i] = byteChars.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
      alert("Failed to download PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function handleSendReport() {
    if (!h) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/reports/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId: h.id, channel: sendChannel }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send report");

      setSendResult({
        status: "success",
        message: `Report ${data.status === "SENT" ? "sent" : "queued"} via ${sendChannel} successfully.`,
      });
      setTimeout(() => {
        setModal(null);
        setSendResult(null);
      }, 2000);
    } catch (err) {
      console.error("Send error:", err);
      setSendResult({
        status: "error",
        message: "Failed to send report. Please try again.",
      });
    } finally {
      setSending(false);
    }
  }

  if (!h) {
    return (
      <>
        <Header title="Reports" subtitle="Monthly supply reports for each hospital" />
        <div className="p-5 flex-1">
          <Card>
            <div className="text-center text-text-muted py-5">Loading...</div>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Reports" subtitle="Monthly supply reports for each hospital" />
      <div className="p-5 flex-1">
        <div className="flex gap-4 items-start">
          {/* Report preview */}
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-center mb-3.5">
              <div className="font-display text-[13px] font-bold">Generate monthly supply report</div>
              <select
                className={`${inputClass} w-[220px] text-xs`}
                value={selId ?? ""}
                onChange={(e) => setSelId(parseInt(e.target.value))}
              >
                {hospitals.map((hosp) => (
                  <option key={hosp.id} value={hosp.id}>
                    {hosp.name}
                  </option>
                ))}
              </select>
            </div>

            <Card className="bg-bg border border-border">
              {/* Report header */}
              <div className="text-center mb-4 pb-3.5 border-b border-border">
                <div className="font-display text-lg font-extrabold text-brand mb-0.5">
                  Oxy<span className="text-text-primary">rious</span>
                </div>
                <div className="text-[11px] text-text-muted">Monthly Supply Report — March 2025</div>
                <div className="font-display text-[15px] font-bold mt-2.5">{h.name}</div>
                <div className="text-[11px] text-text-muted">
                  {h.area} · Prepared for: {h.contact}
                </div>
              </div>

              {/* Summary metrics */}
              <div className="grid grid-cols-4 gap-2.5 mb-3.5">
                {(
                  [
                    [String(hOrders.length), "Deliveries", "text-brand"],
                    [`₦${(monthSpend / 1000).toFixed(0)}K`, "Total spend", "text-text-primary"],
                    ["0", "Missed", "text-brand"],
                    [`${h.streak}d`, "Streak", h.streak >= 200 ? "text-emerald-500" : h.streak >= 100 ? "text-amber-500" : "text-slate-400"],
                  ] as const
                ).map(([v, l, c]) => (
                  <div key={l} className="bg-bg-card border border-border rounded-lg p-2.5 text-center">
                    <div className={`font-display text-xl font-bold leading-none mb-1 ${c}`}>{v}</div>
                    <div className="text-[10px] text-text-muted uppercase tracking-wider">{l}</div>
                  </div>
                ))}
              </div>

              {/* Supply continuity */}
              <div className="mb-3 p-2.5 bg-bg-card rounded-[7px] border-l-[3px] border-l-emerald-500">
                <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1">Supply continuity score</div>
                <div className="font-display text-base font-bold text-brand">
                  {h.streak} consecutive days — 0 missed deliveries
                </div>
                <div className="text-[11px] text-text-muted mt-0.5">
                  Top {h.streak >= 200 ? "10" : "25"}% of all Oxyrious clients
                </div>
              </div>

              {/* Orders table */}
              <table className="w-full border-collapse text-[11.5px]">
                <thead>
                  <tr>
                    {["Order", "Items", "Amount", "Status"].map((col) => (
                      <th
                        key={col}
                        className="text-left text-[10px] uppercase tracking-wider text-text-muted py-2 border-b border-border"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders
                    .filter((o) => o.hospitalId === h.id)
                    .slice(0, 3)
                    .map((o) => (
                      <tr key={o.id}>
                        <td className="py-2 border-b border-border text-brand font-semibold">{o.id}</td>
                        <td className="py-2 border-b border-border text-text-muted">
                          {o.items?.map((i) => `${i.quantity}x ${i.gas?.name?.split("(")[0]?.trim() || "Gas"}`).join(", ")}
                        </td>
                        <td className="py-2 border-b border-border font-semibold">{fmtFull(o.total)}</td>
                        <td className="py-2 border-b border-border">
                          <StatusBadge status={o.status} />
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>

              {/* Wallet info */}
              {h.paymentMode === "WALLET" && (
                <div className="mt-3 p-2.5 bg-bg-card rounded-[7px]">
                  <div className="text-[10px] uppercase tracking-wider text-text-muted mb-1.5">Wallet account</div>
                  <div className="flex justify-between mb-1">
                    <span className="text-xs">Current balance</span>
                    <span className="font-bold text-brand">{fmt(h.walletBalance)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-xs">Discount tier</span>
                    <span className="font-bold text-brand">{h.discount}% active</span>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="mt-3.5 pt-3 border-t border-border text-[11px] text-text-muted text-center">
                Oxyrious · Medical Oxygen. Elevated. · Lagos, Nigeria · Report auto-generated
              </div>
            </Card>

            <div className="flex gap-2.5 mt-3.5">
              <Btn onClick={() => { setSendResult(null); setModal("send"); }}>
                Send via WhatsApp to {h.contact}
              </Btn>
              <Btn variant="ghost" onClick={handleDownloadPdf} disabled={downloading}>
                {downloading ? "Generating..." : "Download PDF"}
              </Btn>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-[240px] shrink-0">
            <Card className="mb-3">
              <div className="font-display text-xs font-bold mb-2.5">Report schedule</div>
              <div className="text-xs text-text-muted mb-3">Auto-send on 1st of each month</div>
              {hospitals.map((hosp) => (
                <div
                  key={hosp.id}
                  className="flex items-center justify-between py-1.5 border-b border-border"
                >
                  <span className="text-xs">{hosp.name}</span>
                  <Badge color="green">Active</Badge>
                </div>
              ))}
              <div className="mt-2.5 text-[11px] text-text-muted">Next send: 1st of next month</div>
            </Card>
            <Card>
              <div className="font-display text-xs font-bold mb-2">Why this works</div>
              <div className="text-xs text-text-secondary leading-relaxed">
                COOs share this report with their board and peers. It positions Oxyrious as a strategic supply partner — not
                just a vendor. The supply streak metric is the one number they will screenshot.
              </div>
            </Card>
          </div>
        </div>

        {/* Send modal */}
        <Modal
          open={modal === "send"}
          onClose={() => setModal(null)}
          title="Send report"
          width="max-w-sm"
        >
          {sendResult ? (
            <Alert variant={sendResult.status === "success" ? "green" : "red"}>
              {sendResult.message}
            </Alert>
          ) : (
            <Alert variant="green">
              Report will be sent to {h.contact} at {h.name}.
            </Alert>
          )}
          <FormGroup label="Channel">
            <Select
              value={sendChannel}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setSendChannel(e.target.value as "WHATSAPP" | "EMAIL")
              }
            >
              <option value="WHATSAPP">WhatsApp</option>
              <option value="EMAIL">Email</option>
            </Select>
          </FormGroup>
          <div className="flex gap-2 justify-end">
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn onClick={handleSendReport} disabled={sending}>
              {sending ? "Sending..." : "Send report"}
            </Btn>
          </div>
        </Modal>
      </div>
    </>
  );
}
