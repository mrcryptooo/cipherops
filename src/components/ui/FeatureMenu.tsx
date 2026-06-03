// Glass feature-card grid — Server Component safe (no event handlers).

const CARDS = [
  {
    icon: "⬡",
    title: "Registry Explorer",
    body: "Discover official confidential token pairs sourced live from Zama's on-chain registry.",
    ctaLabel: "Open Registry",
    ctaHref: "/registry",
    live: true,
  },
  {
    icon: "◈",
    title: "Test Assets",
    body: "Mint Sepolia mock assets for testing confidential token flows.",
    ctaLabel: "Available in Registry",
    ctaHref: "/registry",
    live: true,
  },
  {
    icon: "◉",
    title: "Wrap",
    body: "Turn ERC-20 assets into ERC-7984 confidential tokens.",
    ctaLabel: "Available in Registry",
    ctaHref: "/registry",
    live: true,
  },
  {
    icon: "◎",
    title: "Private Reveal",
    body: "Reveal encrypted balances only when you choose.",
    ctaLabel: "Available in Registry",
    ctaHref: "/registry",
    live: true,
  },
  {
    icon: "↩",
    title: "Unwrap",
    body: "Return confidential tokens back to ERC-20 through Zama Gateway.",
    ctaLabel: "Available in Registry",
    ctaHref: "/registry",
    live: true,
  },
  {
    icon: "◫",
    title: "Operations Studio",
    body: "Plan private rewards, payouts, airdrops, and contributor distributions.",
    ctaLabel: "Coming next",
    ctaHref: "#operations-preview",
    live: false,
  },
];

export function FeatureMenu() {
  return (
    <section className="py-20" style={{ background: "#050505" }}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-12 max-w-2xl">
          <p
            className="mb-3 text-xs font-semibold uppercase"
            style={{ color: "#FFD208", letterSpacing: "0.16em" }}
          >
            Capabilities
          </p>
          <h2 className="text-2xl font-bold text-white sm:text-3xl">
            Everything you need to use confidential tokens
          </h2>
          <p className="mt-3 text-sm leading-relaxed" style={{ color: "#666" }}>
            From verified registry pairs to private balances and future token operations.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CARDS.map((card) => (
            <div
              key={card.title}
              className="flex flex-col gap-5 rounded-2xl p-6"
              data-feature-card
              style={{
                background: "rgba(255,255,255,0.025)",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              {/* Icon */}
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-lg leading-none select-none"
                style={
                  card.live
                    ? { background: "rgba(255,210,8,0.10)", border: "1px solid rgba(255,210,8,0.22)", color: "#FFD208" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#444" }
                }
              >
                {card.icon}
              </span>

              {/* Body */}
              <div className="flex-1">
                <p className="mb-2 text-sm font-semibold text-white">{card.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "#666" }}>{card.body}</p>
              </div>

              {/* CTA */}
              <a
                href={card.ctaHref}
                className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80"
                style={{ color: card.live ? "#FFD208" : "#444" }}
              >
                {card.ctaLabel}
                {card.live && <span>→</span>}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
