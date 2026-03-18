"use client";

import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Send } from "lucide-react";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const htmlBody = `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${form.name}</p>
        <p><strong>Email:</strong> ${form.email}</p>
        <p><strong>Company/Hospital:</strong> ${form.company || "N/A"}</p>
        <h3>Message:</h3>
        <p>${form.message.replace(/\n/g, "<br />")}</p>
      `;
      const res = await fetch("/api/notifications/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: "hello@oxyrious.com",
          subject: `Contact Form: ${form.name} — ${form.company || "No company"}`,
          html: htmlBody,
          replyTo: form.email,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }
      setSent(true);
    } catch (err) {
      console.error("Contact form error:", err);
      setError(err instanceof Error ? err.message : "Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* Nav */}
      <nav className="border-b border-border/50 sticky top-0 bg-bg/80 backdrop-blur-xl z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline text-text-primary">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-black text-xs text-white">
              O₂
            </div>
            <span className="font-display text-sm font-bold">
              Oxy<span className="text-brand">rious</span>
            </span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/about" className="text-text-secondary hover:text-text-primary text-sm transition-colors">About</Link>
            <Link href="/login" className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors">
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Back link */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm transition-colors no-underline">
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>

      {/* Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-20">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
          Get in touch
        </h1>
        <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl mb-12">
          Whether you are a hospital looking for a reliable gas supplier or a partner interested in working with us, we would love to hear from you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-[1fr_1.2fr] gap-10">
          {/* Contact info */}
          <div className="space-y-6">
            <div>
              <h2 className="font-display text-sm font-bold mb-4">Contact information</h2>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                    <Mail size={16} className="text-brand" />
                  </div>
                  <div>
                    <div className="text-xs text-text-muted mb-0.5">Email</div>
                    <div className="text-sm font-medium">hello@oxyrious.com</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                    <Phone size={16} className="text-brand" />
                  </div>
                  <div>
                    <div className="text-xs text-text-muted mb-0.5">Phone</div>
                    <div className="text-sm font-medium">+234 803 000 0000</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-brand" />
                  </div>
                  <div>
                    <div className="text-xs text-text-muted mb-0.5">Office</div>
                    <div className="text-sm font-medium">Victoria Island, Lagos</div>
                    <div className="text-xs text-text-muted">Nigeria</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-border pt-6">
              <h2 className="font-display text-sm font-bold mb-2">Business hours</h2>
              <p className="text-text-muted text-xs leading-relaxed">
                Monday — Friday: 8:00 AM — 6:00 PM WAT<br />
                Saturday: 9:00 AM — 2:00 PM WAT<br />
                Sunday: Closed
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="bg-bg-card border border-border rounded-xl p-6">
            {sent ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center mx-auto mb-4">
                  <Send size={20} className="text-brand" />
                </div>
                <h3 className="font-display text-lg font-bold mb-2">Message sent</h3>
                <p className="text-text-muted text-sm mb-6">
                  Thank you for reaching out. We will get back to you within 24 hours.
                </p>
                <button
                  onClick={() => { setSent(false); setError(null); setForm({ name: "", email: "", company: "", message: "" }); }}
                  className="text-brand text-sm font-medium cursor-pointer bg-transparent border-none hover:underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm">
                    {error}
                  </div>
                )}
                <div>
                  <label className="block text-[10.5px] font-medium text-text-secondary mb-1 uppercase tracking-wider">
                    Full name
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full bg-bg-input border border-border-light rounded-[7px] text-text-primary text-sm px-3 py-2.5 outline-none focus:border-brand transition-colors"
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-medium text-text-secondary mb-1 uppercase tracking-wider">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full bg-bg-input border border-border-light rounded-[7px] text-text-primary text-sm px-3 py-2.5 outline-none focus:border-brand transition-colors"
                    placeholder="you@company.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-medium text-text-secondary mb-1 uppercase tracking-wider">
                    Company / Hospital
                  </label>
                  <input
                    type="text"
                    value={form.company}
                    onChange={(e) => setForm({ ...form, company: e.target.value })}
                    className="w-full bg-bg-input border border-border-light rounded-[7px] text-text-primary text-sm px-3 py-2.5 outline-none focus:border-brand transition-colors"
                    placeholder="Organization name"
                  />
                </div>
                <div>
                  <label className="block text-[10.5px] font-medium text-text-secondary mb-1 uppercase tracking-wider">
                    Message
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-bg-input border border-border-light rounded-[7px] text-text-primary text-sm px-3 py-2.5 outline-none focus:border-brand transition-colors resize-none"
                    rows={5}
                    placeholder="Tell us about your needs..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brand hover:bg-brand-dark text-white font-semibold text-sm py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Sending..." : "Send message"}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand rounded-md flex items-center justify-center font-black text-[8px] text-white">O₂</div>
            <span className="font-display text-xs font-bold">Oxy<span className="text-brand">rious</span></span>
          </div>
          <div className="text-text-muted text-[11px]">&copy; {new Date().getFullYear()} Oxyrious. Medical Oxygen. Elevated.</div>
        </div>
      </footer>
    </div>
  );
}
