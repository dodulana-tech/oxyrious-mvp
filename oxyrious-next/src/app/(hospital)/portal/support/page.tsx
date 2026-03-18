"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  Phone,
  Mail,
  MessageCircle,
  Send,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Truck,
  CreditCard,
  Wallet,
  Package,
  UserCog,
  HelpCircle,
  AlertTriangle,
  ExternalLink,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Btn } from "@/components/ui/button";
import { FormGroup, Input, Select } from "@/components/ui/form";

/* ── topic presets ────────────────────────────────────── */

const TOPICS = [
  {
    value: "delivery",
    label: "Delivery Issue",
    icon: Truck,
    subject: "Issue with my delivery",
    template:
      "Hi Oxyrious team,\n\nI'm experiencing an issue with a recent delivery. Here are the details:\n\n- Order reference: \n- Expected delivery date: \n- Issue description: \n\nPlease assist at your earliest convenience. Thank you.",
  },
  {
    value: "billing",
    label: "Billing Question",
    icon: CreditCard,
    subject: "Billing inquiry",
    template:
      "Hi Oxyrious team,\n\nI have a question regarding my billing. Details below:\n\n- Invoice / order reference: \n- Amount in question: \n- Description: \n\nKindly clarify at your convenience. Thank you.",
  },
  {
    value: "wallet",
    label: "Wallet Problem",
    icon: Wallet,
    subject: "Wallet issue",
    template:
      "Hi Oxyrious team,\n\nI'm having trouble with my wallet. Here's what happened:\n\n- Transaction reference (if any): \n- Expected balance: \n- Issue: \n\nPlease look into this. Thank you.",
  },
  {
    value: "order",
    label: "Order Inquiry",
    icon: Package,
    subject: "Question about my order",
    template:
      "Hi Oxyrious team,\n\nI'd like to inquire about an order. Details:\n\n- Order reference: \n- Product(s): \n- Question: \n\nThank you for your help.",
  },
  {
    value: "account",
    label: "Account Issue",
    icon: UserCog,
    subject: "Account-related issue",
    template:
      "Hi Oxyrious team,\n\nI need help with my account:\n\n- Issue: \n- Steps I've already tried: \n\nPlease assist. Thank you.",
  },
  {
    value: "other",
    label: "Other",
    icon: HelpCircle,
    subject: "",
    template: "",
  },
] as const;

type TopicValue = (typeof TOPICS)[number]["value"];

const PRIORITIES = [
  { value: "low", label: "Low", color: "gray" as const },
  { value: "medium", label: "Medium", color: "blue" as const },
  { value: "high", label: "High", color: "amber" as const },
  { value: "urgent", label: "Urgent", color: "red" as const },
];

/* ── FAQ data ─────────────────────────────────────────── */

const FAQS = [
  {
    q: "How do I track my delivery?",
    a: 'Go to Orders in the sidebar and click on any order to see real-time tracking. You\'ll also receive SMS and email updates at each stage.',
  },
  {
    q: "How long does delivery take?",
    a: "Standard deliveries within your city arrive within 2-4 hours. Inter-state deliveries may take 24-48 hours depending on your location.",
  },
  {
    q: "How do I top up my wallet?",
    a: 'Navigate to the Wallet page and click "Fund Wallet". You can pay via bank transfer, card, or USSD. Funds reflect instantly.',
  },
  {
    q: "Can I cancel or modify an order?",
    a: "Orders can be cancelled before dispatch. Go to Orders, select the order, and click Cancel. Once dispatched, contact support for assistance.",
  },
  {
    q: "What payment methods are available?",
    a: "We accept wallet balance, bank transfer, card payments, and credit (for qualified accounts). Cash on delivery is available in select locations.",
  },
];

/* ── component ────────────────────────────────────────── */

export default function SupportPage() {
  const { data: session } = useSession();

  const [topic, setTopic] = useState<TopicValue | "">("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [priority, setPriority] = useState("medium");
  const [orderRef, setOrderRef] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleTopicChange(value: string) {
    const preset = TOPICS.find((t) => t.value === value);
    setTopic(value as TopicValue);
    if (preset) {
      setSubject(preset.subject);
      setMessage(preset.template);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up to API
    setSubmitted(true);
    setTopic("");
    setSubject("");
    setMessage("");
    setPriority("medium");
    setOrderRef("");
    setTimeout(() => setSubmitted(false), 5000);
  }

  const selectedPriority = PRIORITIES.find((p) => p.value === priority)!;

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full">
      {/* ── header ──────────────────────────────────── */}
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold mb-1">Support</h1>
        <p className="text-text-muted text-sm">
          Need help? Reach out to the Oxyrious team or browse quick answers
          below.
        </p>
      </div>

      {/* ── contact cards (clickable) ───────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <a
          href="tel:+2348012345678"
          className="bg-bg-card border border-border rounded-xl p-4 flex items-start gap-3 hover:border-brand/40 transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 group-hover:bg-brand/20 transition-colors">
            <Phone size={16} className="text-brand" />
          </div>
          <div>
            <div className="text-xs font-semibold mb-0.5 flex items-center gap-1">
              Phone
              <ExternalLink size={10} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-[11px] text-text-muted">+234 801 234 5678</div>
            <div className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
              <Clock size={10} /> Mon&ndash;Sat, 8am&ndash;6pm
            </div>
          </div>
        </a>

        <a
          href="mailto:support@oxyrious.com"
          className="bg-bg-card border border-border rounded-xl p-4 flex items-start gap-3 hover:border-brand/40 transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 group-hover:bg-brand/20 transition-colors">
            <Mail size={16} className="text-brand" />
          </div>
          <div>
            <div className="text-xs font-semibold mb-0.5 flex items-center gap-1">
              Email
              <ExternalLink size={10} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-[11px] text-text-muted">support@oxyrious.com</div>
            <div className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
              <Clock size={10} /> Response within 2hrs
            </div>
          </div>
        </a>

        <a
          href="https://wa.me/2348012345678"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-bg-card border border-border rounded-xl p-4 flex items-start gap-3 hover:border-brand/40 transition-colors group"
        >
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0 group-hover:bg-brand/20 transition-colors">
            <MessageCircle size={16} className="text-brand" />
          </div>
          <div>
            <div className="text-xs font-semibold mb-0.5 flex items-center gap-1">
              WhatsApp
              <ExternalLink size={10} className="text-text-muted opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-[11px] text-text-muted">+234 801 234 5678</div>
            <div className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
              <Clock size={10} /> Instant replies
            </div>
          </div>
        </a>
      </div>

      {/* ── support form ────────────────────────────── */}
      <Card className="p-5 mb-8">
        <h2 className="font-display text-sm font-bold mb-4">
          Send a message
        </h2>

        {submitted && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 mb-4">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            <span className="text-xs text-emerald-700">
              Message sent! We&apos;ll get back to you shortly.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {/* row: topic + priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FormGroup label="Topic / Category" className="mb-0">
              <Select
                value={topic}
                onChange={(e) => handleTopicChange(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a topic...
                </option>
                {TOPICS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </FormGroup>

            <FormGroup label="Priority" className="mb-0">
              <Select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                {PRIORITIES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
              <div className="mt-1.5">
                <Badge color={selectedPriority.color} dot>
                  {selectedPriority.label} priority
                </Badge>
              </div>
            </FormGroup>
          </div>

          {/* subject */}
          <FormGroup label="Subject" className="mb-0">
            <Input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief description of your issue"
              required
            />
          </FormGroup>

          {/* order reference */}
          <FormGroup label="Order Reference (optional)" className="mb-0">
            <Input
              type="text"
              value={orderRef}
              onChange={(e) => setOrderRef(e.target.value)}
              placeholder="e.g. ORD-20260318-001"
            />
            <p className="text-[10px] text-text-muted mt-1">
              Include this if your issue is related to a specific order.
            </p>
          </FormGroup>

          {/* message */}
          <FormGroup label="Message" className="mb-0">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={7}
              className="w-full bg-bg-input border border-border-light rounded-[7px] text-text-primary text-sm px-3 py-2 outline-none focus:border-brand transition-colors resize-none"
              placeholder="Describe your issue or question..."
              required
            />
          </FormGroup>

          {/* topic hint */}
          {topic && topic !== "other" && (
            <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2.5">
              <AlertTriangle size={13} className="text-blue-600 shrink-0 mt-0.5" />
              <span className="text-[11px] text-blue-700">
                A template has been pre-filled based on your selected topic.
                Feel free to edit it with your specific details.
              </span>
            </div>
          )}

          <div className="pt-1">
            <Btn type="submit">
              <Send size={14} /> Send message
            </Btn>
          </div>
        </form>
      </Card>

      {/* ── FAQ / quick help ────────────────────────── */}
      <Card className="p-5">
        <h2 className="font-display text-sm font-bold mb-4">
          Frequently Asked Questions
        </h2>

        <div className="divide-y divide-border">
          {FAQS.map((faq, i) => (
            <div key={i}>
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between gap-3 py-3 text-left cursor-pointer bg-transparent border-none outline-none"
              >
                <span className="text-xs font-semibold text-text-primary">
                  {faq.q}
                </span>
                {openFaq === i ? (
                  <ChevronUp size={14} className="text-text-muted shrink-0" />
                ) : (
                  <ChevronDown size={14} className="text-text-muted shrink-0" />
                )}
              </button>
              {openFaq === i && (
                <p className="text-[11px] text-text-muted leading-relaxed pb-3 -mt-1 pr-6">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
