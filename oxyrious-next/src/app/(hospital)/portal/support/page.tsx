"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { Phone, Mail, MessageCircle, Send, Clock, CheckCircle2 } from "lucide-react";

export default function SupportPage() {
  const { data: session } = useSession();
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up to API
    setSubmitted(true);
    setSubject("");
    setMessage("");
    setTimeout(() => setSubmitted(false), 4000);
  }

  return (
    <div className="p-4 sm:p-6 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold mb-1">Support</h1>
        <p className="text-text-muted text-sm">
          Need help? Reach out to the Oxyrious team.
        </p>
      </div>

      {/* Contact cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        <div className="bg-bg-card border border-border rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <Phone size={16} className="text-brand" />
          </div>
          <div>
            <div className="text-xs font-semibold mb-0.5">Phone</div>
            <div className="text-[11px] text-text-muted">+234 801 234 5678</div>
            <div className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
              <Clock size={10} /> Mon–Sat, 8am–6pm
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <Mail size={16} className="text-brand" />
          </div>
          <div>
            <div className="text-xs font-semibold mb-0.5">Email</div>
            <div className="text-[11px] text-text-muted">support@oxyrious.com</div>
            <div className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
              <Clock size={10} /> Response within 2hrs
            </div>
          </div>
        </div>

        <div className="bg-bg-card border border-border rounded-xl p-4 flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
            <MessageCircle size={16} className="text-brand" />
          </div>
          <div>
            <div className="text-xs font-semibold mb-0.5">WhatsApp</div>
            <div className="text-[11px] text-text-muted">+234 801 234 5678</div>
            <div className="text-[10px] text-text-muted mt-1 flex items-center gap-1">
              <Clock size={10} /> Instant replies
            </div>
          </div>
        </div>
      </div>

      {/* Support form */}
      <div className="bg-bg-card border border-border rounded-xl p-5">
        <h2 className="font-display text-sm font-bold mb-4">Send a message</h2>

        {submitted && (
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5 mb-4">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span className="text-xs text-emerald-700">Message sent! We&apos;ll get back to you shortly.</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10.5px] font-medium text-text-secondary mb-1 uppercase tracking-wider">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-bg-input border border-border-light rounded-[7px] text-text-primary text-sm px-3 py-2 outline-none focus:border-brand transition-colors"
              placeholder="e.g. Delivery delay, Billing question"
              required
            />
          </div>

          <div>
            <label className="block text-[10.5px] font-medium text-text-secondary mb-1 uppercase tracking-wider">
              Message
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full bg-bg-input border border-border-light rounded-[7px] text-text-primary text-sm px-3 py-2 outline-none focus:border-brand transition-colors resize-none"
              placeholder="Describe your issue or question..."
              required
            />
          </div>

          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-5 py-2.5 rounded-lg transition-colors cursor-pointer"
          >
            <Send size={14} /> Send message
          </button>
        </form>
      </div>
    </div>
  );
}
