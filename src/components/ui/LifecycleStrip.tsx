const STEPS = [
  { n: 1, label: "Discover",  detail: "Live registry pairs"      },
  { n: 2, label: "Wrap",      detail: "ERC-20 → ERC-7984"        },
  { n: 3, label: "Reveal",    detail: "Private balance decrypt"   },
  { n: 4, label: "Unwrap",    detail: "ERC-7984 → ERC-20"        },
  { n: 5, label: "Operate",   detail: "Airdrops · Payouts · Vest" },
];

export function LifecycleStrip() {
  return (
    <div
      className="w-full"
      style={{
        background: "#080808",
        borderTop: "1px solid rgba(255,255,255,0.05)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
      }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-start justify-center py-8 sm:flex-nowrap sm:items-stretch">
          {STEPS.map((step, i) => (
            <div key={step.label} className="flex items-center">
              {/* Step */}
              <div
                className="flex min-w-[100px] flex-col items-center gap-2 px-4 py-2 text-center sm:px-6"
                data-lifecycle-step
              >
                {/* Numbered circle */}
                <span
                  className="inline-flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold"
                  style={
                    step.n <= 4
                      ? { background: "rgba(255,210,8,0.12)", border: "1px solid rgba(255,210,8,0.28)", color: "#FFD208" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "#444" }
                  }
                >
                  {step.n}
                </span>
                <span
                  className="text-xs font-semibold"
                  style={{ color: step.n <= 4 ? "#ddd" : "#444" }}
                >
                  {step.label}
                </span>
                <span className="hidden text-xs sm:block" style={{ color: "#3a3a3a" }}>
                  {step.detail}
                </span>
                {step.n === 5 && (
                  <span
                    className="rounded-full px-2 py-0.5 text-xs"
                    style={{ background: "rgba(255,255,255,0.03)", color: "#3a3a3a", border: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    soon
                  </span>
                )}
              </div>

              {/* Connector — yellow line for live steps, dark for upcoming */}
              {i < STEPS.length - 1 && (
                <div
                  className="hidden h-px w-6 flex-shrink-0 sm:block"
                  style={{
                    background: i < 3
                      ? "linear-gradient(to right, rgba(255,210,8,0.40), rgba(255,210,8,0.15))"
                      : "rgba(255,255,255,0.06)",
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
