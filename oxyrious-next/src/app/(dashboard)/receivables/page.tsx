"use client";

import { useState, useEffect } from "react";
import { Send, CheckCircle, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, MetricCard } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { Table, Th, Tr, Td } from "@/components/ui/table";
import { StatusBadge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import { FormGroup, Select, inputClass } from "@/components/ui/form";
import { DetailPanel } from "@/components/ui/detail-panel";
import { fmt, fmtFull } from "@/lib/utils";

interface Receivable {
  id: string;
  hospitalId: number;
  hospital: { name: string; contact: string };
  amount: number;
  dueDate: string;
  daysOverdue: number;
  status: string;
  reminders: number;
}

const reminderSteps = [
  { d: "On invoice", l: "Delivered via WhatsApp + email", done: true },
  { d: "Day 7", l: "Friendly reminder sent", done: true },
  { d: "Day 14", l: "Second reminder + link", done: true },
  { d: "Day 25", l: "Urgent alert", done: true },
  { d: "Day 30", l: "Due date — flag account", done: false, now: true },
  { d: "Day 35+", l: "Delivery hold on new orders", done: false },
];

export default function ReceivablesPage() {
  const [recs, setRecs] = useState<Receivable[]>([]);
  const [tab, setTab] = useState("invoices");
  const [sel, setSel] = useState<string | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [remindChannel, setRemindChannel] = useState<"SMS" | "WHATSAPP">("SMS");
  const [remindMsg, setRemindMsg] = useState("");
  const [remindTarget, setRemindTarget] = useState<Receivable | null>(null);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/receivables");
        if (!res.ok) throw new Error("Failed to load receivables");
        const data = await res.json();
        setRecs(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Receivables load error:", err);
      }
    }
    load();
  }, []);

  const sc = sel ? recs.find((r) => r.id === sel) || null : null;
  const total = recs.filter((r) => r.status !== "PAID").reduce((s, r) => s + r.amount, 0);
  const ov = recs.filter((r) => r.status === "OVERDUE").reduce((s, r) => s + r.amount, 0);
  const overdueCount = recs.filter((r) => r.status === "OVERDUE").length;

  const markPaid = async (id: string) => {
    try {
      const res = await fetch(`/api/receivables/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "PAID" }),
      });
      if (!res.ok) throw new Error("Failed to mark as paid");
      setRecs((p) => p.map((x) => (x.id === id ? { ...x, status: "PAID" } : x)));
    } catch (err) {
      console.error("Failed to mark receivable as paid:", err);
    }
  };

  const dueFormatted = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
    } catch {
      return d;
    }
  };

  return (
    <>
      <Header title="Receivables" subtitle="Outstanding invoices and reminder workflows" />
      <div className="p-5 flex-1">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <MetricCard
            label="Outstanding"
            value={fmt(total)}
            sub={`${recs.filter((r) => r.status !== "PAID").length} invoices`}
            accent="amber"
          />
          <MetricCard label="Overdue" value={fmt(ov)} sub="Action required" accent="red" />
          <MetricCard label="Avg days to pay" value="17d" sub="Down 4 days vs last quarter" accent="green" />
        </div>

        {ov > 0 && (
          <Alert variant="red">
            <AlertTriangle size={14} className="shrink-0 mt-0.5" />
            <span>
              <strong>Action required:</strong> {overdueCount} invoice(s) overdue. Automated reminders sent.
            </span>
          </Alert>
        )}

        <Tabs
          tabs={["invoices", "log"]}
          active={tab}
          onChange={setTab}
        />

        {tab === "invoices" && (
          <div className="flex gap-3.5">
            <Card noPad className="flex-1 min-w-0">
              <Table>
                <thead>
                  <tr>
                    <Th>Invoice</Th>
                    <Th>Hospital</Th>
                    <Th>Amount</Th>
                    <Th>Due date</Th>
                    <Th>Status</Th>
                    <Th>Reminders</Th>
                    <Th></Th>
                  </tr>
                </thead>
                <tbody>
                  {recs.map((r) => (
                    <Tr
                      key={r.id}
                      onClick={() => setSel(r.id)}
                      highlight={sc?.id === r.id}
                      className="cursor-pointer"
                    >
                      <Td>
                        <span className="font-bold text-brand text-[11.5px]">{r.id}</span>
                      </Td>
                      <Td className="font-medium">{r.hospital?.name}</Td>
                      <Td className="font-semibold">{fmtFull(r.amount)}</Td>
                      <Td>
                        <div>{dueFormatted(r.dueDate)}</div>
                        {r.daysOverdue > 0 && (
                          <div className="text-[10.5px] text-red-500">{r.daysOverdue}d overdue</div>
                        )}
                      </Td>
                      <Td>
                        <StatusBadge status={r.status} />
                      </Td>
                      <Td>
                        <span className="bg-slate-500/10 text-slate-400 px-2 py-0.5 rounded-full text-[10.5px]">
                          {r.reminders} sent
                        </span>
                      </Td>
                      <Td onClick={(e) => e.stopPropagation()}>
                        <div className="flex gap-1.5">
                          <Btn size="sm" variant="ghost" onClick={() => {
                            setRemindTarget(r);
                            setRemindMsg(`Dear ${r.hospital?.name}, invoice ${r.id} for ${fmtFull(r.amount)} is ${r.daysOverdue > 0 ? `${r.daysOverdue} day(s) overdue` : "due soon"}. Please settle urgently to avoid a delivery hold. — Oxyrious team`);
                            setRemindChannel("SMS");
                            setSendResult(null);
                            setModal("remind");
                          }}>
                            <Send size={11} />
                            Remind
                          </Btn>
                          <Btn size="sm" variant="ghost" onClick={() => markPaid(r.id)} className="text-brand">
                            <CheckCircle size={11} />
                            Paid
                          </Btn>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Card>

            {sc && (
              <DetailPanel>
                <Card>
                  <div className="flex justify-between mb-2.5">
                    <div className="font-display text-xs font-bold">{sc.id}</div>
                    <Btn size="sm" variant="ghost" onClick={() => setSel(null)}>
                      ✕
                    </Btn>
                  </div>
                  <div className="font-medium mb-1">{sc.hospital?.name}</div>
                  <div
                    className={`font-display text-[22px] font-bold mb-3 ${sc.status === "OVERDUE" ? "text-red-500" : "text-amber-500"}`}
                  >
                    {fmtFull(sc.amount)}
                  </div>

                  <div className="border-t border-border pt-3 mb-2.5 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
                    Reminder timeline
                  </div>
                  <div className="relative pl-4.5">
                    <div className="absolute left-[5px] top-0 bottom-0 w-px bg-border" />
                    {reminderSteps.map((s, i) => (
                      <div key={i} className="relative pb-3">
                        <div
                          className={`absolute -left-[15px] top-1 w-[7px] h-[7px] rounded-full border-2 ${
                            s.done
                              ? "bg-emerald-500 border-emerald-500"
                              : s.now
                                ? "bg-amber-500 border-amber-500"
                                : "bg-bg-card border-slate-600"
                          }`}
                        />
                        <div className="text-[11.5px] font-medium">{s.d}</div>
                        <div className="text-[10.5px] text-text-muted mt-px">{s.l}</div>
                      </div>
                    ))}
                  </div>
                </Card>
              </DetailPanel>
            )}
          </div>
        )}

        {tab === "log" && (
          <Card noPad>
            <Table>
              <thead>
                <tr>
                  <Th>Hospital</Th>
                  <Th>Invoice</Th>
                  <Th>Channel</Th>
                  <Th>Message</Th>
                  <Th>Sent</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                <Tr>
                  <Td className="font-medium">EKO Hospital</Td>
                  <Td className="text-text-muted text-[11px]">INV-0084</Td>
                  <Td>
                    <span className="bg-blue-500/12 text-blue-400 px-2 py-0.5 rounded-full text-[10.5px]">SMS</span>
                  </Td>
                  <Td className="text-text-muted text-[11px] max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
                    Invoice ₦144,000 is 1 day overdue...
                  </Td>
                  <Td className="text-text-muted text-[11px]">Mar 14 09:00</Td>
                  <Td>
                    <StatusBadge status="CURRENT" />
                  </Td>
                </Tr>
                <Tr>
                  <Td className="font-medium">EKO Hospital</Td>
                  <Td className="text-text-muted text-[11px]">INV-0084</Td>
                  <Td>
                    <span className="bg-emerald-500/12 text-emerald-400 px-2 py-0.5 rounded-full text-[10.5px]">
                      WhatsApp
                    </span>
                  </Td>
                  <Td className="text-text-muted text-[11px] max-w-[220px] overflow-hidden text-ellipsis whitespace-nowrap">
                    Reminder: Invoice due March 13...
                  </Td>
                  <Td className="text-text-muted text-[11px]">Mar 10 10:30</Td>
                  <Td>
                    <StatusBadge status="DELIVERED" />
                  </Td>
                </Tr>
              </tbody>
            </Table>
          </Card>
        )}

        {/* Remind modal */}
        <Modal open={modal === "remind"} onClose={() => { setModal(null); setSendResult(null); }} title="Send reminder" width="max-w-sm">
          {sendResult && (
            <Alert variant={sendResult.ok ? "green" : "red"}>
              {sendResult.ok ? <CheckCircle size={14} className="shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="shrink-0 mt-0.5" />}
              <span>{sendResult.text}</span>
            </Alert>
          )}
          <FormGroup label="Channel">
            <Select value={remindChannel} onChange={(e) => setRemindChannel(e.target.value as "SMS" | "WHATSAPP")}>
              <option value="SMS">SMS (Termii)</option>
              <option value="WHATSAPP">WhatsApp (Termii)</option>
            </Select>
          </FormGroup>
          <FormGroup label="Message">
            <textarea
              rows={4}
              className={`${inputClass} resize-y`}
              value={remindMsg}
              onChange={(e) => setRemindMsg(e.target.value)}
            />
          </FormGroup>
          <div className="flex gap-2 justify-end">
            <Btn variant="ghost" onClick={() => { setModal(null); setSendResult(null); }}>
              Cancel
            </Btn>
            <Btn
              disabled={sending}
              onClick={async () => {
                if (!remindTarget) return;
                setSending(true);
                setSendResult(null);
                try {
                  const res = await fetch("/api/notifications/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      hospitalId: remindTarget.hospitalId,
                      channel: remindChannel,
                      message: remindMsg,
                    }),
                  });
                  const data = await res.json();
                  if (res.ok && data.status === "SENT") {
                    setSendResult({ ok: true, text: `Reminder sent via ${remindChannel}` });
                  } else {
                    setSendResult({ ok: false, text: data.error || "Failed to send reminder" });
                  }
                } catch {
                  setSendResult({ ok: false, text: "Network error — please try again" });
                } finally {
                  setSending(false);
                }
              }}
            >
              <Send size={13} />
              {sending ? "Sending..." : "Send now"}
            </Btn>
          </div>
        </Modal>
      </div>
    </>
  );
}
