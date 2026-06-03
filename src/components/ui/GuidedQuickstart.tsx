interface QuickstartStep {
  number: number;
  title: string;
  description: string;
  available: boolean;
}

const STEPS: QuickstartStep[] = [
  {
    number: 1,
    title: "Select a verified wrapper pair",
    description:
      "Browse the live registry and choose an ERC-20 ↔ ERC-7984 pair you want to work with.",
    available: true,
  },
  {
    number: 2,
    title: "Get test assets on Sepolia",
    description:
      "Mint test ERC-20 tokens on Sepolia testnet to use as the wrapping input.",
    available: true,
  },
  {
    number: 3,
    title: "Wrap into ERC-7984",
    description:
      "Approve the wrapper contract and convert your ERC-20 balance into an encrypted confidential token.",
    available: true,
  },
  {
    number: 4,
    title: "Reveal your confidential balance privately",
    description:
      "Decrypt your on-chain encrypted balance using your wallet's view key — only you see the result.",
    available: true,
  },
  {
    number: 5,
    title: "Unwrap back to ERC-20",
    description:
      "Redeem confidential tokens for the public ERC-20 equivalent via Zama Gateway two-step decryption.",
    available: true,
  },
];

export function GuidedQuickstart() {
  return (
    <div className="rounded-xl border border-zinc-700/40 bg-zinc-900/30 px-5 py-5">
      <div className="mb-1 flex flex-col gap-0.5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-200">Guided Quickstart</p>
          <p className="mt-0.5 text-xs text-zinc-500">
            Run through the full confidential-token lifecycle using official Zama wrappers.
          </p>
        </div>
        <span className="mt-2 rounded border border-zinc-700/50 bg-zinc-800/60 px-2 py-0.5 text-xs font-medium text-zinc-500 sm:mt-0 sm:flex-shrink-0">
          Steps 1–5 available
        </span>
      </div>

      <div className="mt-5 space-y-0">
        {STEPS.map((step, i) => (
          <div key={step.number} className="flex gap-4">
            {/* Left rail */}
            <div className="flex flex-col items-center">
              <div
                className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={step.available
                  ? { background: "rgba(255,210,8,0.12)", color: "#FFD208", outline: "1px solid rgba(255,210,8,0.28)" }
                  : { background: "rgba(255,255,255,0.05)", color: "#555", outline: "1px solid rgba(255,255,255,0.08)" }}
              >
                {step.number}
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className="mt-1 w-px flex-1 min-h-[20px]"
                  style={{ background: step.available ? "rgba(255,210,8,0.15)" : "rgba(255,255,255,0.06)" }}
                />
              )}
            </div>

            {/* Content */}
            <div className={`pb-5 flex-1 ${i === STEPS.length - 1 ? "pb-0" : ""}`}>
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={`text-sm font-medium ${
                    step.available ? "text-white" : "text-zinc-500"
                  }`}
                >
                  {step.title}
                </p>
                {!step.available && (
                  <span className="text-xs text-zinc-700">Coming next</span>
                )}
              </div>
              <p className="mt-0.5 text-xs text-zinc-600">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
