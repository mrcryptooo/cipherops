"use client";
/**
 * Runway — the office backdrop. Foundation layer for the whole experience:
 * everything else floats above this. No fake illustration — until a real
 * asset lands, this is an honest gradient, not a placeholder pretending to
 * be art. Swapping quarters is a one-file change in office-art.ts; nothing
 * here needs to know that happened.
 *
 * The ambient motion (breathing highlight, dust, slow drift) is applied to
 * this layer only, in code, and never touches the artwork file itself —
 * so it keeps working unchanged once the real image is dropped in.
 */

import Image from "next/image";
import { getOfficeBackdrop } from "@/lib/runway/office-art";
import type { Quarter } from "@/lib/runway/types";

const DUST_MOTES = [
  { left: "12%", delay: "0s", duration: "22s", size: 3 },
  { left: "34%", delay: "4s", duration: "26s", size: 2 },
  { left: "58%", delay: "8s", duration: "20s", size: 3 },
  { left: "76%", delay: "2s", duration: "24s", size: 2 },
  { left: "90%", delay: "6s", duration: "28s", size: 2 },
];

export function OfficeBackdrop({ quarter }: { quarter: Quarter }) {
  const src = getOfficeBackdrop(quarter);

  return (
    <div className="office-backdrop pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="backdrop-drift absolute inset-0">
        {src ? (
          <Image
            src={src}
            alt=""
            fill
            priority
            sizes="100vw"
            style={{ objectFit: "cover", objectPosition: "58% 38%" }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(ellipse 900px 500px at 50% 0%, #0d0d0d 0%, #070707 55%, #000000 100%)",
            }}
          />
        )}
      </div>

      {/* Scrim — lighter now that the real artwork is already dark almost everywhere;
          a heavy scrim on top of it just muddies the lived-in detail for no legibility gain */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.28) 45%, rgba(0,0,0,0.5) 100%)",
        }}
      />

      {/* Ambient "breathing" light — positioned over the painted lamp so the code-driven
          glow reinforces the artwork's own light source instead of sitting apart from it */}
      <div className="breathing-light absolute h-[420px] w-[620px]" style={{ left: "58%", top: "22%", transform: "translate(-50%, -20%)" }} />

      {/* Dust motes — pure atmosphere */}
      {DUST_MOTES.map((m, i) => (
        <span
          key={i}
          className="dust-mote absolute rounded-full"
          style={{
            left: m.left,
            bottom: "-10px",
            width: m.size,
            height: m.size,
            animationDelay: m.delay,
            animationDuration: m.duration,
          }}
        />
      ))}

      <style jsx>{`
        .backdrop-drift {
          animation: backdropDrift 26s ease-in-out infinite;
          transform-origin: center;
        }
        @keyframes backdropDrift {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.03) translateY(-8px); }
        }
        .breathing-light {
          background: radial-gradient(ellipse, rgba(255, 210, 8, 0.05) 0%, transparent 70%);
          animation: breathe 9s ease-in-out infinite;
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .dust-mote {
          background: rgba(255, 255, 255, 0.35);
          opacity: 0;
          animation-name: floatUp;
          animation-timing-function: ease-in-out;
          animation-iteration-count: infinite;
        }
        @keyframes floatUp {
          0% { opacity: 0; transform: translateY(0) translateX(0); }
          10% { opacity: 0.4; }
          90% { opacity: 0.2; }
          100% { opacity: 0; transform: translateY(-620px) translateX(20px); }
        }
        @media (prefers-reduced-motion: reduce) {
          .backdrop-drift { animation: none; }
          .breathing-light { animation: none; opacity: 0.7; }
          .dust-mote { animation: none; opacity: 0; }
        }
      `}</style>
    </div>
  );
}
