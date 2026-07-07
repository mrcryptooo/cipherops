"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ConnectButton } from "@/components/wallet/ConnectButton";

// CSS filter that converts any source color → Zama yellow #FFD208.
// Works whether the PNG content is white, grey, or already yellow.
// Sequence: black out all pixels → invert to white → shift to yellow via sepia+saturate+hue.
const YELLOW_FILTER =
  "brightness(0) saturate(100%) invert(83%) sepia(89%) saturate(700%) hue-rotate(2deg) brightness(1.05)";

const NAV_LINKS = [
  { label: "Home",       href: "/",          external: false },
  { label: "Registry",  href: "/registry",   external: false },
  { label: "Operations",href: "/operations", external: false },
  { label: "Airdrop",   href: "/airdrop",    external: false },
  { label: "Vesting",   href: "/vesting",    external: false },
  { label: "Launch App",href: "/launch-app", external: false },
  { label: "Docs",      href: "/docs",       external: false },
];

interface SiteNavProps {
  activePath?: string;
}

export function SiteNav({ activePath = "/" }: SiteNavProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="sticky top-0 z-50 px-4 sm:px-6 lg:px-10"
      style={{
        background: "rgba(0,0,0,0.94)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
      }}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 py-3">

        {/* Brand mark + name */}
        <Link href="/" className="flex min-w-0 flex-shrink-0 items-center gap-2">
          <Image
            src="/brand/cipherops-logo-yellow.png"
            alt="CipherOps mark"
            width={32}
            height={32}
            style={{
              width: 32,
              height: 32,
              objectFit: "contain",
              filter: YELLOW_FILTER,
              flexShrink: 0,
            }}
            priority
          />
          <span
            className="text-sm font-bold tracking-tight text-white"
            style={{ lineHeight: 1 }}
          >
            CipherOps
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-0.5 lg:flex">
          {NAV_LINKS.map((l) => {
            const isActive = l.href === activePath;
            return (
              <a
                key={l.label}
                href={l.href}
                target={l.external ? "_blank" : undefined}
                rel={l.external ? "noopener noreferrer" : undefined}
                className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors"
                style={{
                  color: isActive ? "#FFD208" : "#888",
                  background: isActive ? "rgba(255,210,8,0.06)" : "transparent",
                }}
              >
                {l.label}
              </a>
            );
          })}
        </div>

        {/* Right: Runway entry point + wallet + mobile toggle */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/runway"
            className="runway-nav-cta hidden items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-extrabold uppercase tracking-wide transition-transform hover:-translate-y-px sm:inline-flex"
            style={{
              background: "linear-gradient(135deg, #FFE55C 0%, #FFD208 55%, #E6BC00 100%)",
              color: "#000",
              letterSpacing: "0.06em",
              boxShadow: "0 0 0 1px rgba(255,210,8,0.4), 0 4px 16px rgba(255,210,8,0.28)",
            }}
          >
            <span aria-hidden style={{ fontSize: "13px", lineHeight: 1 }}>▶</span>
            Runway
          </Link>
          <ConnectButton />

          {/* Mobile menu toggle — nav links only render at lg+, so phones/tablets need this */}
          <button
            type="button"
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((v) => !v)}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border lg:hidden"
            style={{ borderColor: "rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.03)" }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="#e4e4e4" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="#e4e4e4" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <div
          className="border-t px-4 pb-4 pt-2 lg:hidden"
          style={{ borderColor: "rgba(255,255,255,0.07)" }}
        >
          <div className="flex flex-col gap-1">
            {NAV_LINKS.map((l) => {
              const isActive = l.href === activePath;
              return (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.external ? "_blank" : undefined}
                  rel={l.external ? "noopener noreferrer" : undefined}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
                  style={{
                    color: isActive ? "#FFD208" : "#ccc",
                    background: isActive ? "rgba(255,210,8,0.08)" : "transparent",
                  }}
                >
                  {l.label}
                </a>
              );
            })}
            <Link
              href="/runway"
              onClick={() => setMobileOpen(false)}
              className="mt-2 flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-xs font-extrabold uppercase tracking-wide"
              style={{
                background: "linear-gradient(135deg, #FFE55C 0%, #FFD208 55%, #E6BC00 100%)",
                color: "#000",
                letterSpacing: "0.06em",
              }}
            >
              <span aria-hidden style={{ fontSize: "13px", lineHeight: 1 }}>▶</span>
              Runway
            </Link>
          </div>
        </div>
      )}

      <style jsx>{`
        .runway-nav-cta {
          animation: runwayCtaGlow 3s ease-in-out infinite;
        }
        @keyframes runwayCtaGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(255,210,8,0.4), 0 4px 16px rgba(255,210,8,0.28); }
          50% { box-shadow: 0 0 0 1px rgba(255,210,8,0.55), 0 4px 22px rgba(255,210,8,0.45); }
        }
        @media (prefers-reduced-motion: reduce) {
          .runway-nav-cta { animation: none; }
        }
      `}</style>
    </nav>
  );
}
