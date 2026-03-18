import Link from "next/link";
import { Activity, Shield, TrendingUp, Truck, Wallet, BarChart3, ArrowRight, CheckCircle2 } from "lucide-react";
import { Bubbles } from "@/components/ui/bubbles";


const stats = [
  { value: "99.7%", label: "Delivery uptime" },
  { value: "163", label: "Avg supply streak (days)" },
  { value: "₦15M+", label: "Monthly gas delivered" },
  { value: "24hrs", label: "Avg receivables cycle" },
];

const hospitals = [
  "Reddington Hospital",
  "EKO Hospital",
  "Lagoon Hospital",
  "St. Nicholas Hospital",
  "Premiere Specialist",
  "ClearView Clinic",
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* Nav */}
      <nav className="border-b border-border/50 sticky top-0 bg-bg/80 backdrop-blur-xl z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-brand rounded-lg flex items-center justify-center font-black text-sm text-white">
              O₂
            </div>
            <div>
              <div className="font-display text-[15px] font-bold leading-tight">
                Oxy<span className="text-brand">rious</span>
              </div>
              <div className="text-[8px] text-text-muted uppercase tracking-[.08em] hidden sm:block">
                Medical Oxygen. Elevated.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
            <a href="#features" className="text-text-secondary hover:text-text-primary text-sm transition-colors hidden sm:block">Features</a>
            <Link href="/about" className="text-text-secondary hover:text-text-primary text-sm transition-colors hidden sm:block">About</Link>
            <Link href="/contact" className="text-text-secondary hover:text-text-primary text-sm transition-colors hidden md:block">Contact</Link>
            <Link
              href="/login?callbackUrl=%2Fportal"
              className="text-text-secondary hover:text-text-primary text-sm font-medium transition-colors hidden sm:block"
            >
              Hospital Portal
            </Link>
            <Link
              href="/login"
              className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <Bubbles />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-20 sm:pt-32 pb-20 sm:pb-28 relative z-10">
          <div className="max-w-3xl">
            <h1 className="font-display text-4xl sm:text-6xl font-extrabold leading-[1.05] mb-6 tracking-tight">
              Your hospital&apos;s oxygen{" "}
              <span className="text-brand">should never run out</span>
            </h1>
            <p className="text-text-secondary text-base sm:text-lg leading-relaxed mb-8 max-w-xl">
              We supply medical gas to hospitals across Lagos. No delays, no wahala — just gas when you need it.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
              <Link
                href="/login?callbackUrl=%2Fportal"
                className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-colors shadow-md shadow-brand/20"
              >
                Hospital Portal <ArrowRight size={16} />
              </Link>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 bg-bg-card border border-border hover:border-border-light text-text-secondary hover:text-text-primary font-medium text-sm px-7 py-3.5 rounded-xl transition-all"
              >
                See features
              </a>
            </div>
          </div>
        </div>
        {/* Hero bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-bg to-transparent" />
      </section>

      {/* Stats */}
      <section id="stats" className="border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-display text-2xl sm:text-3xl font-extrabold text-brand mb-1">{s.value}</div>
                <div className="text-text-muted text-[10px] sm:text-xs uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold mb-3">Why hospitals choose Oxyrious</h2>
          <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto">
            Technology built into every step of our supply chain — so you get reliability, transparency, and value.
          </p>
        </div>

        <div className="space-y-16 sm:space-y-24">
          {/* Wallet */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand/8 flex items-center justify-center mb-4">
                <Wallet size={20} className="text-brand" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Wallet Prepayment</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                Deposit funds into your Oxyrious wallet and enjoy up to 10% discount on every order. No invoicing delays, no payment disputes.
              </p>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-brand" /> Instant settlement</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-brand" /> Auto-deduct</span>
              </div>
            </div>
            <div className="bg-bg-card border border-border rounded-2xl shadow-lg p-5 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Wallet Balance</div>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-medium">Active</span>
              </div>
              <div className="font-display text-3xl font-bold text-brand mb-1">₦820,000</div>
              <div className="text-xs text-text-muted mb-4">Minimum: ₦300,000</div>
              <div className="h-2 bg-bg-input rounded-full overflow-hidden mb-5">
                <div className="h-full bg-brand rounded-full" style={{ width: "82%" }} />
              </div>
              <div className="flex gap-2">
                {["+ ₦100K", "+ ₦500K", "+ ₦1M"].map((amt) => (
                  <div key={amt} className="flex-1 text-center py-2 bg-bg-input border border-border rounded-lg text-xs font-medium text-text-secondary">{amt}</div>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-border flex justify-between text-xs">
                <span className="text-text-muted">Discount rate</span>
                <span className="font-bold text-brand">5% off every order</span>
              </div>
            </div>
          </div>

          {/* Tracked Deliveries */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div className="order-2 lg:order-1 bg-bg-card border border-border rounded-2xl shadow-lg p-5 sm:p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium">Active Deliveries</div>
                <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">3 in transit</span>
              </div>
              {[
                { id: "ORD-0041", hospital: "Reddington Hospital", status: "Delivered", statusColor: "bg-emerald-500", time: "10:42 AM" },
                { id: "ORD-0040", hospital: "EKO Hospital", status: "In Transit", statusColor: "bg-blue-500", time: "11:15 AM" },
                { id: "ORD-0039", hospital: "Lagoon Hospital", status: "Dispatched", statusColor: "bg-amber-500", time: "11:30 AM" },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between py-3 border-b border-border/60 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${order.statusColor}`} />
                    <div>
                      <div className="text-xs font-semibold">{order.id}</div>
                      <div className="text-[10px] text-text-muted">{order.hospital}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-medium">{order.status}</div>
                    <div className="text-[10px] text-text-muted">{order.time}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="order-1 lg:order-2">
              <div className="w-10 h-10 rounded-xl bg-brand/8 flex items-center justify-center mb-4">
                <Truck size={20} className="text-brand" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Tracked Deliveries</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                Every cylinder is tracked from our depot to your door. Real-time status updates and proof of delivery for full transparency.
              </p>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-brand" /> Live tracking</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-brand" /> POD confirmation</span>
              </div>
            </div>
          </div>

          {/* Supply Continuity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14 items-center">
            <div>
              <div className="w-10 h-10 rounded-xl bg-brand/8 flex items-center justify-center mb-4">
                <BarChart3 size={20} className="text-brand" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3">Zero Stockouts</h3>
              <p className="text-text-secondary text-sm leading-relaxed mb-4">
                Our supply continuity system monitors your usage patterns and proactively schedules deliveries before you run low.
              </p>
              <div className="flex items-center gap-4 text-xs text-text-muted">
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-brand" /> Usage tracking</span>
                <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="text-brand" /> Auto-reorder</span>
              </div>
            </div>
            <div className="bg-bg-card border border-border rounded-2xl shadow-lg p-5 sm:p-6">
              <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-5">Supply Continuity Score</div>
              {[
                { name: "Reddington Hospital", streak: 247, score: 94 },
                { name: "Lagoon Hospital", streak: 201, score: 88 },
                { name: "EKO Hospital", streak: 183, score: 81 },
              ].map((h) => (
                <div key={h.name} className="mb-4 last:mb-0">
                  <div className="flex justify-between mb-1.5">
                    <span className="text-xs font-medium">{h.name}</span>
                    <span className="text-xs font-bold text-brand">{h.streak}d streak</span>
                  </div>
                  <div className="h-2 bg-bg-input rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-brand" style={{ width: `${h.score}%` }} />
                  </div>
                </div>
              ))}
              <div className="mt-5 pt-4 border-t border-border text-center">
                <div className="text-[10px] text-text-muted uppercase tracking-wider mb-1">Average streak</div>
                <div className="font-display text-2xl font-bold text-brand">210 days</div>
                <div className="text-[10px] text-text-muted">0 missed deliveries this quarter</div>
              </div>
            </div>
          </div>

          {/* Remaining features as compact cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              { icon: TrendingUp, title: "Referral Rewards", desc: "Refer another hospital to Oxyrious and earn wallet credits. The more you refer, the more you save." },
              { icon: Shield, title: "Flexible Payment", desc: "Wallet prepay, credit terms, bank transfer, or cash — choose what works for your hospital." },
              { icon: Activity, title: "Monthly Reports", desc: "Detailed supply reports every month — deliveries, spend, continuity score, and savings." },
            ].map((f) => (
              <div key={f.title} className="bg-bg-card border border-border rounded-xl p-5 sm:p-6 hover:border-brand/30 hover:shadow-md transition-all group">
                <div className="w-10 h-10 rounded-xl bg-brand/8 flex items-center justify-center mb-4 group-hover:bg-brand/15 transition-colors">
                  <f.icon size={20} className="text-brand" />
                </div>
                <h3 className="font-display text-sm font-bold mb-2">{f.title}</h3>
                <p className="text-text-muted text-xs leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="relative overflow-hidden border-y border-border/50 bg-bg-card/60">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 relative z-10">
          <div className="text-center mb-10 sm:mb-14">
            <h2 className="font-display text-2xl sm:text-3xl font-extrabold mb-3">How it works</h2>
            <p className="text-text-secondary text-sm sm:text-base max-w-xl mx-auto">
              Getting started with Oxyrious is simple.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Get onboarded", desc: "We set up your hospital account, agree on payment terms, and configure your preferred delivery schedule." },
              { step: "02", title: "Place orders", desc: "Order medical oxygen, nitrous oxide, or any specialty gas through your dashboard or via WhatsApp." },
              { step: "03", title: "We deliver", desc: "Our logistics network delivers to your facility with real-time tracking and proof of delivery confirmation." },
              { step: "04", title: "Stay supplied", desc: "Automatic reorder alerts, wallet top-ups, and continuity tracking ensure you never run out." },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="text-brand/15 font-display text-6xl sm:text-7xl font-black mb-2 leading-none">{item.step}</div>
                <h3 className="font-display text-sm font-bold mb-2">{item.title}</h3>
                <p className="text-text-muted text-xs leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trusted by */}
      <section id="trusted" className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold mb-3">Trusted by leading hospitals</h2>
          <p className="text-text-secondary text-sm sm:text-base">
            Hospitals across Lagos rely on Oxyrious for uninterrupted medical gas supply.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 max-w-2xl mx-auto">
          {hospitals.map((name) => (
            <div key={name} className="flex items-center gap-2.5 bg-bg-card border border-border rounded-lg px-4 py-3 shadow-sm">
              <CheckCircle2 size={16} className="text-brand shrink-0" />
              <span className="text-sm font-medium">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden border-t border-border/50">
        <Bubbles density="sparse" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 text-center relative z-10">
          <h2 className="font-display text-2xl sm:text-3xl font-extrabold mb-3">
            Ready for reliable gas supply?
          </h2>
          <p className="text-text-secondary text-sm sm:text-base mb-8 max-w-lg mx-auto">
            Partner with a medical gas supplier that uses technology to deliver reliability, transparency, and growth for your hospital.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl transition-colors shadow-md shadow-brand/20"
          >
            Get started <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-bg-card/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-brand rounded-md flex items-center justify-center font-black text-[10px] text-white">
                O₂
              </div>
              <span className="font-display text-xs font-bold">
                Oxy<span className="text-brand">rious</span>
              </span>
            </div>
            <div className="flex items-center gap-3 text-text-muted text-[11px]">
              <Link href="/about" className="hover:text-text-primary transition-colors no-underline text-text-muted">About</Link>
              <Link href="/contact" className="hover:text-text-primary transition-colors no-underline text-text-muted">Contact</Link>
            </div>
          </div>
          <div className="text-text-muted text-[11px]">
            &copy; {new Date().getFullYear()} Oxyrious. Medical Oxygen. Elevated.
          </div>
        </div>
      </footer>
    </div>
  );
}
