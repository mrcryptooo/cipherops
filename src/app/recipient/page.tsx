import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/layout/SiteNav";

export const metadata: Metadata = {
  title: "Recipient Portal — CipherOps",
  description:
    "Private payouts stay encrypted until the recipient chooses to reveal their own balance.",
};

// ─── Brand ────────────────────────────────────────────────────────────────────
const Y      = "#FFD208";
const CARD   = "rgba(255,255,255,0.025)";
const BORDER = "rgba(255,255,255,0.07)";
const YBORDER = "rgba(255,210,8,0.22)";
const YDIM   = "rgba(255,210,8,0.08)";

const BADGES = [
  "FHE-encrypted payouts",
  "Recipient-controlled reveal",
  "Sepolia ready",
  "No public amounts",
];

const HOW_IT_WORKS = [
  {
    n: "01",
    title: "Receive confidential token payout",
    detail:
      "An admin uses the CipherOps Operations Studio to send ERC-7984 tokens to your wallet. Individual amounts are FHE-encrypted before being broadcast — no one else can read what you received.",
  },
  {
    n: "02",
    title: "Open the Registry",
    detail:
      "Navigate to the Registry Explorer. It reads Zama's official on-chain wrapper registry and lists every ERC-20 ↔ ERC-7984 pair.",
  },
  {
    n: "03",
    title: "Select the same ERC-7984 token",
    detail:
      "Find the confidential token pair matching the address in your payout. Click it to open the Token Action Panel.",
  },
  {
    n: "04",
    title: "Use Private Reveal",
    detail:
      "Click the Private Reveal tab. Connect your wallet on Sepolia. The page will ask you to sign a one-time EIP-712 authorization — this proves you own the wallet without revealing your balance publicly.",
  },
  {
    n: "05",
    title: "See your balance privately",
    detail:
      "The Zama relayer decrypts your encrypted balance locally using your keypair. The plaintext amount appears only in your browser — it is never sent to a server or stored on-chain.",
  },
];

export default function RecipientPage() {
  return (
    <div style={{ background: "#070707", color: "#f4f4f4", minHeight: "100vh" }}>
      <SiteNav activePath="/recipient" />

      {/* ── Page header ── */}
      <div className="border-b px-4 py-12 sm:px-6 lg:px-10" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.18em" }}>
            Recipient Portal
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Your payout, your eyes only.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: "#888" }}>
                Private payouts stay encrypted until the recipient chooses to reveal their own
                balance. Public observers cannot see what you received.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {BADGES.map((b) => (
                <span
                  key={b}
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: YDIM, border: `1px solid ${YBORDER}`, color: Y }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10 sm:px-6 lg:px-10">

        {/* ── How Disperse protects recipients ── */}
        <div className="rounded-xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "#666", letterSpacing: "0.14em" }}>
            How it works
          </p>
          <h2 className="mb-4 text-lg font-bold text-white">
            FHE-encrypted payouts with the TokenOps Disperse
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                icon: "⬡",
                title: "Sender encrypts amounts",
                text: "The Operations Studio uses Zama FHE to encrypt each recipient's amount before the transaction is broadcast. The disperse tx only reveals the token address and recipient count — not individual amounts.",
              },
              {
                icon: "◎",
                title: "On-chain privacy",
                text: "The encrypted ciphertexts live on-chain, but only the respective recipient's wallet can decrypt them. Public block explorers show the transaction but not the individual payouts.",
              },
              {
                icon: "◉",
                title: "Recipient-controlled reveal",
                text: "You — and only you — can reveal your own balance by signing a one-time EIP-712 authorization. The decryption happens locally in your browser; nothing is sent to a server.",
              },
            ].map((c) => (
              <div key={c.title} className="rounded-xl p-4" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}` }}>
                <span className="text-xl" style={{ color: Y }}>{c.icon}</span>
                <p className="mt-2 text-sm font-semibold text-white">{c.title}</p>
                <p className="mt-1.5 text-xs leading-relaxed" style={{ color: "#666" }}>{c.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Step-by-step ── */}
        <div>
          <p className="mb-5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#666", letterSpacing: "0.14em" }}>
            Step-by-step guide
          </p>
          <div className="space-y-3">
            {HOW_IT_WORKS.map((step, i) => (
              <div
                key={step.n}
                className="flex gap-5 rounded-xl p-4"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}
              >
                {/* Number */}
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ background: YDIM, border: `1px solid ${YBORDER}`, color: Y }}
                >
                  {i + 1}
                </div>
                {/* Content */}
                <div>
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="mt-1 text-xs leading-relaxed" style={{ color: "#666" }}>{step.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── CTAs ── */}
        <div className="rounded-xl p-6" style={{ background: YDIM, border: `1px solid ${YBORDER}`, borderTop: `2px solid rgba(255,210,8,0.45)` }}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: Y, letterSpacing: "0.14em" }}>
            Ready to reveal your balance?
          </p>
          <p className="mb-5 text-sm text-white">
            Open the Registry, find the token you received, and use the Private Reveal tab.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/registry"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-bold transition-opacity hover:opacity-90"
              style={{ background: Y, color: "#000" }}
            >
              Open Registry →
            </Link>
            <Link
              href="/operations"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: "#ccc" }}
            >
              View Operations
            </Link>
          </div>
        </div>

        {/* ── Recent payout receipt placeholder ── */}
        <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="mb-0.5 text-xs font-semibold uppercase tracking-widest" style={{ color: "#444", letterSpacing: "0.14em" }}>
            Recent payout receipt
          </p>
          <p className="mt-1 text-sm" style={{ color: "#555" }}>
            If you were sent a payout via CipherOps Operations, the receipt details will appear here in a future update once wallet connection is wired to this page.
          </p>
          <p className="mt-2 text-xs" style={{ color: "#3d3d3d" }}>
            For now: copy the confidential token address from the Operations post-success card, then paste it into the Registry Explorer to locate your pair and start the Private Reveal flow.
          </p>
        </div>

        {/* ── Privacy note ── */}
        <div className="rounded-xl px-5 py-4" style={{ background: "rgba(255,255,255,0.015)", border: `1px solid rgba(255,255,255,0.04)` }}>
          <ul className="space-y-1.5">
            {[
              "Your balance is never revealed on-chain — decryption is local to your browser",
              "The EIP-712 signature authorises the Zama relayer to decrypt only your handle, for your keypair",
              "No backend stores your plaintext balance — it vanishes when you close the tab",
              "Smart wallet users may need a standard EOA wallet (MetaMask) for the signing step",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-xs" style={{ color: "#555" }}>
                <span style={{ color: Y, flexShrink: 0 }}>·</span>{item}
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
