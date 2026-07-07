"use client";
/**
 * Runway — the one-time intro. Shown once per fresh playthrough, before the
 * first office scene, then never again this session (see persistence.ts's
 * intro-seen flag). Sets expectations in-fiction, not documentation.
 */

import { RUNWAY_Y as Y, RUNWAY_CARD as CARD, RUNWAY_BORDER as BORDER, RUNWAY_GLASS_BLUR as GLASS_BLUR } from "@/lib/runway/theme";

export function RunwayIntro({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="relative z-10 mx-auto flex min-h-screen max-w-xl flex-col justify-center px-4 py-16 sm:px-6 lg:px-10">
      <div
        className="fade-in-intro glass rounded-xl p-6 sm:p-8"
        style={{ background: CARD, border: `1px solid ${BORDER}`, backdropFilter: GLASS_BLUR, WebkitBackdropFilter: GLASS_BLUR }}
      >
        <p className="mb-3 text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.18em" }}>
          Runway
        </p>
        <p className="text-[15px] leading-relaxed" style={{ color: "#e4e4e4" }}>
          This is the first quarter of a company that doesn&apos;t exist yet — yours. Every
          choice here lands on someone: a cofounder, a contractor, a person you haven&apos;t
          met. Most days it&apos;s just a decision. A few days, it&apos;s real — you&apos;ll
          leave this screen and use actual CipherOps features, secured by Zama&apos;s FHE,
          because some things can&apos;t be handled any other way. Nothing here is simulated.
        </p>
        <button
          onClick={onContinue}
          className="intro-btn mt-6 rounded-lg px-5 py-2.5 text-sm font-bold transition-transform hover:-translate-y-px"
          style={{ background: Y, color: "#000" }}
        >
          Begin →
        </button>
      </div>

      <style jsx>{`
        .glass { box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45); }
        .fade-in-intro { animation: introFadeIn 0.5s ease both; }
        @keyframes introFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .intro-btn:active { transform: translateY(0) scale(0.98); }
        @media (prefers-reduced-motion: reduce) {
          .fade-in-intro { animation: none; }
          .intro-btn:hover, .intro-btn:active { transform: none; }
        }
      `}</style>
    </div>
  );
}
