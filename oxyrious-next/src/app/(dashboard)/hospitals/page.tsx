"use client";

import { useState, useEffect } from "react";
import { Plus, Settings } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { FilterBar } from "@/components/ui/tabs";
import { Table, Th, Tr, Td } from "@/components/ui/table";
import { PayBadge, TierBadge, Badge } from "@/components/ui/badge";
import { ScoreBar, WalletBar } from "@/components/ui/bars";
import { Modal } from "@/components/ui/modal";
import { FormGroup, Select, Input } from "@/components/ui/form";
import { Alert } from "@/components/ui/alert";
import { DetailPanel, RefCode } from "@/components/ui/detail-panel";
import { fmt } from "@/lib/utils";

interface Hospital {
  id: number;
  name: string;
  contact: string;
  phone: string;
  area: string;
  paymentMode: string;
  walletBalance: number;
  walletMinimum: number;
  creditScore: number;
  tier: number;
  dso: number;
  orderCount: number;
  discount: number;
  markup: number;
  streak: number;
  refCode: string;
  referralCount: number;
  refReward: number;
  milestone: boolean;
}

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<number | null>(null);
  const [modal, setModal] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletEdit, setWalletEdit] = useState({ walletMinimum: 0, discount: 0, gracePeriod: "0", lowBalanceAlert: "30" });
  const [markupEdit, setMarkupEdit] = useState(0);
  const [markupSaving, setMarkupSaving] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    contact: "",
    phone: "",
    area: "",
    paymentMode: "CASH",
    walletMinimum: 200000,
    discount: 0,
  });

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/hospitals");
        if (!res.ok) throw new Error("Failed to load hospitals");
        const data = await res.json();
        setHospitals(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load hospitals:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = hospitals.filter((h) => filter === "all" || h.paymentMode === filter.toUpperCase());
  const sc = selected ? hospitals.find((h) => h.id === selected) || null : null;

  const streakColor = (d: number) => (d >= 200 ? "text-emerald-500" : d >= 100 ? "text-amber-500" : "text-slate-400");

  const changeMode = async (id: number, pm: string) => {
    try {
      const res = await fetch(`/api/hospitals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentMode: pm }),
      });
      if (res.ok) {
        setHospitals((p) => p.map((h) => (h.id === id ? { ...h, paymentMode: pm } : h)));
        setSelected(id);
      }
    } catch (err) {
      console.error("Failed to update payment mode", err);
    }
  };

  const saveWallet = async () => {
    if (!sc) return;
    try {
      const res = await fetch(`/api/hospitals/${sc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(walletEdit),
      });
      if (res.ok) {
        setHospitals((p) => p.map((h) => (h.id === sc.id ? { ...h, ...walletEdit } : h)));
        setModal(null);
      }
    } catch (err) {
      console.error("Failed to save wallet config", err);
    }
  };

  const saveMarkup = async () => {
    if (!sc) return;
    setMarkupSaving(true);
    try {
      const res = await fetch(`/api/hospitals/${sc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markup: markupEdit }),
      });
      if (res.ok) {
        setHospitals((p) => p.map((h) => (h.id === sc.id ? { ...h, markup: markupEdit } : h)));
      }
    } catch (err) {
      console.error("Failed to save markup", err);
    } finally {
      setMarkupSaving(false);
    }
  };

  const [topUpLoading, setTopUpLoading] = useState<number | null>(null);

  const topUp = async (id: number, amount: number) => {
    setTopUpLoading(amount);
    try {
      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId: id, amount }),
      });
      if (!res.ok) throw new Error("Top-up initiation failed");
      const { authorization_url } = await res.json();
      window.location.href = authorization_url;
    } catch (err) {
      console.error("Failed to initiate top-up", err);
      setTopUpLoading(null);
    }
  };

  const addHospital = async () => {
    try {
      const res = await fetch("/api/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newClient.name,
          contact: newClient.contact,
          phone: newClient.phone,
          area: newClient.area,
          paymentMode: newClient.paymentMode,
          walletMinimum: parseInt(String(newClient.walletMinimum)) || 0,
          discount: parseInt(String(newClient.discount)) || 0,
          refCode: `OXY-NEW${hospitals.length + 1}`,
        }),
      });
      if (res.ok) {
        const h = await res.json();
        setHospitals((p) => [...p, h]);
        setModal(null);
        setNewClient({ name: "", contact: "", phone: "", area: "", paymentMode: "CASH", walletMinimum: 200000, discount: 0 });
      }
    } catch (err) {
      console.error("Failed to add hospital", err);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Hospitals" subtitle="Manage client hospitals and wallets" />
        <div className="p-5 flex-1 flex items-center justify-center text-text-muted text-sm">Loading...</div>
      </>
    );
  }

  return (
    <>
      <Header title="Hospitals" subtitle="Manage client hospitals and wallets" />
      <div className="p-5 flex-1">
        <div className="flex gap-3.5">
          {/* Main table area */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3.5">
              <FilterBar filters={["all", "wallet", "credit", "transfer", "cash"]} active={filter} onChange={setFilter} />
              <Btn size="sm" onClick={() => setModal("new")} className="ml-auto">
                <Plus size={13} />
                Add hospital
              </Btn>
            </div>
            <Card noPad>
              <Table>
                <thead>
                  <tr>
                    <Th>Hospital</Th>
                    <Th>Area</Th>
                    <Th>Payment</Th>
                    <Th>Wallet</Th>
                    <Th>Score</Th>
                    <Th>Tier</Th>
                    <Th>Streak</Th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((h) => (
                    <Tr
                      key={h.id}
                      onClick={() => setSelected(h.id)}
                      highlight={sc?.id === h.id}
                      className="cursor-pointer"
                    >
                      <Td>
                        <div className="font-medium">{h.name}</div>
                        <div className="text-[10.5px] text-text-muted">{h.contact}</div>
                      </Td>
                      <Td className="text-text-muted text-xs">{h.area}</Td>
                      <Td>
                        <PayBadge mode={h.paymentMode} />
                      </Td>
                      <Td>
                        {h.paymentMode === "WALLET" ? (
                          <div className="w-[90px]">
                            <WalletBar balance={h.walletBalance} minimum={h.walletMinimum} />
                          </div>
                        ) : (
                          <span className="text-text-muted">&mdash;</span>
                        )}
                      </Td>
                      <Td>
                        <ScoreBar score={h.creditScore} />
                      </Td>
                      <Td>
                        <TierBadge tier={h.tier} />
                      </Td>
                      <Td>
                        <span className={`font-bold text-xs ${streakColor(h.streak)}`}>{h.streak}d</span>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </div>

          {/* Detail panel */}
          {sc && (
            <DetailPanel>
              <Card>
                <div className="flex justify-between mb-2.5">
                  <span className="font-display font-bold text-[13px]">{sc.name}</span>
                  <Btn size="sm" variant="ghost" onClick={() => setSelected(null)}>
                    ✕
                  </Btn>
                </div>
                <div className="text-[11.5px] text-text-muted mb-0.5">
                  {sc.contact} · {sc.phone}
                </div>
                <div className="text-[11.5px] text-text-muted mb-2.5">{sc.area}</div>
                <div className="text-xs mb-1">
                  <span className="text-text-muted">Orders: </span>
                  {sc.orderCount}
                </div>
                <div className="text-xs mb-1">
                  <span className="text-text-muted">Supply streak: </span>
                  <span className={`font-bold ${streakColor(sc.streak)}`}>{sc.streak}d</span>
                </div>
                {sc.discount > 0 && (
                  <div className="text-xs">
                    <span className="text-text-muted">Discount: </span>
                    <span className="text-brand">{sc.discount}%</span>
                  </div>
                )}
              </Card>

              <Card>
                <div className="font-display text-xs font-bold mb-2.5">Pricing</div>
                <div className="text-xs mb-1.5">
                  <span className="text-text-muted">Markup: </span>
                  <span className={sc.markup > 0 ? "text-red-500" : sc.markup < 0 ? "text-emerald-500" : ""}>
                    {sc.markup > 0 ? "+" : ""}{sc.markup}%
                  </span>
                  {sc.markup < 0 && <span className="text-text-muted ml-1">(discount)</span>}
                </div>
                <div className="flex items-center gap-1.5 mt-2">
                  <Input
                    type="number"
                    value={markupEdit}
                    onChange={(e) => setMarkupEdit(parseFloat(e.target.value) || 0)}
                    onFocus={() => setMarkupEdit(sc.markup)}
                    className="w-[80px] text-xs"
                    placeholder="e.g. 5"
                  />
                  <span className="text-[11px] text-text-muted">%</span>
                  <Btn size="sm" onClick={saveMarkup} disabled={markupSaving} className="ml-auto">
                    {markupSaving ? "Saving..." : "Save"}
                  </Btn>
                </div>
                <div className="text-[10px] text-text-muted mt-1.5">
                  Positive = surcharge, negative = discount
                </div>
              </Card>

              <Card>
                <div className="font-display text-xs font-bold mb-2.5">Credit profile</div>
                <div className="flex justify-between items-center mb-2">
                  <ScoreBar score={sc.creditScore} />
                  <TierBadge tier={sc.tier} />
                </div>
                <div className="text-[11px] text-text-muted">
                  {sc.creditScore >= 80
                    ? "Excellent — eligible for NET 30."
                    : sc.creditScore >= 60
                      ? "Good history. Consider NET 15."
                      : "New payer. Cash recommended."}
                </div>
              </Card>

              <Card>
                <div className="font-display text-xs font-bold mb-2">Referral code</div>
                <RefCode code={sc.refCode} />
                <div className="flex justify-between text-xs mt-2.5">
                  <span className="text-text-muted">Referrals</span>
                  <span className="font-semibold">{sc.referralCount}</span>
                </div>
                {sc.refReward > 0 && (
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-text-muted">Credits earned</span>
                    <span className="font-semibold text-brand">{fmt(sc.refReward)}</span>
                  </div>
                )}
              </Card>

              {sc.paymentMode === "WALLET" && (
                <Card>
                  <div className="flex justify-between items-center mb-2.5">
                    <div className="font-display text-xs font-bold">Wallet</div>
                    <Btn
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        setWalletEdit({ walletMinimum: sc.walletMinimum, discount: sc.discount, gracePeriod: "0", lowBalanceAlert: "30" });
                        setModal("wallet");
                      }}
                    >
                      <Settings size={11} />
                      Config
                    </Btn>
                  </div>
                  <div className={`text-[22px] font-bold mb-1.5 ${sc.walletBalance < sc.walletMinimum ? "text-red-500" : "text-brand"}`}>
                    {fmt(sc.walletBalance)}
                  </div>
                  <div className="text-[11px] text-text-muted mb-2">Min: {fmt(sc.walletMinimum)}</div>
                  {sc.walletBalance < sc.walletMinimum && (
                    <Alert variant="red" className="text-[11px] p-1.5 mb-2">
                      Below minimum — send top-up alert
                    </Alert>
                  )}
                  <div className="flex gap-1.5">
                    {[100000, 500000, 1000000].map((a) => (
                      <Btn
                        key={a}
                        size="sm"
                        variant="ghost"
                        onClick={() => topUp(sc.id, a)}
                        disabled={topUpLoading !== null}
                      >
                        {topUpLoading === a ? "Redirecting..." : `+${fmt(a)}`}
                      </Btn>
                    ))}
                  </div>
                </Card>
              )}

              <Card>
                <div className="font-display text-xs font-bold mb-2">Payment mode</div>
                <div className="flex flex-col gap-1.5">
                  {(
                    [
                      ["WALLET", "Wallet (pre-funded)"],
                      ["CREDIT", "Credit NET 30"],
                      ["TRANSFER", "Bank transfer"],
                      ["CASH", "Cash on order"],
                    ] as const
                  ).map(([m, l]) => (
                    <Btn
                      key={m}
                      variant={sc.paymentMode === m ? "primary" : "ghost"}
                      size="sm"
                      onClick={() => changeMode(sc.id, m)}
                      className="justify-start"
                    >
                      {l}
                    </Btn>
                  ))}
                </div>
              </Card>
            </DetailPanel>
          )}
        </div>

        {/* Wallet config modal */}
        <Modal open={modal === "wallet" && !!sc} onClose={() => setModal(null)} title={`Configure wallet — ${sc?.name || ""}`} width="max-w-sm">
          <FormGroup label="Minimum balance (₦)">
            <Input
              type="number"
              value={walletEdit.walletMinimum}
              onChange={(e) => setWalletEdit((p) => ({ ...p, walletMinimum: parseInt(e.target.value) || 0 }))}
            />
          </FormGroup>
          <FormGroup label="Discount rate (%)">
            <Input
              type="number"
              min={0}
              max={10}
              value={walletEdit.discount}
              onChange={(e) => setWalletEdit((p) => ({ ...p, discount: parseInt(e.target.value) || 0 }))}
            />
          </FormGroup>
          <FormGroup label="Grace period after zero">
            <Select
              value={walletEdit.gracePeriod}
              onChange={(e) => setWalletEdit((p) => ({ ...p, gracePeriod: e.target.value }))}
            >
              <option value="0">0 — strict hold</option>
              <option value="3">3 days grace</option>
              <option value="5">5 days grace</option>
            </Select>
          </FormGroup>
          <FormGroup label="Low-balance alert at">
            <Select
              value={walletEdit.lowBalanceAlert}
              onChange={(e) => setWalletEdit((p) => ({ ...p, lowBalanceAlert: e.target.value }))}
            >
              <option value="30">30% remaining</option>
              <option value="50">50% remaining</option>
            </Select>
          </FormGroup>
          <div className="flex gap-2 justify-end">
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn onClick={saveWallet}>Save config</Btn>
          </div>
        </Modal>

        {/* Add hospital modal */}
        <Modal open={modal === "new"} onClose={() => setModal(null)} title="Add new hospital">
          <div className="grid grid-cols-2 gap-2.5">
            <FormGroup label="Hospital name">
              <Input
                value={newClient.name}
                onChange={(e) => setNewClient((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g. Lekki Health Centre"
              />
            </FormGroup>
            <FormGroup label="Area">
              <Input
                value={newClient.area}
                onChange={(e) => setNewClient((p) => ({ ...p, area: e.target.value }))}
                placeholder="Lekki Phase 1"
              />
            </FormGroup>
            <FormGroup label="Contact person">
              <Input
                value={newClient.contact}
                onChange={(e) => setNewClient((p) => ({ ...p, contact: e.target.value }))}
                placeholder="Full name"
              />
            </FormGroup>
            <FormGroup label="Phone">
              <Input
                value={newClient.phone}
                onChange={(e) => setNewClient((p) => ({ ...p, phone: e.target.value }))}
                placeholder="0801 234 5678"
              />
            </FormGroup>
          </div>
          <FormGroup label="Default payment mode">
            <Select
              value={newClient.paymentMode}
              onChange={(e) => setNewClient((p) => ({ ...p, paymentMode: e.target.value }))}
            >
              <option value="CASH">Cash on order (default for new clients)</option>
              <option value="WALLET">Wallet (pre-funded)</option>
              <option value="TRANSFER">Bank transfer</option>
              <option value="CREDIT">Credit NET 30 (requires approval)</option>
            </Select>
          </FormGroup>
          {newClient.paymentMode === "WALLET" && (
            <div className="grid grid-cols-2 gap-2.5">
              <FormGroup label="Min balance (₦)">
                <Input
                  type="number"
                  value={newClient.walletMinimum}
                  onChange={(e) => setNewClient((p) => ({ ...p, walletMinimum: parseInt(e.target.value) || 0 }))}
                />
              </FormGroup>
              <FormGroup label="Discount (%)">
                <Input
                  type="number"
                  min={0}
                  max={10}
                  value={newClient.discount}
                  onChange={(e) => setNewClient((p) => ({ ...p, discount: parseInt(e.target.value) || 0 }))}
                />
              </FormGroup>
            </div>
          )}
          <div className="flex gap-2 justify-end">
            <Btn variant="ghost" onClick={() => setModal(null)}>
              Cancel
            </Btn>
            <Btn onClick={addHospital} disabled={!newClient.name}>
              Add hospital
            </Btn>
          </div>
        </Modal>
      </div>
    </>
  );
}
