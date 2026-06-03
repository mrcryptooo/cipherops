import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/layout/SiteNav";

export const metadata: Metadata = {
  title: "Verification Center — CipherOps",
  description:
    "Review the verified registry lifecycle, TokenOps Disperse receipts, and privacy guarantees behind CipherOps.",
};

// ─── Brand ────────────────────────────────────────────────────────────────────
const Y       = "#FFD208";
const CARD    = "rgba(255,255,255,0.025)";
const BORDER  = "rgba(255,255,255,0.07)";
const YBORDER = "rgba(255,210,8,0.22)";
const YDIM    = "rgba(255,210,8,0.08)";

const BADGES = [
  "Sepolia verified",
  "TokenOps receipts",
  "FHE-encrypted amounts",
  "No fake data",
];

const LIFECYCLE_STEPS = [
  { label: "Faucet",         detail: "ERC20.mint(user, 100e18) on official Sepolia mock token" },
  { label: "Approve",        detail: "ERC20.approve(wrapper, amount) — live allowance verified" },
  { label: "Wrap",           detail: "wrapper.wrap(user, amount) — ERC-20 sealed into ERC-7984" },
  { label: "Private Reveal", detail: "confidentialBalanceOf + EIP-712 user-decrypt via Zama relayer" },
  { label: "Unwrap",         detail: "wrapper.unwrap(from, to, encHandle, inputProof) — Gateway initiated" },
  { label: "Finalize",       detail: "wrapper.finalizeUnwrap(requestId, cleartext, proof) — ERC-20 released" },
];

const DISPERSE_RECEIPTS = [
  {
    id: "T2A",
    label: "Initial Verification (T2A)",
    tx: "0x650b5e598d3a…8de07752",
    network: "Ethereum Sepolia",
    type: "TokenOps Confidential Disperse (direct mode)",
    token: "cUSDCMock — Zama official Sepolia wrapper",
    note: "Recipient amounts are FHE-encrypted. Amount not visible on-chain.",
    explorerBase: "https://sepolia.etherscan.io/tx/",
    explorerHash: "0x650b5e598d3a8de07752",
  },
  {
    id: "T3",
    label: "CSV/Campaign UX Verification (T3)",
    tx: "0x8743a9d98d65…c7264d18",
    network: "Ethereum Sepolia",
    type: "TokenOps Confidential Disperse via polished Operations form",
    token: "0x7c5B…3639",
    recipient: "0x1afB9439…7a5FD282",
    note: "CSV import, campaign summary, and post-success receipt all verified. Recipient amount remains encrypted.",
    explorerBase: "https://sepolia.etherscan.io/tx/",
    explorerHash: "0x8743a9d98d65c7264d18",
  },
];

const PRIVACY_GUARANTEES = [
  "Public observers can see transactions and contract calls on Sepolia Etherscan.",
  "Public observers cannot see individual recipient payout amounts — they are FHE-encrypted ciphertexts.",
  "Recipients can reveal their own confidential balances through the Private Reveal flow in the Registry.",
  "The plaintext balance is decrypted locally in the recipient's browser; it is never stored server-side.",
  "CipherOps does not invent transaction hashes, mock balances, or simulate operations.",
  "All registry data is read live from the official Zama on-chain registry — no cached index.",
];

const DOC_LINKS = [
  { label: "QA Checkpoint — Phase 3",           href: null, note: "docs/QA_CHECKPOINT_PHASE3.md" },
  { label: "QA Checkpoint — TokenOps Disperse", href: null, note: "docs/QA_CHECKPOINT_TOKENOPS_DISPERSE.md" },
  { label: "Submission Pack",                    href: null, note: "docs/SUBMISSION_PACK.md" },
  { label: "Final QA Checklist",                 href: null, note: "docs/FINAL_QA_CHECKLIST.md" },
  { label: "TokenOps Client Analysis",           href: null, note: "docs/TOKENOPS_CLIENT_ANALYSIS.md" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-semibold uppercase tracking-widest" style={{ color: "#666", letterSpacing: "0.14em" }}>
      {children}
    </p>
  );
}

function Card({ children, yellow }: { children: React.ReactNode; yellow?: boolean }) {
  return (
    <div
      className="rounded-xl p-5"
      style={{
        background: yellow ? YDIM : CARD,
        border: `1px solid ${yellow ? YBORDER : BORDER}`,
        borderTop: yellow ? `2px solid rgba(255,210,8,0.45)` : undefined,
      }}
    >
      {children}
    </div>
  );
}

export default function VerificationPage() {
  return (
    <div style={{ background: "#070707", color: "#f4f4f4", minHeight: "100vh" }}>
      <SiteNav activePath="/verification" />

      {/* ── Header ── */}
      <div className="border-b px-4 py-12 sm:px-6 lg:px-10" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.18em" }}>
            Verification Center
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Proof, receipts, and privacy guarantees.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: "#888" }}>
                Review the verified registry lifecycle, TokenOps Disperse receipts, and
                privacy guarantees behind CipherOps. No fake data — only confirmed on-chain transactions.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {BADGES.map((b) => (
                <span key={b} className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: YDIM, border: `1px solid ${YBORDER}`, color: Y }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:px-6 lg:px-10">

        {/* ── 1. Verified Registry Lifecycle ── */}
        <section>
          <SectionLabel>1 — Verified Registry Lifecycle</SectionLabel>
          <Card>
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-bold text-white">Full confidential token lifecycle</p>
                <p className="mt-1 text-xs" style={{ color: "#666" }}>
                  Verified through live Sepolia transactions during manual QA. All steps performed
                  against official Zama deployed contracts — no custom contracts or mocks.
                </p>
              </div>
              <span className="rounded-full px-3 py-1 text-xs font-semibold text-emerald-400"
                style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)" }}>
                6/6 steps confirmed
              </span>
            </div>
            <div className="space-y-2">
              {LIFECYCLE_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-start gap-3 rounded-lg px-3 py-2.5"
                  style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}` }}>
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                    style={{ background: YDIM, color: Y }}>
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-sm font-semibold text-white">{step.label}</span>
                    <span className="ml-2 text-xs" style={{ color: "#555" }}>— {step.detail}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs" style={{ color: "#444" }}>
              Full tx hashes in{" "}
              <span className="font-mono" style={{ color: "#666" }}>docs/QA_CHECKPOINT_PHASE3.md</span>
            </p>
          </Card>
        </section>

        {/* ── 2. Verified TokenOps Disperse Receipts ── */}
        <section>
          <SectionLabel>2 — Verified TokenOps Disperse</SectionLabel>
          <div className="grid gap-4 sm:grid-cols-2">
            {DISPERSE_RECEIPTS.map((r) => (
              <div key={r.id} className="rounded-xl p-5"
                style={{ background: CARD, border: `1px solid ${BORDER}`, borderTop: `2px solid rgba(255,210,8,0.30)` }}>
                <div className="mb-3 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: Y, letterSpacing: "0.12em" }}>
                    {r.id}
                  </span>
                  <span className="rounded px-2 py-0.5 text-xs" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.22)", color: "#4ade80" }}>
                    Confirmed
                  </span>
                </div>

                <p className="text-sm font-bold text-white">{r.label}</p>

                <dl className="mt-3 space-y-1.5">
                  {[
                    ["Tx", r.tx],
                    ["Network", r.network],
                    ["Type", r.type],
                    ["Token", r.token],
                    ...(r.recipient ? [["Recipient", r.recipient] as [string, string]] : []),
                  ].map(([k, v]) => (
                    <div key={k} className="flex gap-2">
                      <dt className="w-16 flex-shrink-0 text-xs" style={{ color: "#555" }}>{k}</dt>
                      <dd className="min-w-0 break-all font-mono text-xs" style={{ color: "#aaa" }}>{v}</dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-3 text-xs italic" style={{ color: "#555" }}>{r.note}</p>

                <a
                  href={`${r.explorerBase}${r.explorerHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs transition-opacity hover:opacity-80"
                  style={{ color: Y }}
                >
                  View on Sepolia Etherscan →
                </a>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs" style={{ color: "#444" }}>
            Full details in{" "}
            <span className="font-mono" style={{ color: "#666" }}>docs/QA_CHECKPOINT_TOKENOPS_DISPERSE.md</span>
          </p>
        </section>

        {/* ── 3. Privacy Guarantees ── */}
        <section>
          <SectionLabel>3 — Privacy Guarantees</SectionLabel>
          <Card>
            <p className="mb-3 text-sm font-bold text-white">What is visible on-chain</p>
            <ul className="space-y-2">
              {PRIVACY_GUARANTEES.map((g) => (
                <li key={g} className="flex items-start gap-2 text-xs" style={{ color: "#666" }}>
                  <span style={{ color: Y, flexShrink: 0 }}>·</span>
                  {g}
                </li>
              ))}
            </ul>
          </Card>
        </section>

        {/* ── 4. Documentation Links ── */}
        <section>
          <SectionLabel>4 — Documentation</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { label: "Registry",          href: "/registry",      note: "Live Zama wrapper registry explorer" },
              { label: "Operations Studio", href: "/operations",    note: "TokenOps Confidential Disperse" },
              { label: "Recipient Portal",  href: "/recipient",     note: "Reveal your own confidential balance" },
            ].map((l) => (
              <Link key={l.label} href={l.href}
                className="rounded-xl px-4 py-3 transition-colors"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <p className="text-sm font-semibold text-white">{l.label} →</p>
                <p className="mt-0.5 text-xs" style={{ color: "#555" }}>{l.note}</p>
              </Link>
            ))}
            {DOC_LINKS.map((d) => (
              <div key={d.label} className="rounded-xl px-4 py-3"
                style={{ background: "rgba(255,255,255,0.015)", border: `1px solid rgba(255,255,255,0.04)` }}>
                <p className="text-sm font-semibold" style={{ color: "#888" }}>{d.label}</p>
                <p className="mt-0.5 font-mono text-xs" style={{ color: "#444" }}>{d.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. CTAs ── */}
        <Card yellow>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: Y, letterSpacing: "0.14em" }}>
            Explore the lifecycle
          </p>
          <p className="mb-5 text-sm text-white">
            Every verified feature is live on Sepolia right now.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/registry"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: Y, color: "#000" }}>
              Open Registry
            </Link>
            <Link href="/operations"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: "#ccc" }}>
              Operations Studio
            </Link>
            <Link href="/recipient"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: "#ccc" }}>
              Recipient Portal
            </Link>
          </div>
        </Card>

      </div>
    </div>
  );
}
