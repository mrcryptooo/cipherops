import Link from "next/link";
import { ProtocolCoverage } from "@/components/ui/ProtocolCoverage";
import { HeroVideo } from "@/components/ui/HeroVideo";
import { FeatureMenu } from "@/components/ui/FeatureMenu";
import { LifecycleStrip } from "@/components/ui/LifecycleStrip";
import { OperationsPreview } from "@/components/ui/OperationsPreview";
import { SiteNav } from "@/components/layout/SiteNav";

// ─── Brand constants ──────────────────────────────────────────────────────────
const Y       = "#FFD208";
const CARD    = "#0d0d0d";
const BORDER  = "rgba(255,255,255,0.07)";
const YBORDER = "rgba(255,210,8,0.22)";
const YDIM    = "rgba(255,210,8,0.10)";

const BADGES = ["Official Registry", "ERC-7984 Lifecycle", "Private Reveal", "Gateway Unwrap"];

export default function HomePage() {
  return (
    <div style={{ background: "#000", color: "#f4f4f4", minHeight: "100vh" }}>

      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <SiteNav activePath="/" />

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        className="relative grid-bg"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 60% 20%, rgba(255,210,8,0.06) 0%, transparent 65%), #000",
          overflow: "hidden",
        }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div className="flex flex-col gap-10 py-14 sm:py-20 lg:flex-row lg:items-center lg:gap-12">

            <div className="flex-1 lg:max-w-[480px]">
              <p className="fade-slide-in mb-5 text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.18em" }}>
                Confidential Token Registry
              </p>
              <h1 className="fade-slide-in-delay-1 text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-[3.4rem]">
                Make token<br />balances private
              </h1>
              <p className="fade-slide-in-delay-2 mt-5 max-w-md text-base leading-relaxed" style={{ color: "#999" }}>
                A Zama-native interface for confidential token lifecycle and private token operations.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/registry"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold transition-opacity hover:opacity-90"
                  style={{ background: Y, color: "#000" }}
                >
                  Launch Registry ↓
                </Link>
                <Link
                  href="/operations"
                  className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-colors hover:border-[#FFD208]/30 hover:text-[#FFD208]"
                  style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#bbb" }}
                >
                  Explore Operations
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-2">
                {BADGES.map((b) => (
                  <span
                    key={b}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: YDIM, border: `1px solid ${YBORDER}`, color: Y }}
                  >
                    {b}
                  </span>
                ))}
              </div>
            </div>

            {/* Video column — wider than text side, bleeds right on xl+ */}
            <div className="w-full lg:flex-[1.3] xl:mr-[-3rem]">
              <HeroVideo />
            </div>
          </div>
        </div>
      </section>

      {/* ── Lifecycle strip ─────────────────────────────────────────────── */}
      <LifecycleStrip />

      {/* ── Feature Menu ────────────────────────────────────────────────── */}
      <FeatureMenu />

      {/* ── Operations Preview ──────────────────────────────────────────── */}
      <OperationsPreview />

      {/* ── Protocol Coverage ───────────────────────────────────────────── */}
      <section className="py-16" style={{ background: "#050505", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <p className="mb-6 text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.16em" }}>
            Live Coverage
          </p>
          <ProtocolCoverage />
        </div>
      </section>

      {/* ── CTA bridge to Registry ──────────────────────────────────────── */}
      <section className="py-20" style={{ background: "#000" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
          <div
            className="flex flex-col items-center justify-between gap-6 rounded-2xl px-8 py-10 text-center sm:flex-row sm:text-left"
            style={{ background: YDIM, border: `1px solid ${YBORDER}` }}
          >
            <div>
              <h2 className="text-xl font-bold text-white sm:text-2xl">Ready to test the full lifecycle?</h2>
              <p className="mt-2 text-sm" style={{ color: "#999" }}>
                Connect your wallet, use the live Sepolia registry, and run through the complete
                confidential token flow.
              </p>
            </div>
            <Link
              href="/registry"
              className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl px-7 py-3 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: Y, color: "#000" }}
            >
              Open Registry →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="py-8" style={{ background: "#000", borderTop: `1px solid ${BORDER}` }}>
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: Y }} />
            <p className="text-xs" style={{ color: "#444" }}>
              CipherOps · Confidential token infrastructure for Zama fhEVM
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            {[
              { label: "Registry",       href: "/registry" },
              { label: "Zama Docs",      href: "https://docs.zama.ai" },
              { label: "Zama dApps",     href: "https://github.com/zama-ai/dapps" },
              { label: "fhEVM",          href: "https://github.com/zama-ai/fhevm" },
            ].map((l) => (
              <a
                key={l.label}
                href={l.href}
                target={l.href.startsWith("http") ? "_blank" : undefined}
                rel={l.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="text-xs transition-colors hover:text-[#FFD208]"
                style={{ color: "#444" }}
              >
                {l.label}
              </a>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}
