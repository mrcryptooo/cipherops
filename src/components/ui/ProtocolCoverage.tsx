interface CoverageItem {
  label: string;
  description: string;
  live: boolean;
}

const ITEMS: CoverageItem[] = [
  {
    label: "Live Registry",
    description: "On-chain pair data fetched directly from the official Zama registry contract",
    live: true,
  },
  {
    label: "Sepolia + Mainnet",
    description: "Both testnet and mainnet registry contracts are indexed",
    live: true,
  },
  {
    label: "Testnet Faucet",
    description: "Mint test ERC-20 tokens on Sepolia for wrapping",
    live: true,
  },
  {
    label: "Wrap",
    description: "Approve ERC-20 allowance and wrap into ERC-7984 confidential token",
    live: true,
  },
  {
    label: "Private Reveal",
    description: "Decrypt your encrypted balance using your wallet's view key",
    live: true,
  },
  {
    label: "Unwrap",
    description: "Redeem confidential tokens back to their public ERC-20 counterpart",
    live: true,
  },
];

const liveCount = ITEMS.filter((i) => i.live).length;

export function ProtocolCoverage() {
  return (
    <div
      className="rounded-xl px-5 py-5"
      style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}
    >
      <div className="mb-4 flex items-center gap-3">
        <p className="text-sm font-semibold text-white">Protocol Coverage</p>
        <span
          className="rounded px-2 py-0.5 text-xs font-semibold"
          style={{ background: "rgba(255,210,8,0.12)", color: "#FFD208", border: "1px solid rgba(255,210,8,0.22)" }}
        >
          {liveCount} / {ITEMS.length} live · Sepolia verified
        </span>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        {ITEMS.map((item) => (
          <div
            key={item.label}
            title={item.description}
            className="flex flex-col gap-1.5 rounded-lg px-3 py-2.5 transition-colors"
            style={
              item.live
                ? { background: "rgba(255,210,8,0.06)", border: "1px solid rgba(255,210,8,0.18)" }
                : { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }
            }
          >
            <div className="flex items-center gap-1.5">
              <span
                className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
                style={{ background: item.live ? "#FFD208" : "#3d3d3d" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: item.live ? "#FFD208" : "#555" }}
              >
                {item.label}
              </span>
            </div>
            {!item.live && (
              <span className="text-xs" style={{ color: "#333" }}>Coming next</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
