// Glass feature-card grid with inline SVG icons.
// All routes are live — no "Coming soon" states for verified products.

const Y     = "#FFD208";
const YDIM  = "rgba(255,210,8,0.10)";
const YBRD  = "rgba(255,210,8,0.22)";
const CARD  = "rgba(255,255,255,0.028)";
const CBRD  = "rgba(255,255,255,0.07)";

// ─── Minimal inline SVG icons ────────────────────────────────────────────────

function IconRegistry() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" stroke={Y} strokeWidth="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5" stroke={Y} strokeWidth="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5" stroke={Y} strokeWidth="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5" stroke={Y} strokeWidth="1.5"/>
    </svg>
  );
}
function IconFaucet() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
      <circle cx="12" cy="8" r="4" stroke={Y} strokeWidth="1.5"/>
      <path d="M12 12v4M9 18h6" stroke={Y} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 19c0 1.66 1.79 3 4 3s4-1.34 4-3" stroke={Y} strokeWidth="1.5"/>
    </svg>
  );
}
function IconWrap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
      <circle cx="7" cy="12" r="3" stroke={Y} strokeWidth="1.5"/>
      <circle cx="17" cy="12" r="3" stroke={Y} strokeWidth="1.5"/>
      <path d="M10 12h4" stroke={Y} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M14 10l2 2-2 2" stroke={Y} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconReveal() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
      <ellipse cx="12" cy="12" rx="9" ry="5" stroke={Y} strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="2.5" fill={Y}/>
      <path d="M3 12C3 12 6 7 12 7" stroke={Y} strokeWidth="1.5" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}
function IconUnwrap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
      <circle cx="17" cy="12" r="3" stroke={Y} strokeWidth="1.5"/>
      <circle cx="7" cy="12" r="3" stroke={Y} strokeWidth="1.5"/>
      <path d="M14 12h-4" stroke={Y} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M10 10l-2 2 2 2" stroke={Y} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconDisperse() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
      <circle cx="12" cy="5" r="2" stroke={Y} strokeWidth="1.5"/>
      <circle cx="5" cy="19" r="2" stroke={Y} strokeWidth="1.5"/>
      <circle cx="19" cy="19" r="2" stroke={Y} strokeWidth="1.5"/>
      <path d="M12 7v4M9.8 15.5L7 17M14.2 15.5L17 17M12 11l-4.2 4.5M12 11l4.2 4.5" stroke={Y} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  );
}
function IconAirdrop() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
      <path d="M5 9.5C5 6.46 8.13 4 12 4s7 2.46 7 5.5c0 2.1-1.4 3.93-3.5 4.92V19a1 1 0 01-1 1h-5a1 1 0 01-1-1v-4.58C6.4 13.43 5 11.6 5 9.5z" stroke={Y} strokeWidth="1.5"/>
      <path d="M10 19h4" stroke={Y} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M8 9.5h8" stroke={Y} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}
function IconVesting() {
  return (
    <svg viewBox="0 0 24 24" fill="none" width={18} height={18}>
      <circle cx="12" cy="12" r="8" stroke={Y} strokeWidth="1.5"/>
      <path d="M12 8v4l3 2" stroke={Y} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M4 12H2M22 12h-2" stroke={Y} strokeWidth="1.2" strokeLinecap="round" opacity="0.4"/>
    </svg>
  );
}

// ─── Card data ────────────────────────────────────────────────────────────────

const CARDS = [
  {
    Icon: IconRegistry,
    title: "Registry Explorer",
    body: "Discover official ERC-20 ↔ ERC-7984 confidential token pairs sourced live from Zama's on-chain registry.",
    ctaLabel: "Open Registry",
    ctaHref: "/registry",
    badge: "Live · Verified",
  },
  {
    Icon: IconFaucet,
    title: "Test Assets",
    body: "Mint Sepolia mock ERC-20 tokens for testing confidential token flows — no mainnet funds required.",
    ctaLabel: "Available in Registry",
    ctaHref: "/registry",
    badge: "Live · Verified",
  },
  {
    Icon: IconWrap,
    title: "Wrap",
    body: "Seal ERC-20 assets into ERC-7984 confidential tokens. Balances become encrypted on-chain.",
    ctaLabel: "Available in Registry",
    ctaHref: "/registry",
    badge: "Live · Verified",
  },
  {
    Icon: IconReveal,
    title: "Private Reveal",
    body: "Decrypt your own confidential balance using EIP-712 user-authorization. Only you see the result.",
    ctaLabel: "Available in Registry",
    ctaHref: "/registry",
    badge: "Live · Verified",
  },
  {
    Icon: IconUnwrap,
    title: "Unwrap",
    body: "Return confidential tokens back to ERC-20 through Zama Gateway two-step public decryption.",
    ctaLabel: "Available in Registry",
    ctaHref: "/registry",
    badge: "Live · Verified",
  },
  {
    Icon: IconDisperse,
    title: "Confidential Disperse",
    body: "Send private multi-recipient payouts. Individual amounts are FHE-encrypted before broadcast.",
    ctaLabel: "Open Operations",
    ctaHref: "/operations",
    badge: "Live · Verified",
  },
  {
    Icon: IconAirdrop,
    title: "Confidential Airdrop",
    body: "Create encrypted airdrop campaigns. Admin issues claim authorizations; recipients claim privately.",
    ctaLabel: "Open Airdrop",
    ctaHref: "/airdrop",
    badge: "Live · Verified",
  },
  {
    Icon: IconVesting,
    title: "Confidential Vesting",
    body: "Deploy time-locked vesting managers with encrypted allocations. Recipients claim as tokens unlock.",
    ctaLabel: "Open Vesting",
    ctaHref: "/vesting",
    badge: "Live · Verified",
  },
];

export function FeatureMenu() {
  return (
    <section className="py-20" style={{ background: "#050505" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <p className="mb-3 text-xs font-semibold uppercase"
            style={{ color: Y, letterSpacing: "0.16em" }}>
            All capabilities — verified on Sepolia
          </p>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            The full confidential token lifecycle, live.
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "#666" }}>
            Registry discovery, private reveal, FHE-encrypted payouts, airdrops, and vesting — all verified with real Sepolia transactions.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="flex flex-col gap-4 rounded-2xl p-5"
              data-feature-card
              style={{ background: CARD, border: `1px solid ${CBRD}` }}
            >
              {/* Icon */}
              <div className="flex items-start justify-between gap-2">
                <span
                  className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl"
                  style={{ background: YDIM, border: `1px solid ${YBRD}` }}
                >
                  <card.Icon />
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: YDIM, border: `1px solid ${YBRD}`, color: Y, whiteSpace: "nowrap" }}
                >
                  {card.badge}
                </span>
              </div>

              {/* Body */}
              <div className="flex-1">
                <p className="mb-1.5 text-sm font-semibold text-white">{card.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "#666" }}>{card.body}</p>
              </div>

              {/* CTA */}
              <a
                href={card.ctaHref}
                className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ color: Y }}
              >
                {card.ctaLabel} →
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
