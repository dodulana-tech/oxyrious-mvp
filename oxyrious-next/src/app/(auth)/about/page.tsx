import Link from "next/link";
import { ArrowLeft, ImageIcon } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-bg text-text-primary">
      {/* Nav */}
      <nav className="border-b border-border/50 sticky top-0 bg-bg/80 backdrop-blur-xl z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline text-text-primary">
            <div className="w-8 h-8 bg-brand rounded-lg flex items-center justify-center font-black text-xs text-white">O₂</div>
            <span className="font-display text-sm font-bold">Oxy<span className="text-brand">rious</span></span>
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/contact" className="text-text-secondary hover:text-text-primary text-sm transition-colors">Contact</Link>
            <Link href="/login" className="bg-brand hover:bg-brand-dark text-white font-semibold text-sm px-5 py-2 rounded-lg transition-colors">Sign in</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-8">
        <Link href="/" className="inline-flex items-center gap-1.5 text-text-muted hover:text-text-primary text-sm transition-colors no-underline">
          <ArrowLeft size={14} /> Back to home
        </Link>
      </div>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 pb-14">
        <h1 className="font-display text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">About Oxyrious</h1>
        <p className="text-text-secondary text-base sm:text-lg leading-relaxed max-w-2xl">
          A tech-enabled medical gas company supplying hospitals across Lagos. No stockouts, no wahala.
        </p>
      </section>

      {/* Problem → Approach — single flowing section */}
      <section className="border-y border-border/50 bg-bg-card/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14 space-y-10">
          <div>
            <h2 className="font-display text-base font-bold mb-2">The problem</h2>
            <p className="text-text-secondary text-sm leading-relaxed max-w-2xl">
              Medical gas supply in Nigeria is unreliable. Hospitals juggle multiple vendors, track orders on WhatsApp, and manage payments in spreadsheets. Stockouts happen. Patients suffer.
            </p>
          </div>
          <div>
            <h2 className="font-display text-base font-bold mb-2">Our approach</h2>
            <p className="text-text-secondary text-sm leading-relaxed max-w-2xl">
              We built the gas supplier we wish existed — digital accounts, real-time tracking, proactive reordering, and a wallet system that eliminates payment friction. Technology as the backbone, not the product.
            </p>
          </div>
        </div>
      </section>

      {/* Founder + Partner side by side */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Founder */}
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-5">Founder</div>
            <div className="flex items-start gap-4">
              {/* Photo placeholder */}
              <div className="w-20 h-20 rounded-xl bg-bg-input border border-border flex items-center justify-center shrink-0">
                <ImageIcon size={20} className="text-text-muted" />
              </div>
              <div>
                <h3 className="font-display text-base font-bold">Tochukwu Onuoha</h3>
                <p className="text-brand text-xs font-medium mb-2">Founder & CEO</p>
                <p className="text-text-muted text-xs leading-relaxed">
                  On a mission to ensure no hospital in Lagos ever runs out of medical gas.
                </p>
              </div>
            </div>
          </div>

          {/* Management Partner */}
          <div className="bg-bg-card border border-border rounded-xl p-6">
            <div className="text-[10px] uppercase tracking-wider text-text-muted font-medium mb-5">Management Partner</div>
            <div className="flex items-start gap-4">
              <div className="w-20 h-20 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center shrink-0">
                <span className="text-purple-700 font-bold text-sm">CFA</span>
              </div>
              <div>
                <h3 className="font-display text-base font-bold">Consult for Africa</h3>
                <p className="text-purple-600 text-xs font-medium mb-2">
                  <a href="https://consultforafrica.com" target="_blank" rel="noopener noreferrer" className="hover:underline">consultforafrica.com</a>
                </p>
                <p className="text-text-muted text-xs leading-relaxed">
                  Strategic consulting, operations, and growth advisory — helping Oxyrious scale across Lagos and beyond.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values — compact */}
      <section className="border-t border-border/50 bg-bg-card/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="font-display text-base font-bold mb-6">What drives us</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <h3 className="text-sm font-bold mb-1">Reliability first</h3>
              <p className="text-text-muted text-xs leading-relaxed">Does this help a hospital avoid a stockout? That is how we make every decision.</p>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">Built for Nigeria</h3>
              <p className="text-text-muted text-xs leading-relaxed">Designed for intermittent connectivity, cash-heavy economies, and WhatsApp-first communication.</p>
            </div>
            <div>
              <h3 className="text-sm font-bold mb-1">Technology as an edge</h3>
              <p className="text-text-muted text-xs leading-relaxed">We are a gas company that uses technology to be better than every other option.</p>
            </div>
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
