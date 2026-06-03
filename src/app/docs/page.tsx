import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/layout/SiteNav";

export const metadata: Metadata = {
  title: "CipherOps Docs",
  description: "Everything you need to understand, test, and verify CipherOps — a Zama-native interface for confidential token lifecycle and private token operations.",
};

// ─── Brand ────────────────────────────────────────────────────────────────────
const Y       = "#FFD208";
const CARD    = "rgba(255,255,255,0.025)";
const BORDER  = "rgba(255,255,255,0.07)";
const YBORDER = "rgba(255,210,8,0.22)";
const YDIM    = "rgba(255,210,8,0.08)";

// ─── Sub-components ───────────────────────────────────────────────────────────

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="mb-4 text-xl font-bold text-white scroll-mt-20">
      {children}
    </h2>
  );
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function Section({ id, label, children }: { id: string; label: string; children: React.ReactNode }) {
  return (
    <section className="mb-14">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest" style={{ color: Y, letterSpacing: "0.16em" }}>
        {label}
      </p>
      {children}
    </section>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
      {children}
    </div>
  );
}
function TxRow({ label, hash, explorer }: { label: string; hash: string; explorer?: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
      <dt className="w-32 flex-shrink-0 text-xs" style={{ color: "#555" }}>{label}</dt>
      <dd className="min-w-0 break-all">
        {explorer ? (
          <a href={explorer} target="_blank" rel="noopener noreferrer"
            className="font-mono text-xs hover:underline" style={{ color: Y }}>{hash}</a>
        ) : (
          <span className="font-mono text-xs" style={{ color: "#aaa" }}>{hash}</span>
        )}
      </dd>
    </div>
  );
}
function AddrRow({ label, addr, explorer }: { label: string; addr: string; explorer?: string }) {
  return (
    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:gap-3">
      <dt className="w-36 flex-shrink-0 text-xs" style={{ color: "#555" }}>{label}</dt>
      <dd className="min-w-0 break-all">
        {explorer ? (
          <a href={explorer} target="_blank" rel="noopener noreferrer"
            className="font-mono text-xs hover:underline" style={{ color: Y }}>{addr}</a>
        ) : (
          <span className="font-mono text-xs" style={{ color: "#aaa" }}>{addr}</span>
        )}
      </dd>
    </div>
  );
}

const SE = "https://sepolia.etherscan.io";

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DocsPage() {
  return (
    <div style={{ background: "#070707", color: "#f4f4f4", minHeight: "100vh" }}>
      <SiteNav activePath="/docs" />

      {/* Header */}
      <div className="border-b px-4 py-12 sm:px-6 lg:px-10" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.18em" }}>
            CipherOps Docs
          </p>
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Everything you need to understand,<br className="hidden sm:block" /> test, and verify CipherOps.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed" style={{ color: "#888" }}>
            CipherOps is a Zama-native interface for discovering confidential token wrappers,
            testing the ERC-7984 lifecycle, and running private token operations through TokenOps.
            All flows are verified on Ethereum Sepolia.
          </p>
          {/* Quick jump */}
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              ["What is CipherOps?", "#what"],
              ["What is Zama?", "#zama"],
              ["Registry Lifecycle", "#lifecycle"],
              ["Disperse", "#disperse"],
              ["Airdrop", "#airdrop"],
              ["Vesting", "#vesting"],
              ["Addresses", "#addresses"],
              ["Privacy Model", "#privacy"],
              ["Limitations", "#limits"],
              ["Quick Start", "#quickstart"],
            ].map(([label, href]) => (
              <a key={href} href={href}
                className="rounded-full px-3 py-1 text-xs font-medium transition-opacity hover:opacity-80"
                style={{ background: YDIM, border: `1px solid ${YBORDER}`, color: Y }}>
                {label}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-10">

        {/* ── 1. What is CipherOps ── */}
        <Section id="what" label="01 — What is CipherOps?">
          <H2 id="what">What is CipherOps?</H2>
          <Card>
            <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>
              CipherOps is a browser-based interface built on Zama fhEVM that demonstrates
              the full confidential token lifecycle. It connects to Zama&apos;s official on-chain
              wrapper registry and exposes every verified ERC-20 ↔ ERC-7984 pair alongside
              interactive flows for wrapping, revealing, and unwrapping.
            </p>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "#aaa" }}>
              On top of the registry lifecycle, CipherOps integrates TokenOps to provide
              three private token operation flows: <strong className="text-white">Confidential Disperse</strong>{" "}
              (private multi-recipient payouts),{" "}
              <strong className="text-white">Confidential Airdrop</strong>{" "}
              (encrypted claim campaigns), and{" "}
              <strong className="text-white">Confidential Vesting</strong>{" "}
              (time-locked encrypted schedules). All flows are verified on Sepolia testnet.
            </p>
          </Card>
        </Section>

        {/* ── 2. What is Zama ── */}
        <Section id="zama" label="02 — What is Zama?">
          <H2 id="zama">What is Zama?</H2>
          <Card>
            <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>
              Zama enables confidential smart contracts using{" "}
              <strong className="text-white">Fully Homomorphic Encryption (FHE)</strong>.
              FHE allows encrypted values to be processed on-chain without ever revealing
              the plaintext — computations happen on the ciphertext directly.
            </p>
            <ul className="mt-3 space-y-1.5">
              {[
                "In CipherOps, token balances and payout amounts are stored as FHE-encrypted values on-chain.",
                "Public observers can see that a transaction occurred but cannot see the encrypted amounts.",
                "Only the token holder can decrypt their own balance by authorizing a one-time EIP-712 request.",
                "The decryption happens locally in the browser — no amount is sent to a server.",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#666" }}>
                  <span style={{ color: Y, flexShrink: 0 }}>·</span>{item}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs" style={{ color: "#555" }}>
              CipherOps uses Zama&apos;s{" "}
              <span className="font-mono" style={{ color: "#888" }}>@zama-fhe/relayer-sdk</span>{" "}
              and{" "}
              <span className="font-mono" style={{ color: "#888" }}>@zama-fhe/sdk</span>{" "}
              for FHE encryption and decryption, and{" "}
              <span className="font-mono" style={{ color: "#888" }}>@tokenops/sdk</span>{" "}
              for private token operation contracts.
            </p>
          </Card>
        </Section>

        {/* ── 3. Core Concepts ── */}
        <Section id="concepts" label="03 — Core Concepts">
          <H2 id="concepts">Core Concepts</H2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { term: "ERC-20", def: "Standard public token. Balances visible to all on-chain." },
              { term: "ERC-7984", def: "Confidential token standard by Zama. Balances are FHE-encrypted." },
              { term: "Wrapper Registry", def: "Zama's official on-chain contract mapping ERC-20 ↔ ERC-7984 pairs." },
              { term: "FHE-encrypted amount", def: "A ciphertext stored on-chain. Only the authorized holder can decrypt it." },
              { term: "Private Reveal", def: "EIP-712 authorization flow that lets a holder decrypt only their own balance, locally." },
              { term: "Zama Gateway", def: "The FHE compute layer that processes encrypted operations like public decrypt for Unwrap." },
              { term: "TokenOps", def: "SDK + deployed contracts for private token operations: Disperse, Airdrop, Vesting." },
              { term: "Sepolia testnet", def: "Ethereum testnet where all CipherOps flows are verified. Mainnet registry is read-only." },
            ].map(({ term, def }) => (
              <div key={term} className="rounded-xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <p className="text-sm font-bold text-white">{term}</p>
                <p className="mt-1 text-xs leading-relaxed" style={{ color: "#666" }}>{def}</p>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 4. Routes Map ── */}
        <Section id="routes" label="04 — Routes">
          <H2 id="routes">Routes Map</H2>
          <div className="overflow-x-auto rounded-xl" style={{ border: `1px solid ${BORDER}` }}>
            <table className="w-full min-w-[500px] text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${BORDER}`, background: "rgba(255,255,255,0.03)" }}>
                  {["Route", "Purpose", "Status"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider" style={{ color: "#555" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["/",             "Product showcase — hero, lifecycle strip, feature cards",         "Live"],
                  ["/registry",     "Full ERC-7984 lifecycle — Faucet, Wrap, Reveal, Unwrap",          "Verified"],
                  ["/operations",   "TokenOps Disperse — private multi-recipient payouts",             "Verified"],
                  ["/airdrop",      "TokenOps Airdrop — encrypted campaign, claims, reveal",           "Verified"],
                  ["/vesting",      "TokenOps Vesting — manager, schedules, recipient claim",          "Verified"],
                  ["/recipient",    "Recipient education — how to reveal an encrypted payout",          "Guide"],
                  ["/verification", "Verified receipts, privacy guarantees, proof center",             "Guide"],
                  ["/developers",   "Developer implementation guide — packages, snippets, routes",     "Guide"],
                  ["/docs",         "Product documentation — this page",                               "Live"],
                ].map(([route, purpose, status]) => (
                  <tr key={route} style={{ borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                    <td className="px-4 py-3">
                      <Link href={route} className="font-mono text-xs hover:underline" style={{ color: Y }}>{route}</Link>
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: "#666" }}>{purpose}</td>
                    <td className="px-4 py-3">
                      <span className="rounded px-2 py-0.5 text-xs font-medium"
                        style={{ background: status === "Verified" ? "rgba(34,197,94,0.08)" : YDIM, color: status === "Verified" ? "#4ade80" : Y, border: `1px solid ${status === "Verified" ? "rgba(34,197,94,0.22)" : YBORDER}` }}>
                        {status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Section>

        {/* ── 5. Registry Lifecycle ── */}
        <Section id="lifecycle" label="05 — Registry Lifecycle">
          <H2 id="lifecycle">Registry Lifecycle</H2>
          <p className="mb-4 text-sm" style={{ color: "#666" }}>All steps verified on Ethereum Sepolia against official Zama deployed contracts.</p>
          <div className="space-y-3">
            {[
              ["1 — Discover", "Browse the official Zama wrapper registry. Every listed pair maps a public ERC-20 to its ERC-7984 confidential counterpart."],
              ["2 — Faucet", "Call ERC20.mint(address, uint256) on the Zama Sepolia test token to get test assets."],
              ["3 — Approve", "Call ERC20.approve(wrapperAddress, amount) to allow the wrapper to spend your tokens."],
              ["4 — Wrap", "Call wrapper.wrap(address, amount) to seal ERC-20 into an FHE-encrypted ERC-7984 token."],
              ["5 — Private Reveal", "Call confidentialBalanceOf to get the encrypted handle, then use EIP-712 user-decrypt via the Zama relayer to view your balance privately."],
              ["6 — Unwrap", "Call wrapper.unwrap(from, to, encryptedAmount, inputProof). The Zama Gateway performs public decrypt."],
              ["7 — Finalize", "Call wrapper.finalizeUnwrap(requestId, cleartext, proof) after the Gateway resolves. ERC-20 is released."],
            ].map(([step, detail]) => (
              <div key={step} className="flex gap-4 rounded-xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold" style={{ background: YDIM, color: Y }}>{step.split(" ")[0]}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{step.slice(step.indexOf(" ") + 1)}</p>
                  <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "#666" }}>{detail}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── 6. Disperse ── */}
        <Section id="disperse" label="06 — TokenOps Disperse">
          <H2 id="disperse">TokenOps Confidential Disperse</H2>
          <Card>
            <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>
              The sender creates a private payout campaign and distributes ERC-7984 tokens to multiple recipients.
              Individual amounts are FHE-encrypted before the transaction is broadcast — public observers see only
              the recipient list, not the amounts. Recipients can import recipients via CSV, and each recipient
              can reveal their own balance privately through the Registry.
            </p>
            <p className="mt-3 text-sm font-semibold text-white">Flow</p>
            <ol className="mt-1 space-y-1">
              {["Register wallet for the token (one-time)", "Approve Disperse singleton as ERC-7984 operator", "Paste CSV or enter recipients + amounts", "Submit Disperse — amounts encrypted by Zama FHE SDK", "Recipient reveals balance via Registry → Private Reveal"].map((s, i) => (
                <li key={i} className="flex gap-2 text-xs" style={{ color: "#666" }}><span style={{ color: Y }}>{i + 1}.</span>{s}</li>
              ))}
            </ol>
            <dl className="mt-4 space-y-1.5">
              <TxRow label="Disperse tx 1" hash="0x650b5e598d3a…8de07752" explorer={`${SE}/tx/0x650b5e598d3a8de07752`} />
              <TxRow label="Disperse tx 2" hash="0x8743a9d98d65…c7264d18" explorer={`${SE}/tx/0x8743a9d98d65c7264d18`} />
            </dl>
          </Card>
        </Section>

        {/* ── 7. Airdrop ── */}
        <Section id="airdrop" label="07 — TokenOps Airdrop">
          <H2 id="airdrop">TokenOps Confidential Airdrop</H2>
          <Card>
            <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>
              Admin deploys and funds a confidential airdrop clone. For each recipient, the admin
              produces an encrypted claim JSON (per-recipient proof bound to that wallet). Recipients
              paste the JSON and call claim. Amounts stay encrypted on-chain until Private Reveal.
            </p>
            <p className="mt-3 text-sm font-semibold text-white">Flow</p>
            <ol className="mt-1 space-y-1">
              {["setOperator(factory, deadline) on the ERC-7984 token", "createAndFundConfidentialAirdrop → campaign deployed + funded in one tx", "Issue Claims: encryptUint64 per recipient + signClaimAuthorization", "Recipient pastes claim JSON + calls useClaim()", "Recipient reveals balance via Registry → Private Reveal"].map((s, i) => (
                <li key={i} className="flex gap-2 text-xs" style={{ color: "#666" }}><span style={{ color: Y }}>{i + 1}.</span>{s}</li>
              ))}
            </ol>
            <dl className="mt-4 space-y-1.5">
              <TxRow label="Create/Fund" hash="0x293a7c13de17ca77adfa6d2978bd07923e1ec910181375c34b43e54ea6196705" explorer={`${SE}/tx/0x293a7c13de17ca77adfa6d2978bd07923e1ec910181375c34b43e54ea6196705`} />
              <TxRow label="Claim" hash="0xb68b7293e655cdd83ebe24e2d0f484c32a18d31a779d082441edb227fb4a59d5" explorer={`${SE}/tx/0xb68b7293e655cdd83ebe24e2d0f484c32a18d31a779d082441edb227fb4a59d5`} />
            </dl>
          </Card>
        </Section>

        {/* ── 8. Vesting ── */}
        <Section id="vesting" label="08 — TokenOps Vesting">
          <H2 id="vesting">TokenOps Confidential Vesting</H2>
          <Card>
            <p className="text-sm leading-relaxed" style={{ color: "#aaa" }}>
              Admin deploys a per-token vesting manager from the factory, then creates time-locked schedules
              with FHE-encrypted allocations. Recipients auto-discover their schedules and claim as tokens vest.
              No per-recipient admin signature required — simpler than Airdrop.
            </p>
            <p className="mt-3 text-sm font-semibold text-white">Flow</p>
            <ol className="mt-1 space-y-1">
              {["createManager (factory, token) → deploy manager clone", "setOperator(manager, deadline) on the ERC-7984 token", "createVesting(params, encryptedAmount) per recipient", "Recipient: useRecipientVestings → discover vestingIds → useClaim", "Recipient reveals vested balance via Registry → Private Reveal"].map((s, i) => (
                <li key={i} className="flex gap-2 text-xs" style={{ color: "#666" }}><span style={{ color: Y }}>{i + 1}.</span>{s}</li>
              ))}
            </ol>
            <dl className="mt-4 space-y-1.5">
              <TxRow label="Manager deploy" hash="0x046a837cac4a8a2a6969a86cc90cc0509ef683d90c2c18d6ce95c393cc97102b" explorer={`${SE}/tx/0x046a837cac4a8a2a6969a86cc90cc0509ef683d90c2c18d6ce95c393cc97102b`} />
              <TxRow label="Schedule create" hash="0x5a7743fabe923e26a298454d4e1957e212506253de862440c48594c2a11f9501" explorer={`${SE}/tx/0x5a7743fabe923e26a298454d4e1957e212506253de862440c48594c2a11f9501`} />
              <TxRow label="Claim" hash="0x398015f3e413b40fc0d14ff79797e8aeca4c5d772e2a87b60d77082804c467ec" explorer={`${SE}/tx/0x398015f3e413b40fc0d14ff79797e8aeca4c5d772e2a87b60d77082804c467ec`} />
            </dl>
          </Card>
        </Section>

        {/* ── 9. Addresses ── */}
        <Section id="addresses" label="09 — Verified Addresses">
          <H2 id="addresses">Verified Contracts (Sepolia)</H2>
          <Card>
            <dl className="space-y-2">
              <AddrRow label="Disperse singleton"  addr="0x710dD9885Cc9986EfD234E7719483147a6d8DBb4" explorer={`${SE}/address/0x710dD9885Cc9986EfD234E7719483147a6d8DBb4`} />
              <AddrRow label="Airdrop factory"     addr="0xbE6A3B78B36684fFee48De77d47Bc3393F5Acd4c" explorer={`${SE}/address/0xbE6A3B78B36684fFee48De77d47Bc3393F5Acd4c`} />
              <AddrRow label="Vesting factory"     addr="0xA87701CE9A52D43681600583a99c85b50DbE3150" explorer={`${SE}/address/0xA87701CE9A52D43681600583a99c85b50DbE3150`} />
              <AddrRow label="ERC-7984 token (test)" addr="0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639" explorer={`${SE}/address/0x7c5BF43B851c1dff1a4feE8dB225b87f2C223639`} />
              <AddrRow label="Airdrop campaign"    addr="0x33C6536FA34416c1e84b6d6E918292E2Da8B5366" explorer={`${SE}/address/0x33C6536FA34416c1e84b6d6E918292E2Da8B5366`} />
              <AddrRow label="Vesting manager"     addr="0xD3B4b66733E1F1Df883581e08f80CcedAF0B5ccE" explorer={`${SE}/address/0xD3B4b66733E1F1Df883581e08f80CcedAF0B5ccE`} />
            </dl>
            <p className="mt-3 text-xs" style={{ color: "#555" }}>All links open Sepolia Etherscan. No custom contracts were deployed by CipherOps.</p>
          </Card>
        </Section>

        {/* ── 10. Privacy Model ── */}
        <Section id="privacy" label="10 — Privacy Model">
          <H2 id="privacy">Privacy Model</H2>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "Public (visible on-chain)", items: ["Transaction hash", "Contract addresses", "Number of recipients", "Timing of operations"] },
              { label: "Private (encrypted on-chain)", items: ["Individual payout amounts", "Vesting allocation amounts", "Airdrop claim amounts", "Confidential token balances"] },
            ].map(({ label, items }) => (
              <div key={label} className="rounded-xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <p className="mb-2 text-xs font-semibold" style={{ color: "#888" }}>{label}</p>
                <ul className="space-y-1">
                  {items.map(i => <li key={i} className="flex gap-2 text-xs" style={{ color: "#aaa" }}><span style={{ color: Y }}>·</span>{i}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-xl p-4" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <p className="text-xs font-semibold text-white mb-2">How Private Reveal works</p>
            <ol className="space-y-1">
              {[
                "Holder calls confidentialBalanceOf → receives a bytes32 encrypted handle",
                "Holder signs a one-time EIP-712 authorization (wallet prompt, local only)",
                "Zama relayer decrypts the handle using the holder's public key",
                "Plaintext balance appears only in the holder's browser — never sent to a server",
              ].map((s, i) => <li key={i} className="flex gap-2 text-xs" style={{ color: "#666" }}><span style={{ color: Y }}>{i + 1}.</span>{s}</li>)}
            </ol>
          </div>
        </Section>

        {/* ── 11. Limitations ── */}
        <Section id="limits" label="11 — Limitations">
          <H2 id="limits">Limitations</H2>
          <Card>
            <ul className="space-y-2">
              {[
                "All write flows (Faucet, Wrap, Reveal, Unwrap, Disperse, Airdrop, Vesting) are Sepolia-only in the current UI.",
                "Ethereum Mainnet registry is read-only — wrapper pair discovery only.",
                "Private Reveal and Unwrap require a standard EOA wallet (MetaMask). Smart-contract wallets may not support the EIP-712 signing flow.",
                "FHE encryption and Private Reveal require connectivity to Zama's public Sepolia relayer (relayer.testnet.zama.org/v2). Relayer availability can affect these flows.",
                "TokenOps production-scale batch flows (large Airdrops, many Vesting recipients) may benefit from server-side signing tooling.",
                "CipherOps has not been audited as a production financial application. It is a developer reference and lifecycle demonstration.",
              ].map((l, i) => (
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color: "#666" }}>
                  <span style={{ color: "#f87171", flexShrink: 0 }}>·</span>{l}
                </li>
              ))}
            </ul>
          </Card>
        </Section>

        {/* ── 12. Quick Start ── */}
        <Section id="quickstart" label="12 — Quick Start">
          <H2 id="quickstart">Quick Start</H2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <p className="mb-3 text-sm font-bold text-white">For testers</p>
              <ol className="space-y-1.5">
                {["Open /registry", "Connect MetaMask on Sepolia", "Faucet — mint test ERC-20", "Approve + Wrap into ERC-7984", "Private Reveal — see your balance", "Try Unwrap + Finalize", "Try Disperse / Airdrop / Vesting at /operations, /airdrop, /vesting"].map((s, i) => (
                  <li key={i} className="flex gap-2 text-xs" style={{ color: "#aaa" }}><span style={{ color: Y }}>{i + 1}.</span>{s}</li>
                ))}
              </ol>
            </div>
            <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <p className="mb-3 text-sm font-bold text-white">For recipients</p>
              <ol className="space-y-1.5">
                {["Receive a payout/claim/vesting tx from admin", "Open /registry", "Find the same ERC-7984 token pair", "Click Private Reveal tab", "Sign EIP-712 authorization in wallet", "Your balance appears — visible only to you"].map((s, i) => (
                  <li key={i} className="flex gap-2 text-xs" style={{ color: "#aaa" }}><span style={{ color: Y }}>{i + 1}.</span>{s}</li>
                ))}
              </ol>
            </div>
          </div>
        </Section>

        {/* ── More resources ── */}
        <Section id="more" label="13 — More Resources">
          <H2 id="more">More Resources</H2>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Recipient Portal", href: "/recipient", desc: "Education on how to reveal an encrypted payout" },
              { label: "Verification Center", href: "/verification", desc: "Verified tx receipts, lifecycle proof, privacy guarantees" },
              { label: "Developer Guide", href: "/developers", desc: "Packages, code snippets, routes, limitations" },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="rounded-xl px-4 py-4 transition-opacity hover:opacity-80"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <p className="text-sm font-semibold text-white">{l.label} →</p>
                <p className="mt-1 text-xs" style={{ color: "#555" }}>{l.desc}</p>
              </Link>
            ))}
          </div>
        </Section>

        {/* ── CTAs ── */}
        <div className="rounded-xl p-6" style={{ background: YDIM, border: `1px solid ${YBORDER}`, borderTop: "2px solid rgba(255,210,8,0.45)" }}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest" style={{ color: Y, letterSpacing: "0.14em" }}>
            Ready to explore?
          </p>
          <p className="mb-5 text-sm text-white">Every feature is live on Sepolia.</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Open Registry", href: "/registry", primary: true },
              { label: "Operations Studio", href: "/operations", primary: false },
              { label: "Airdrop", href: "/airdrop", primary: false },
              { label: "Vesting", href: "/vesting", primary: false },
              { label: "Verification", href: "/verification", primary: false },
            ].map(b => (
              <Link key={b.href} href={b.href}
                className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                style={b.primary ? { background: Y, color: "#000" } : { background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: "#ccc" }}>
                {b.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
