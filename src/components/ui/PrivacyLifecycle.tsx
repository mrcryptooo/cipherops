interface LifecycleStage {
  label: string;
  detail: string;
  active: boolean;
}

const STAGES: LifecycleStage[] = [
  {
    label: "Public Asset",
    detail: "Standard ERC-20 token with visible balances",
    active: true,
  },
  {
    label: "Confidential Token",
    detail: "ERC-7984 wrapper — balance is encrypted on-chain",
    active: true,
  },
  {
    label: "Private Reveal",
    detail: "Holder decrypts their own balance via view key",
    active: false,
  },
  {
    label: "Unwrap",
    detail: "Redeem back to public ERC-20 at any time",
    active: false,
  },
];

export function PrivacyLifecycle() {
  return (
    <div className="rounded-xl border border-zinc-700/40 bg-zinc-900/30 px-5 py-4">
      <p className="mb-4 text-sm font-semibold text-zinc-200">Privacy Lifecycle</p>

      <div className="flex flex-col gap-0 sm:flex-row sm:items-start">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex sm:flex-1 sm:flex-col">
            {/* Stage node */}
            <div className="flex sm:flex-col sm:items-start">
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  stage.active
                    ? "border-sky-500/40 bg-sky-500/10 text-sky-400"
                    : "border-zinc-700/50 bg-zinc-800/50 text-zinc-600"
                }`}
              >
                {i + 1}
              </div>

              {/* Connector line (horizontal on sm+, vertical on mobile) */}
              {i < STAGES.length - 1 && (
                <div className="mx-3 mt-3.5 h-px flex-1 sm:mx-0 sm:mt-0 sm:hidden sm:h-0" />
              )}
            </div>

            <div className="ml-3 pb-6 sm:ml-0 sm:mt-3 sm:pb-0 sm:pr-4">
              <p
                className={`text-sm font-medium ${
                  stage.active ? "text-white" : "text-zinc-500"
                }`}
              >
                {stage.label}
              </p>
              <p className="mt-0.5 text-xs text-zinc-600">{stage.detail}</p>
              {!stage.active && (
                <span className="mt-1 inline-block text-xs text-zinc-700">Coming next</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Horizontal connector bar, visible sm+ */}
      <div className="mt-1 hidden sm:flex sm:items-center sm:gap-0">
        {STAGES.map((stage, i) => (
          <div key={stage.label} className="flex flex-1 items-center">
            <div
              className={`h-px flex-1 ${
                stage.active ? "bg-sky-500/30" : "bg-zinc-700/40"
              }`}
            />
            {i === STAGES.length - 1 && (
              <div className="h-px w-4 bg-transparent" />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
