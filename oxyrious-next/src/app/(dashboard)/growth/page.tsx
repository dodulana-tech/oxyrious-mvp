"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card, MetricCard } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { Modal } from "@/components/ui/modal";
import { FormGroup, Select, inputClass } from "@/components/ui/form";
import { fmt } from "@/lib/utils";

interface Hospital {
  id: number;
  name: string;
  contact: string;
  phone: string;
  area: string;
  paymentMode: string;
  walletBalance: number;
  orderCount: number;
  streak: number;
  referralCount: number;
  refReward: number;
  milestone: boolean;
}

interface Referral {
  id: number;
  referrerId: number;
  referred: string;
  code: string;
  status: string;
  orderCount: number;
  reward: number;
  date: string;
}

export default function GrowthPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [dismissed, setDismissed] = useState<number[]>([]);
  const [modal, setModal] = useState<string | null>(null);
  const [nudgeTarget, setNudgeTarget] = useState<Hospital | null>(null);
  const [nudgeChannel, setNudgeChannel] = useState<"SMS" | "WHATSAPP">("WHATSAPP");
  const [nudgeMsg, setNudgeMsg] = useState("");
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<{ ok: boolean; text: string } | null>(null);

  const [scoreMsg, setScoreMsg] = useState("");
  const [scoreSending, setScoreSending] = useState(false);
  const [scoreSendResult, setScoreSendResult] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const [hosRes, refRes] = await Promise.all([
          fetch("/api/hospitals"),
          fetch("/api/referrals").catch(() => null),
        ]);

        if (!hosRes.ok) throw new Error("Failed to load hospitals");
        const hosData = await hosRes.json();
        setHospitals(Array.isArray(hosData) ? hosData : []);

        if (refRes && refRes.ok) {
          const refData = await refRes.json();
          setReferrals(Array.isArray(refData) ? refData : []);
        }
      } catch (err) {
        console.error("Growth page load error:", err);
      }
    }
    load();
  }, []);

  const nudges = hospitals.filter((h) => h.milestone);
  const activeNudges = nudges.filter((h) => !dismissed.includes(h.id));
  const totalRefs = referrals.length;
  const qualified = referrals.filter((r) => r.status === "QUALIFIED").length;
  const totalRewards = hospitals.reduce((s, h) => s + h.refReward, 0);

  const streakColor = (d: number) => (d >= 200 ? "text-emerald-500" : d >= 100 ? "text-amber-500" : "text-slate-400");
  const streakBorder = (d: number) => (d >= 200 ? "border-emerald-500" : d >= 100 ? "border-amber-500" : "border-slate-600");

  return (
    <>
      <Header title="Growth Hub" subtitle="Wallet nudges, streaks, referral funnel and PLG actions" />
      <div className="p-5 flex-1">
        <div className="grid grid-cols-4 gap-3 mb-4">
          <MetricCard label="Referrals in pipeline" value={String(totalRefs)} sub={`${qualified} qualified`} accent="purple" />
          <MetricCard label="Wallet rewards issued" value={fmt(totalRewards)} sub="Total earned by referrers" accent="green" />
          <MetricCard label="Wallet nudges ready" value={String(activeNudges.length)} sub="3+ orders, not on wallet" accent="amber" />
          <MetricCard
            label="Avg supply streak"
            value={hospitals.length > 0 ? `${Math.round(hospitals.reduce((s, h) => s + h.streak, 0) / hospitals.length)}d` : "0d"}
            sub="Across all hospitals"
            accent="green"
          />
        </div>

        <div className="grid grid-cols-2 gap-3.5">
          {/* Left column */}
          <div>
            <div className="font-display text-[13px] font-bold mb-3">Wallet conversion nudges</div>
            {activeNudges.length === 0 ? (
              <Card>
                <div className="text-center text-text-muted py-5">No nudges pending</div>
              </Card>
            ) : (
              activeNudges.map((h) => (
                <div
                  key={h.id}
                  className="bg-purple-500/8 border border-purple-500/20 rounded-[10px] p-3.5 mb-2.5"
                >
                  <div className="flex justify-between items-start mb-2.5">
                    <div>
                      <div className="font-semibold text-[13px] mb-0.5">{h.name}</div>
                      <div className="text-[11.5px] text-text-muted">
                        {h.orderCount} orders · {h.area}
                      </div>
                    </div>
                    <Badge color="purple">Milestone</Badge>
                  </div>
                  <div className="text-xs text-purple-300 mb-3 leading-relaxed italic">
                    &ldquo;{h.name} has placed {h.orderCount} orders. Wallet clients at this volume save an avg of 4%
                    annually and get priority dispatch. Ready to activate?&rdquo;
                  </div>
                  <div className="flex gap-2">
                    <Btn
                      variant="purple"
                      size="sm"
                      onClick={() => {
                        setNudgeTarget(h);
                        setNudgeChannel("WHATSAPP");
                        setNudgeMsg(`Dear ${h.contact}, ${h.name} has placed ${h.orderCount} orders with Oxyrious. Wallet clients at your volume save an avg of 4% annually and get priority dispatch ahead of standard clients. Ready to activate your Supply Security Account? Reply YES and we'll set it up today. — Oxyrious team`);
                        setSendResult(null);
                        setModal("nudge");
                      }}
                    >
                      Send WhatsApp nudge
                    </Btn>
                    <Btn
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setNudgeTarget(h);
                        setNudgeChannel("SMS");
                        setNudgeMsg(`Dear ${h.contact}, ${h.name} has placed ${h.orderCount} orders with Oxyrious. Wallet clients at your volume save an avg of 4% annually and get priority dispatch ahead of standard clients. Ready to activate your Supply Security Account? Reply YES and we'll set it up today. — Oxyrious team`);
                        setSendResult(null);
                        setModal("nudge");
                      }}
                    >
                      Send SMS
                    </Btn>
                    <Btn variant="ghost" size="sm" onClick={() => setDismissed((p) => [...p, h.id])}>
                      Dismiss
                    </Btn>
                  </div>
                </div>
              ))
            )}

            <div className="font-display text-[13px] font-bold mt-4 mb-3">Supply continuity scores</div>
            <Card>
              {hospitals.map((h, i) => (
                <div
                  key={h.id}
                  className={`flex items-center justify-between py-2.5 ${i < hospitals.length - 1 ? "border-b border-border" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-full border-2 ${streakBorder(h.streak)} flex items-center justify-center ${streakColor(h.streak)} font-display font-bold text-[13px] shrink-0`}
                    >
                      {h.streak}
                    </div>
                    <div>
                      <div className="text-xs font-medium">{h.name}</div>
                      <div className="text-[10.5px] text-text-muted">0 missed deliveries in {h.streak} days</div>
                    </div>
                  </div>
                  <Btn
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setNudgeTarget(h);
                      setScoreMsg(`Dear ${h.contact}, great news! ${h.name} has achieved ${h.streak} consecutive days of zero missed oxygen deliveries with Oxyrious. You're in the top ${h.streak >= 200 ? "10" : "25"}% of all our clients. — Oxyrious team`);
                      setScoreSendResult(null);
                      setModal("score");
                    }}
                  >
                    Share score
                  </Btn>
                </div>
              ))}
            </Card>
          </div>

          {/* Right column */}
          <div>
            <div className="font-display text-[13px] font-bold mb-3">Growth funnel</div>
            <Card className="mb-3.5">
              {[
                ["Total hospitals", hospitals.length, "text-text-primary", "bg-text-primary", 100],
                [
                  "10+ orders (sticky)",
                  hospitals.filter((h) => h.orderCount >= 10).length,
                  "text-blue-500",
                  "bg-blue-500",
                  hospitals.length > 0 ? Math.round((hospitals.filter((h) => h.orderCount >= 10).length / hospitals.length) * 100) : 0,
                ],
                [
                  "Wallet accounts",
                  hospitals.filter((h) => h.paymentMode === "WALLET").length,
                  "text-emerald-500",
                  "bg-emerald-500",
                  hospitals.length > 0 ? Math.round((hospitals.filter((h) => h.paymentMode === "WALLET").length / hospitals.length) * 100) : 0,
                ],
                [
                  "Active referrers",
                  hospitals.filter((h) => h.referralCount > 0).length,
                  "text-purple-500",
                  "bg-purple-500",
                  hospitals.length > 0 ? Math.round((hospitals.filter((h) => h.referralCount > 0).length / hospitals.length) * 100) : 0,
                ],
              ].map(([l, n, tc, bc, p]) => (
                <div key={l as string} className="mb-3.5">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs">{l as string}</span>
                    <span className={`text-[13px] font-bold ${tc}`}>{n as number}</span>
                  </div>
                  <div className="bg-bg rounded-sm h-1.5 overflow-hidden">
                    <div className={`h-full rounded-sm ${bc}`} style={{ width: `${p}%` }} />
                  </div>
                </div>
              ))}
            </Card>

            <div className="font-display text-[13px] font-bold mb-3">PLG actions this week</div>
            <Card noPad>
              {[
                { a: "Send wallet nudge", t: "Premiere Specialist + ClearView", badge: "purple" as const, label: "Today" },
                { a: "Monthly supply report", t: "All hospitals — next month", badge: "green" as const, label: "Scheduled" },
                { a: "Follow up referral", t: "Unity Specialist", badge: "amber" as const, label: "Pending" },
                { a: "Upgrade to wallet pitch", t: "After overdue invoice is cleared", badge: "gray" as const, label: "Blocked" },
              ].map((item, i) => (
                <div
                  key={i}
                  className="px-3.5 py-3 border-b border-border flex items-center justify-between"
                >
                  <div>
                    <div className="text-xs font-medium mb-0.5">{item.a}</div>
                    <div className="text-[11px] text-text-muted">{item.t}</div>
                  </div>
                  <Badge color={item.badge}>{item.label}</Badge>
                </div>
              ))}
              <div className="p-2" />
            </Card>
          </div>
        </div>

        {/* Nudge modal */}
        <Modal
          open={modal === "nudge" && !!nudgeTarget}
          onClose={() => { setModal(null); setSendResult(null); }}
          title={`Send wallet nudge — ${nudgeTarget?.name || ""}`}
          width="max-w-lg"
        >
          <Alert variant="purple">
            This sends a personalised wallet pitch to the hospital COO via WhatsApp or SMS.
          </Alert>
          {sendResult && (
            <Alert variant={sendResult.ok ? "green" : "red"}>
              {sendResult.ok ? <CheckCircle size={14} className="shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="shrink-0 mt-0.5" />}
              <span>{sendResult.text}</span>
            </Alert>
          )}
          <FormGroup label="Channel">
            <Select value={nudgeChannel} onChange={(e) => setNudgeChannel(e.target.value as "SMS" | "WHATSAPP")}>
              <option value="WHATSAPP">WhatsApp (Termii)</option>
              <option value="SMS">SMS (Termii)</option>
            </Select>
          </FormGroup>
          <FormGroup label="Message">
            <textarea
              rows={5}
              className={`${inputClass} resize-y`}
              value={nudgeMsg}
              onChange={(e) => setNudgeMsg(e.target.value)}
            />
          </FormGroup>
          <div className="flex gap-2 justify-end">
            <Btn variant="ghost" onClick={() => { setModal(null); setSendResult(null); }}>
              Cancel
            </Btn>
            <Btn
              disabled={sending}
              onClick={async () => {
                if (!nudgeTarget) return;
                setSending(true);
                setSendResult(null);
                try {
                  const res = await fetch("/api/notifications/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      hospitalId: nudgeTarget.id,
                      channel: nudgeChannel,
                      message: nudgeMsg,
                    }),
                  });
                  const data = await res.json();
                  if (res.ok && data.status === "SENT") {
                    setSendResult({ ok: true, text: `Nudge sent via ${nudgeChannel}` });
                    setDismissed((p) => [...p, nudgeTarget.id]);
                  } else {
                    setSendResult({ ok: false, text: data.error || "Failed to send nudge" });
                  }
                } catch {
                  setSendResult({ ok: false, text: "Network error — please try again" });
                } finally {
                  setSending(false);
                }
              }}
            >
              {sending ? "Sending..." : "Send nudge"}
            </Btn>
          </div>
        </Modal>

        {/* Score modal */}
        <Modal
          open={modal === "score" && !!nudgeTarget}
          onClose={() => { setModal(null); setScoreSendResult(null); }}
          title="Share supply continuity score"
          width="max-w-lg"
        >
          <Alert variant="green">
            Sends the hospital their streak as a branded message — great for the COO to forward internally.
          </Alert>
          {scoreSendResult && (
            <Alert variant={scoreSendResult.ok ? "green" : "red"}>
              {scoreSendResult.ok ? <CheckCircle size={14} className="shrink-0 mt-0.5" /> : <AlertTriangle size={14} className="shrink-0 mt-0.5" />}
              <span>{scoreSendResult.text}</span>
            </Alert>
          )}
          <FormGroup label="Message preview">
            <textarea
              rows={4}
              className={`${inputClass} resize-y`}
              value={scoreMsg || (
                nudgeTarget
                  ? `Dear ${nudgeTarget.contact}, great news! ${nudgeTarget.name} has achieved ${nudgeTarget.streak} consecutive days of zero missed oxygen deliveries with Oxyrious. You're in the top ${nudgeTarget.streak >= 200 ? "10" : "25"}% of all our clients. — Oxyrious team`
                  : ""
              )}
              onChange={(e) => setScoreMsg(e.target.value)}
            />
          </FormGroup>
          <div className="flex gap-2 justify-end">
            <Btn variant="ghost" onClick={() => { setModal(null); setScoreSendResult(null); }}>
              Cancel
            </Btn>
            <Btn
              disabled={scoreSending}
              onClick={async () => {
                if (!nudgeTarget) return;
                setScoreSending(true);
                setScoreSendResult(null);
                const message = scoreMsg || `Dear ${nudgeTarget.contact}, great news! ${nudgeTarget.name} has achieved ${nudgeTarget.streak} consecutive days of zero missed oxygen deliveries with Oxyrious. You're in the top ${nudgeTarget.streak >= 200 ? "10" : "25"}% of all our clients. — Oxyrious team`;
                try {
                  const res = await fetch("/api/notifications/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      hospitalId: nudgeTarget.id,
                      channel: "WHATSAPP",
                      message,
                    }),
                  });
                  const data = await res.json();
                  if (res.ok && data.status === "SENT") {
                    setScoreSendResult({ ok: true, text: "Score sent via WhatsApp" });
                  } else {
                    setScoreSendResult({ ok: false, text: data.error || "Failed to send score" });
                  }
                } catch {
                  setScoreSendResult({ ok: false, text: "Network error — please try again" });
                } finally {
                  setScoreSending(false);
                }
              }}
            >
              {scoreSending ? "Sending..." : "Send via WhatsApp"}
            </Btn>
          </div>
        </Modal>
      </div>
    </>
  );
}
