// All 4 lifecycle stages are now live — no "Coming next" anywhere.
// Colors updated to Zama yellow (no blue/sky/cyan).

const STAGES = [
  {
    label: "Public Asset",
    detail: "Standard ERC-20 token with visible balances",
  },
  {
    label: "Confidential Token",
    detail: "ERC-7984 wrapper — balance is encrypted on-chain",
  },
  {
    label: "Private Reveal",
    detail: "Holder decrypts their own balance via view key",
  },
  {
    label: "Unwrap",
    detail: "Redeem back to public ERC-20 at any time",
  },
];

export function PrivacyLifecycle() {
  return (
    <div className="rounded-xl px-5 py-4"
      style={{ background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.07)" }}>
      <p className="mb-4 text-sm font-semibold text-white">Privacy Lifecycle</p>

      <div className="flex flex-col gap-0 sm:flex-row sm:items-start">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex sm:flex-1 sm:flex-col">
            {/* Stage node */}
            <div className="flex sm:flex-col sm:items-start">
              <div
                className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-semibold"
                style={{ background: "rgba(255,210,8,0.12)", border: "1px solid rgba(255,210,8,0.28)", color: "#FFD208" }}
              >
                {i + 1}
              </div>

              {i < STAGES.length - 1 && (
                <div className="mx-3 mt-3.5 h-px flex-1 sm:mx-0 sm:mt-0 sm:hidden sm:h-0"
                  style={{ background: "rgba(255,210,8,0.15)" }} />
              )}
            </div>

            <div className="ml-3 pb-6 sm:ml-0 sm:mt-3 sm:pb-0 sm:pr-4">
              <p className="text-sm font-medium text-white">{stage.label}</p>
              <p className="mt-0.5 text-xs" style={{ color: "#555" }}>{stage.detail}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Horizontal connector bar, visible sm+ */}
      <div className="mt-1 hidden sm:flex sm:items-center sm:gap-0">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex flex-1 items-center">
            <div className="h-px flex-1"
              style={{ background: "linear-gradient(to right, rgba(255,210,8,0.35), rgba(255,210,8,0.10))" }} />
            {i === STAGES.length - 1 && (
              <div className="h-px w-4 bg-transparent" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
