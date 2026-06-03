"use client";

import { useState } from "react";

export function HeroVideo() {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className="flex min-h-[280px] w-full items-center justify-center rounded-2xl border sm:min-h-[420px]"
           style={{ background: "#0d0d0d", borderColor: "rgba(255,210,8,0.18)" }}>
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest"
             style={{ color: "#FFD208", letterSpacing: "0.18em" }}>
            CipherOps
          </p>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Confidential token lifecycle
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="hero-video-container min-h-[280px] w-full sm:min-h-[420px]">
      <video
        autoPlay
        muted
        loop
        playsInline
        onError={() => setFailed(true)}
        className="h-full min-h-[280px] w-full object-cover sm:min-h-[420px]"
      >
        <source src="/hero/cipherops-hero-transform.mp4" type="video/mp4" />
      </video>
      {/* Subtle left-edge gradient on desktop so text doesn't fight the video */}
      <div
        className="pointer-events-none absolute inset-y-0 left-0 hidden w-20 sm:block"
        style={{ background: "linear-gradient(to right, rgba(0,0,0,0.45), transparent)" }}
      />
    </div>
  );
}
