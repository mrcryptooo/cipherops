export function PhaseNotice() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-amber-500/20 bg-amber-500/5 px-4 py-3">
      <span className="mt-0.5 text-amber-400" aria-hidden>⬡</span>
      <div>
        <p className="text-sm font-medium text-amber-300">Phase 0 — Read-only Registry Explorer</p>
        <p className="mt-0.5 text-xs text-amber-400/70">
          Faucet, wrap, decrypt balance, and unwrap are coming in the next phases.
          All on-chain data is read directly from Zama&apos;s official registry contracts.
        </p>
      </div>
    </div>
  );
}
