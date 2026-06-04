// Operations Studio preview — all four products are now live on Sepolia.

const OPS_CARDS = [
  {
    icon: "◈",
    title: "Confidential Disperse",
    body: "Send FHE-encrypted payouts to multiple recipients. Import recipients by CSV. Amounts stay private.",
    href: "/operations",
    badge: "Live",
  },
  {
    icon: "◎",
    title: "Confidential Airdrop",
    body: "Create a funded airdrop campaign. Issue per-recipient claim authorizations. Recipients claim privately.",
    href: "/airdrop",
    badge: "Live",
  },
  {
    icon: "⬡",
    title: "Confidential Vesting",
    body: "Deploy vesting manager clones. Create time-locked schedules with encrypted allocations. Recipients claim as tokens unlock.",
    href: "/vesting",
    badge: "Live",
  },
  {
    icon: "◉",
    title: "Recipient Portal",
    body: "Recipients learn how to find and reveal their encrypted balance through the Registry Private Reveal flow.",
    href: "/recipient",
    badge: "Guide",
  },
];

export function OperationsPreview() {
  return (
    <section
      id="operations-preview"
      className="py-20"
      style={{ background: "#060606", borderTop: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-xl">
            <p className="mb-3 text-xs font-semibold uppercase"
              style={{ color: "#FFD208", letterSpacing: "0.16em" }}>
              Operations Studio
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Private token operations — live on Sepolia.
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "#666" }}>
              FHE-encrypted payouts, airdrops, and vesting — all verified with real Sepolia transactions.
            </p>
          </div>

          {/* Status badge */}
          <div
            className="flex-shrink-0 self-start rounded-xl px-4 py-3"
            style={{ background: "rgba(255,210,8,0.06)", border: "1px solid rgba(255,210,8,0.22)" }}
          >
            <div className="mb-1.5 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FFD208" }} />
              <p className="text-xs font-semibold" style={{ color: "#FFD208" }}>Live on Sepolia</p>
            </div>
            <p className="max-w-xs text-xs leading-relaxed" style={{ color: "#888" }}>
              Confidential Disperse, Airdrop, and Vesting are all verified with real on-chain transactions.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OPS_CARDS.map((card) => (
            <a
              key={card.title}
              href={card.href}
              className="flex flex-col gap-4 rounded-2xl p-5 transition-colors no-underline"
              data-ops-card
              style={{
                background: "rgba(255,210,8,0.03)",
                border: "1px solid rgba(255,210,8,0.12)",
              }}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="inline-flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-base select-none"
                  style={{ background: "rgba(255,210,8,0.10)", border: "1px solid rgba(255,210,8,0.22)", color: "#FFD208" }}
                >
                  {card.icon}
                </span>
                <span
                  className="rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ background: "rgba(255,210,8,0.10)", border: "1px solid rgba(255,210,8,0.22)", color: "#FFD208" }}
                >
                  {card.badge}
                </span>
              </div>
              <div className="flex-1">
                <p className="mb-1.5 text-sm font-semibold text-white">{card.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "#666" }}>{card.body}</p>
              </div>
              <span className="text-xs font-semibold" style={{ color: "#FFD208" }}>
                Open →
              </span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
