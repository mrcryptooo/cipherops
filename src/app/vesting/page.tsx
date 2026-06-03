import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/SiteNav";
import { VestingTabs } from "@/components/vesting/VestingTabs";

export const metadata: Metadata = {
  title: "Confidential Vesting — CipherOps",
  description:
    "Create and manage confidential ERC-7984 vesting schedules with encrypted allocations on Sepolia.",
};

const Y      = "#FFD208";
const BORDER = "rgba(255,255,255,0.07)";

const BADGES = [
  "Sepolia Factory",
  "ERC-7984 Schedules",
  "Frontend-only MVP",
  "Claims next",
];

export default function VestingPage() {
  return (
    <div style={{ background: "#070707", color: "#f4f4f4", minHeight: "100vh" }}>
      <SiteNav activePath="/vesting" />

      {/* ── Header ── */}
      <div className="border-b px-4 py-12 sm:px-6 lg:px-10" style={{ borderColor: BORDER }}>
        <div className="mx-auto max-w-7xl">
          <p className="mb-3 text-xs font-semibold uppercase"
            style={{ color: Y, letterSpacing: "0.18em" }}>
            Confidential Vesting · Sepolia
          </p>
          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Confidential Vesting
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: "#888" }}>
                Deploy vesting manager clones, create time-locked ERC-7984 schedules with encrypted
                allocations, and let recipients claim privately on Sepolia.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {BADGES.map((b) => (
                <span key={b} className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ background: "rgba(255,210,8,0.08)", border: "1px solid rgba(255,210,8,0.22)", color: Y }}>
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Tabbed content ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <VestingTabs />
      </div>
    </div>
  );
}
