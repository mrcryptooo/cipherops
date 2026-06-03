import type { Metadata } from "next";
import Link from "next/link";
import { SiteNav } from "@/components/layout/SiteNav";

export const metadata: Metadata = {
  title: "Developer Guide — CipherOps",
  description:
    "Build confidential token flows with Zama ERC-7984, the wrapper registry, private reveal, unwrap, and TokenOps Disperse.",
};

// ─── Brand ────────────────────────────────────────────────────────────────────
const Y       = "#FFD208";
const CARD    = "rgba(255,255,255,0.025)";
const BORDER  = "rgba(255,255,255,0.07)";
const YBORDER = "rgba(255,210,8,0.22)";
const YDIM    = "rgba(255,210,8,0.08)";

const BADGES = [
  "Zama Registry",
  "ERC-7984",
  "Private Reveal",
  "TokenOps SDK",
  "Sepolia Verified",
];

const FLOW_STEPS = [
  { label: "Official Registry",  detail: "Read live ERC-20 ↔ ERC-7984 pairs from Zama's on-chain registry contracts" },
  { label: "ERC-20 Faucet",      detail: "Mint Sepolia test tokens via ERC20.mint(address, uint256) on official mock tokens" },
  { label: "Approve",            detail: "ERC20.approve(wrapper, amount) — grant the wrapper spending rights" },
  { label: "Wrap",               detail: "wrapper.wrap(address, uint256) — seal ERC-20 into an FHE-encrypted ERC-7984 token" },
  { label: "Private Reveal",     detail: "confidentialBalanceOf → EIP-712 user-decrypt via Zama relayer → plaintext in browser only" },
  { label: "Unwrap",             detail: "wrapper.unwrap(…, encHandle, inputProof) + publicDecrypt → finalizeUnwrap — two-step Zama Gateway flow" },
  { label: "TokenOps Disperse",  detail: "register(token) + setOperator(singleton) + FHE-encrypt amounts → Disperse singleton on Sepolia + Mainnet" },
];

const PACKAGES = [
  {
    name: "wagmi v2 + viem",
    version: "wagmi@^2.15 / viem@^2.31",
    role: "Contract reads, writes, wallet connection, multicall, chain config. All registry reads and lifecycle write calls use wagmi hooks.",
  },
  {
    name: "@zama-fhe/relayer-sdk",
    version: "^0.4.3",
    role: "Original Zama FHE SDK used for Private Reveal and Unwrap flows. Provides userDecrypt / publicDecrypt / createFhevmInstance.",
  },
  {
    name: "@zama-fhe/sdk",
    version: "3.0.1",
    role: "Newer Zama unified SDK required by @tokenops/sdk peer dep. Provides RelayerWeb (browser Web Worker), ViemSigner, and SepoliaConfig.",
  },
  {
    name: "@tokenops/sdk",
    version: "1.0.0",
    role: "TokenOps typed viem-first SDK. Provides ConfidentialDisperseClient, useDisperse, useRegister, usePreflightDisperse, and all React hooks for fhe-disperse / fhe-airdrop / fhe-vesting.",
  },
  {
    name: "RainbowKit v2",
    version: "^2.2.5",
    role: "Wallet connection UI (MetaMask, Coinbase Wallet, WalletConnect). Custom dark-themed ConnectButton.",
  },
  {
    name: "Next.js 15",
    version: "^15.3",
    role: "App Router, server components, static prerendering. All write-flow components are client components; informational pages are static.",
  },
];

const SNIPPETS = [
  {
    title: "Read registry pairs",
    lang: "typescript",
    code: `// From src/hooks/useRegistryPairs.ts
const { data } = useReadContract({
  address: REGISTRY_ADDRESS,       // Zama on-chain registry
  abi: REGISTRY_ABI,
  functionName: "getTokenConfidentialTokenPairs",
  chainId: 11155111,               // Sepolia
});
// Returns { tokenAddress, confidentialTokenAddress, isValid }[]`,
  },
  {
    title: "Read encrypted balance handle",
    lang: "typescript",
    code: `// From src/components/registry/TokenActionPanel.tsx
const { data: handle } = useReadContract({
  address: wrapperAddress,         // ERC-7984 confidential token
  abi: WRAPPER_ABI,
  functionName: "confidentialBalanceOf",
  args: [userAddress],
});
// Returns bytes32 — FHE-encrypted handle, NOT plaintext`,
  },
  {
    title: "Decrypt balance (Private Reveal)",
    lang: "typescript",
    code: `// From src/lib/fhevm/react/useFHEDecrypt.ts
const { decrypt, results } = useFHEDecrypt({
  instance,                        // FhevmInstance from useFhevm()
  ethersSigner,                    // ethers.JsonRpcSigner (from wagmi)
  fhevmDecryptionSignatureStorage, // in-memory storage
  chainId,
  requests: [{ handle, contractAddress }],
});
decrypt(); // prompts EIP-712 sign → Zama relayer → plaintext in results[handle]`,
  },
  {
    title: "TokenOps Disperse — register + send",
    lang: "typescript",
    code: `// From src/components/operations/DisperseForm.tsx
// 1. One-time registration per token
useRegister().mutate({ token: erc7984Address });

// 2. Approve singleton as ERC-7984 operator
writeContract({ abi: erc7984OperatorAbi, functionName: "setOperator",
  args: [DISPERSE_SINGLETON, ERC7984_OPERATOR_MAX_DEADLINE] });

// 3. FHE-encrypt amounts and disperse
useDisperse({ encryptor: encryptorFactory }).mutate({
  token: erc7984Address,
  mode: "direct",
  recipients: ["0xAlice", "0xBob"],
  amounts: [parseUnits("10", 18), parseUnits("20", 18)],
});
// SDK encrypts each amount locally before broadcast`,
  },
  {
    title: "Unwrap two-step lifecycle",
    lang: "typescript",
    code: `// From src/hooks/useUnwrapAction.ts
// Step 1: encrypt amount + submit unwrap
const { handles, inputProof } = await instance
  .createEncryptedInput(wrapperAddress, userAddress).add64(amount).encrypt();
writeContract({ functionName: "unwrap",
  args: [from, to, handles[0], inputProof] });

// Step 2: Zama Gateway public decrypt
const { clearValues, decryptionProof } =
  await instance.publicDecrypt([unwrapRequestId]);

// Step 3: finalize — releases underlying ERC-20
writeContract({ functionName: "finalizeUnwrap",
  args: [unwrapRequestId, clearValues[unwrapRequestId], decryptionProof] });`,
  },
];

const ROUTES = [
  { path: "/",             desc: "Product showcase — hero video, lifecycle strip, protocol coverage, feature menu" },
  { path: "/registry",     desc: "Live lifecycle app — registry explorer, Faucet/Approve/Wrap/Private Reveal/Unwrap" },
  { path: "/operations",   desc: "TokenOps Disperse — register, allow, CSV import, send FHE-encrypted payouts" },
  { path: "/recipient",    desc: "Recipient education — how to reveal an encrypted payout via Private Reveal" },
  { path: "/verification", desc: "Proof center — verified tx receipts, lifecycle checklist, privacy guarantees" },
  { path: "/developers",   desc: "This page — architecture, packages, code snippets, route map, limitations" },
];

const LIMITATIONS = [
  "All write flows (Faucet, Wrap, Private Reveal, Unwrap, Disperse) are Sepolia-only in the current UI.",
  "Ethereum Mainnet: registry read and pair discovery only. Write actions are gated by chainId === 11155111.",
  "TokenOps Confidential Disperse is verified on Sepolia (2 confirmed transactions). Airdrop and Vesting SDKs are installed but not integrated yet.",
  "Private Reveal and Unwrap require standard EOA wallets (MetaMask). Smart wallets may not support EIP-712 signing.",
  "FHE encryption requires connectivity to Zama's public Sepolia relayer (relayer.testnet.zama.org/v2). Relayer downtime affects all FHE flows.",
  "No fake balances, invented tx hashes, or mocked SDK calls. All verified transactions are real Sepolia on-chain events.",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-4 text-xs font-semibold uppercase tracking-widest"
       style={{ color: "#666", letterSpacing: "0.14em" }}>
      {children}
    </p>
  );
}

function CodeBlock({ title, code }: { title: string; code: string }) {
  return (
    <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
      <div className="flex items-center justify-between px-4 py-2"
           style={{ background: "rgba(255,255,255,0.03)", borderBottom: `1px solid ${BORDER}` }}>
        <span className="text-xs font-semibold" style={{ color: "#888" }}>{title}</span>
        <span className="rounded px-1.5 py-0.5 text-xs" style={{ background: "rgba(255,210,8,0.08)", color: Y }}>ts</span>
      </div>
      <pre className="overflow-x-auto px-4 py-3 text-xs leading-relaxed"
           style={{ background: "#0a0a0a", color: "#aaa", fontFamily: "ui-monospace, monospace" }}>
        <code>{code}</code>
      </pre>
    </div>
  );
}

export default function DevelopersPage() {
  return (
    <div style={{ background: "#070707", color: "#f4f4f4", minHeight: "100vh" }}>
      <SiteNav activePath="/developers" />

      {/* ── Header ── */}
      <div className="border-b px-4 py-12 sm:px-6 lg:px-10" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.18em" }}>
            Developer Guide
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Build on Zama confidential tokens.
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: "#888" }}>
                CipherOps is a production reference implementation for Zama ERC-7984 workflows —
                from registry discovery through private reveal, unwrap, and TokenOps Disperse.
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

        {/* ── 1. Architecture Overview ── */}
        <section>
          <SectionLabel>1 — Architecture Overview</SectionLabel>
          <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <p className="mb-4 text-sm font-bold text-white">Full lifecycle demonstrated by CipherOps</p>
            <div className="space-y-2">
              {FLOW_STEPS.map((step, i) => (
                <div key={step.label} className="flex items-start gap-3">
                  {/* Step number + connector */}
                  <div className="flex flex-col items-center">
                    <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ background: YDIM, color: Y, border: `1px solid ${YBORDER}` }}>
                      {i + 1}
                    </span>
                    {i < FLOW_STEPS.length - 1 && (
                      <span className="mt-1 h-4 w-px" style={{ background: BORDER }} />
                    )}
                  </div>
                  <div className="pb-1">
                    <span className="text-sm font-semibold text-white">{step.label}</span>
                    <p className="mt-0.5 text-xs" style={{ color: "#666" }}>{step.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 2. Key Packages ── */}
        <section>
          <SectionLabel>2 — Key SDKs & Packages</SectionLabel>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {PACKAGES.map((pkg) => (
              <div key={pkg.name} className="rounded-xl p-4"
                style={{ background: CARD, border: `1px solid ${BORDER}` }}>
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm font-bold text-white">{pkg.name}</p>
                  <span className="flex-shrink-0 rounded px-1.5 py-0.5 font-mono text-xs"
                    style={{ background: "rgba(255,255,255,0.04)", color: "#666" }}>
                    {pkg.version}
                  </span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "#666" }}>{pkg.role}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs" style={{ color: "#444" }}>
            Full analysis in{" "}
            <span className="font-mono" style={{ color: "#666" }}>docs/TOKENOPS_CLIENT_ANALYSIS.md</span>
          </p>
        </section>

        {/* ── 3. Implementation Notes ── */}
        <section>
          <SectionLabel>3 — Implementation Notes</SectionLabel>
          <div className="space-y-3">
            {SNIPPETS.map((s) => (
              <CodeBlock key={s.title} title={s.title} code={s.code} />
            ))}
          </div>
        </section>

        {/* ── 4. Routes Map ── */}
        <section>
          <SectionLabel>4 — Routes</SectionLabel>
          <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${BORDER}` }}>
            {ROUTES.map((r, i) => (
              <div key={r.path}
                className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:gap-4"
                style={{ borderTop: i > 0 ? `1px solid ${BORDER}` : undefined, background: "transparent" }}>
                <Link href={r.path}
                  className="w-32 flex-shrink-0 font-mono text-sm font-semibold transition-opacity hover:opacity-80"
                  style={{ color: Y }}>
                  {r.path}
                </Link>
                <p className="text-xs" style={{ color: "#666" }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── 5. Safety / Limitations ── */}
        <section>
          <SectionLabel>5 — Safety & Limitations</SectionLabel>
          <div className="rounded-xl p-5" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
            <ul className="space-y-2">
              {LIMITATIONS.map((l) => (
                <li key={l} className="flex items-start gap-2 text-xs" style={{ color: "#666" }}>
                  <span style={{ color: Y, flexShrink: 0 }}>·</span>{l}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* ── 6. External Docs ── */}
        <section>
          <SectionLabel>6 — External Resources</SectionLabel>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Zama Docs",       href: "https://docs.zama.ai" },
              { label: "Zama dApps repo", href: "https://github.com/zama-ai/dapps" },
              { label: "fhEVM GitHub",    href: "https://github.com/zama-ai/fhevm" },
              { label: "protocol-apps",   href: "https://github.com/zama-ai/protocol-apps" },
            ].map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noopener noreferrer"
                className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#888" }}>
                {l.label} ↗
              </a>
            ))}
          </div>
        </section>

        {/* ── 7. CTAs ── */}
        <div className="rounded-xl p-6"
          style={{ background: YDIM, border: `1px solid ${YBORDER}`, borderTop: `2px solid rgba(255,210,8,0.45)` }}>
          <p className="mb-1 text-xs font-semibold uppercase tracking-widest"
             style={{ color: Y, letterSpacing: "0.14em" }}>
            Explore the implementation
          </p>
          <p className="mb-5 text-sm text-white">
            Every feature is live on Sepolia. All source is in this repository.
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
            <Link href="/verification"
              className="inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${BORDER}`, color: "#ccc" }}>
              View Verification
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
