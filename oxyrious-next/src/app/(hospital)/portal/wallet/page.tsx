"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/header";
import { MetricCard, Card } from "@/components/ui/card";
import { Btn } from "@/components/ui/button";
import { Table, Th, Tr, Td } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { WalletBar } from "@/components/ui/bars";
import { Modal } from "@/components/ui/modal";
import { FormGroup, Input } from "@/components/ui/form";
import { Alert } from "@/components/ui/alert";
import { fmtFull } from "@/lib/utils";

interface WalletTransaction {
  id: number;
  type: string;
  amount: number;
  reference: string | null;
  note: string | null;
  createdAt: string;
}

interface WalletData {
  balance: number;
  minimum: number;
  hospitalName: string;
  transactions: WalletTransaction[];
}

const typeBadge: Record<string, { color: "green" | "red" | "blue" | "purple" | "amber"; label: string }> = {
  TOPUP: { color: "green", label: "Top-up" },
  DEDUCTION: { color: "red", label: "Deduction" },
  REFUND: { color: "blue", label: "Refund" },
  REFERRAL_REWARD: { color: "purple", label: "Reward" },
};

export default function HospitalWalletPage() {
  const [data, setData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [topupLoading, setTopupLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchWallet = () => {
    fetch("/api/hospital/wallet")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleTopup = async () => {
    const amountNum = parseFloat(amount);
    if (!amountNum || amountNum <= 0) return;

    setTopupLoading(true);
    setError("");
    try {
      // We need the hospitalId from the /me endpoint for the topup
      const meRes = await fetch("/api/hospital/me");
      const meData = await meRes.json();

      const res = await fetch("/api/wallet/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hospitalId: meData.id, amount: amountNum }),
      });

      if (res.ok) {
        const { authorization_url } = await res.json();
        // Redirect to Paystack payment page
        window.location.href = authorization_url;
      } else {
        const errData = await res.json();
        setError(errData.error || "Failed to initiate top-up");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setTopupLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Wallet" subtitle="Loading..." />
        <div className="p-5 flex-1 flex items-center justify-center">
          <div className="text-text-muted text-sm">Loading wallet...</div>
        </div>
      </>
    );
  }

  if (!data) {
    return (
      <>
        <Header title="Wallet" subtitle="Error" />
        <div className="p-5 flex-1 flex items-center justify-center">
          <div className="text-red-500 text-sm">Failed to load wallet data.</div>
        </div>
      </>
    );
  }

  const isLow = data.minimum > 0 && data.balance < data.minimum;

  return (
    <>
      <Header title="Wallet" subtitle="Manage your wallet balance and transactions" />
      <div className="p-5 flex-1 space-y-4">
        {/* Balance cards */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          <MetricCard
            label="Current Balance"
            value={fmtFull(data.balance)}
            accent={isLow ? "red" : "green"}
          />
          <MetricCard
            label="Minimum Required"
            value={fmtFull(data.minimum)}
            sub="Auto-alert threshold"
            accent="amber"
          />
          <div className="col-span-2 lg:col-span-1 flex items-center">
            <Btn onClick={() => setModalOpen(true)} className="w-full justify-center py-3">
              Top Up Wallet
            </Btn>
          </div>
        </div>

        {/* Wallet health bar */}
        {isLow && (
          <Alert variant="red">
            Your wallet balance is below the minimum threshold. Please top up to continue placing
            wallet-based orders.
          </Alert>
        )}

        <Card>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-text-muted">
              Wallet Health
            </span>
            <span className="text-xs font-medium">
              {fmtFull(data.balance)} / {fmtFull(data.minimum)}
            </span>
          </div>
          <WalletBar balance={data.balance} minimum={data.minimum} />
        </Card>

        {/* Transaction history */}
        <div>
          <h3 className="font-display text-sm font-bold mb-2">Transaction History</h3>
          <Card noPad>
            <Table>
              <thead>
                <tr>
                  <Th>Type</Th>
                  <Th>Amount</Th>
                  <Th>Reference</Th>
                  <Th>Note</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {data.transactions.length === 0 ? (
                  <Tr>
                    <Td colSpan={5} className="text-center text-text-muted py-6">
                      No transactions yet
                    </Td>
                  </Tr>
                ) : (
                  data.transactions.map((tx) => {
                    const badge = typeBadge[tx.type] || { color: "gray" as const, label: tx.type };
                    return (
                      <Tr key={tx.id}>
                        <Td>
                          <Badge color={badge.color}>{badge.label}</Badge>
                        </Td>
                        <Td
                          className={`font-semibold ${
                            tx.type === "DEDUCTION" ? "text-red-600" : "text-emerald-600"
                          }`}
                        >
                          {tx.type === "DEDUCTION" ? "-" : "+"}
                          {fmtFull(tx.amount)}
                        </Td>
                        <Td className="text-text-muted text-[11px] font-mono">
                          {tx.reference || "\u2014"}
                        </Td>
                        <Td className="text-text-muted text-[11px]">{tx.note || "\u2014"}</Td>
                        <Td className="text-text-muted text-[11px]">
                          {new Date(tx.createdAt).toLocaleDateString("en-NG", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </Td>
                      </Tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </Card>
        </div>

        {/* Top-up Modal */}
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Top Up Wallet">
          {error && <Alert variant="red">{error}</Alert>}
          <FormGroup label="Amount (NGN)">
            <Input
              type="number"
              min="1000"
              step="500"
              placeholder="e.g. 50000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </FormGroup>
          {parseFloat(amount) > 0 && (
            <div className="bg-bg rounded-lg p-3 mb-3.5 flex justify-between items-center">
              <span className="text-text-muted text-[13px]">You will pay</span>
              <span className="font-display font-bold text-xl text-brand">
                {fmtFull(parseFloat(amount))}
              </span>
            </div>
          )}
          <div className="text-[10px] text-text-muted mb-3">
            You will be redirected to Paystack to complete payment securely.
          </div>
          <div className="flex gap-2 justify-end">
            <Btn variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Btn>
            <Btn
              onClick={handleTopup}
              disabled={!amount || parseFloat(amount) <= 0 || topupLoading}
            >
              {topupLoading ? "Processing..." : "Proceed to Pay"}
            </Btn>
          </div>
        </Modal>
      </div>
    </>
  );
}
