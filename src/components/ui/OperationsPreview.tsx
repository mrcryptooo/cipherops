const OPS_CARDS = [
  {
    icon: "◈",
    title: "Confidential Airdrops",
    body: "Distribute tokens privately to recipient lists without revealing amounts or balances on-chain.",
  },
  {
    icon: "◎",
    title: "Private Payouts",
    body: "Send contributor rewards and payments through encrypted ERC-7984 transfers.",
  },
  {
    icon: "◉",
    title: "Contributor Rewards",
    body: "Automate on-chain reward distributions with amounts visible only to the recipient.",
  },
  {
    icon: "⬡",
    title: "Vesting & Unlocks",
    body: "Deploy time-locked vesting schedules with confidential token amounts.",
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
            <p
              className="mb-3 text-xs font-semibold uppercase"
              style={{ color: "#FFD208", letterSpacing: "0.16em" }}
            >
              Operations Studio
            </p>
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Built for private token operations
            </h2>
            <p className="mt-3 text-sm leading-relaxed" style={{ color: "#666" }}>
              Confidential token workflows for teams, protocols, and contributors.
            </p>
          </div>

          {/* Status badge */}
          <div
            className="flex-shrink-0 self-start rounded-xl px-4 py-3"
            style={{ background: "rgba(255,210,8,0.05)", border: "1px solid rgba(255,210,8,0.18)" }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: "#FFD208" }} />
              <p className="text-xs font-semibold" style={{ color: "#FFD208" }}>In preparation</p>
            </div>
            <p className="max-w-xs text-xs leading-relaxed" style={{ color: "#666" }}>
              Operations Studio is being prepared for TokenOps integration.
              Core token lifecycle is already live on Sepolia.
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {OPS_CARDS.map((card) => (
            <div
              key={card.title}
              className="flex flex-col gap-4 rounded-2xl p-5"
              data-ops-card
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
              }}
            >
              <span
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl text-base select-none flex-shrink-0"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)", color: "#3a3a3a" }}
              >
                {card.icon}
              </span>
              <div className="flex-1">
                <p className="mb-1.5 text-sm font-semibold" style={{ color: "#aaa" }}>{card.title}</p>
                <p className="text-xs leading-relaxed" style={{ color: "#4a4a4a" }}>{card.body}</p>
              </div>
              <span
                className="self-start rounded-full px-2.5 py-0.5 text-xs font-medium"
                style={{ background: "rgba(255,255,255,0.03)", color: "#3a3a3a", border: "1px solid rgba(255,255,255,0.05)" }}
              >
                Coming next
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
