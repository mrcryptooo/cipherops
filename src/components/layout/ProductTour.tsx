"use client";
/**
 * CipherOps — first-time product tour. Shown once ever (localStorage-gated),
 * a lightweight modal walkthrough of the site's main sections. Purely
 * informational — it never blocks or alters any page's own functionality,
 * and once dismissed (Skip or Finish) it never appears again.
 */

import { useEffect, useState } from "react";

const STORAGE_KEY = "cipherops:tour-seen:v1";

const Y = "#FFD208";
const CARD = "#0d0d0d";
const BORDER = "rgba(255,255,255,0.10)";

interface TourStep {
  title: string;
  body: string;
}

const STEPS: TourStep[] = [
  { title: "Navigation", body: "Every feature lives in the top nav — Registry, Operations, Airdrop, Vesting, and Runway are all one click away." },
  { title: "Registry", body: "Wrap any token into its confidential form here, and reveal or unwrap it whenever you need to." },
  { title: "Operations", body: "Send confidential payouts to multiple people in one transaction — only each recipient sees their own amount." },
  { title: "Airdrop", body: "Fund a campaign and issue private claims. Amounts stay encrypted per recipient." },
  { title: "Vesting", body: "Set up encrypted vesting schedules — allocations stay private until claimed." },
  { title: "Runway", body: "Play through a startup's first quarter — real decisions, real CipherOps missions when the story needs them." },
  { title: "Career Profile", body: "Your Runway achievements live here — real, verifiable, and yours." },
  { title: "Wallet", body: "Connect a wallet any time, top right, to start using any feature for real." },
];

export function ProductTour() {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) {
        setVisible(true);
      }
    } catch {
      // localStorage unavailable — just skip the tour rather than block the page
    }
  }, []);

  function dismiss() {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setVisible(false);
  }

  if (!visible) return null;

  const isLast = step === STEPS.length - 1;
  const current = STEPS[step];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="CipherOps product tour"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
    >
      <div
        className="w-full max-w-sm rounded-xl p-6"
        style={{ background: CARD, border: `1px solid ${BORDER}`, boxShadow: "0 12px 40px rgba(0,0,0,0.6)" }}
      >
        <p className="mb-1 text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.16em" }}>
          {step + 1} / {STEPS.length}
        </p>
        <h2 className="text-lg font-bold text-white">{current.title}</h2>
        <p className="mt-2 text-sm leading-relaxed" style={{ color: "#999" }}>{current.body}</p>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button
            onClick={dismiss}
            className="text-xs font-medium hover:underline"
            style={{ color: "#666" }}
          >
            Skip
          </button>
          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium"
                style={{ border: `1px solid ${BORDER}`, color: "#ccc", background: "transparent" }}
              >
                Previous
              </button>
            )}
            <button
              onClick={() => (isLast ? dismiss() : setStep((s) => s + 1))}
              className="rounded-lg px-4 py-1.5 text-xs font-bold"
              style={{ background: Y, color: "#000" }}
            >
              {isLast ? "Finish" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
