const STEPS = [
  { label: "Connect", icon: "⬡", done: false },
  { label: "Get tokens", icon: "◈", done: false },
  { label: "Wrap", icon: "◉", done: false },
  { label: "Reveal balance", icon: "◎", done: false },
];

export function DemoPath() {
  return (
    <div className="rounded-lg border border-zinc-700/50 bg-zinc-900/40 px-5 py-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-zinc-500">
        Privacy flow — preview
      </p>
      <div className="flex flex-wrap items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 rounded-md border border-zinc-700/50 bg-zinc-800/60 px-3 py-1.5">
              <span className="text-zinc-600 text-sm">{step.icon}</span>
              <span className="text-sm text-zinc-500">{step.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <span className="text-zinc-700 text-xs select-none">→</span>
            )}
          </div>
        ))}
        <span className="ml-2 text-xs text-zinc-600 italic">Coming in Phase 1+</span>
      </div>
    </div>
  );
}
