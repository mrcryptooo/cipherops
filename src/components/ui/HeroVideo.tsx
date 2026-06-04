"use client";
// Cinematic hero video — borderless, blends with #0D0D0D site background.
// Container uses aspect-ratio 16/9 so there is never empty space above/below the video.
// CSS scale(1.42) boost + vanilla-JS scroll parallax.

import { useState, useEffect, useRef, useCallback } from "react";

export function HeroVideo() {
  const [failed, setFailed] = useState(false);
  const innerRef            = useRef<HTMLDivElement>(null);
  const rafRef              = useRef<number | null>(null);

  const updateParallax = useCallback(() => {
    const inner = innerRef.current;
    if (!inner) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const t = Math.min(window.scrollY / 600, 1);
    inner.style.transform = `translateY(${-40 * t}px) scale(${1 + 0.10 * t})`;
    inner.style.opacity   = String(1 - 0.08 * t);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(updateParallax);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    updateParallax();
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [updateParallax]);

  if (failed) {
    return (
      <div
        className="flex w-full items-center justify-center"
        style={{ background: "#0d0d0d", aspectRatio: "16/9" }}
      >
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-widest"
             style={{ color: "#FFD208", letterSpacing: "0.18em" }}>CipherOps</p>
          <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>
            Confidential token lifecycle
          </p>
        </div>
      </div>
    );
  }

  return (
    // aspect-ratio 16/9 ensures the container is exactly the video's natural proportions.
    // overflow-hidden clips the scale(1.42) visual boost — no empty space at bottom.
    <div
      className="relative w-full overflow-hidden"
      style={{
        background: "#0d0d0d",
        aspectRatio: "16/9",
      }}
    >
      {/* Soft ambient yellow glow — no visible edge */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(255,210,8,0.10) 0%, transparent 55%)",
          zIndex: 1,
        }}
      />

      {/* Scroll-parallax wrapper */}
      <div
        ref={innerRef}
        className="absolute inset-0"
        style={{ willChange: "transform, opacity", transformOrigin: "center center" }}
      >
        {/* CSS scale boost — visually ~1.42× larger, clipped by overflow-hidden above */}
        <div
          className="h-full w-full"
          style={{ transform: "scale(1.42)", transformOrigin: "center center" }}
        >
          <video
            autoPlay muted loop playsInline
            onError={() => setFailed(true)}
            className="block h-full w-full"
            style={{ objectFit: "contain" }}
          >
            <source src="/hero/cipherops-hero-transform.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </div>
  );
}
