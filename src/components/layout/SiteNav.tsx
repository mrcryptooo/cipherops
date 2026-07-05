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
  { label: "Runway",    href: "/runway",     external: false },
  { label: "Docs",      href: "/docs",       external: false },
];

interface SiteNavProps {
  activePath?: string;
}

export function SiteNav({ activePath = "/" }: SiteNavProps) {
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

        {/* Right: launch CTA + wallet */}
        <div className="flex flex-shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/registry"
            className="hidden rounded-lg px-4 py-2 text-xs font-bold transition-opacity hover:opacity-90 sm:inline-flex"
            style={{ background: "#FFD208", color: "#000" }}
          >
            Launch Registry
          </Link>
          <ConnectButton />
        </div>

      </div>
    </nav>
  );
}
