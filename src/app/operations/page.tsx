import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/SiteNav";
import { DisperseForm } from "@/components/operations/DisperseForm";

export const metadata: Metadata = {
  title: "Operations Studio — CipherOps",
  description: "Send confidential token payouts with TokenOps Confidential Disperse.",
};

const Y = "#FFD208";
const BORDER = "rgba(255,255,255,0.07)";

const BADGES = [
  "TokenOps SDK",
  "Sepolia Disperse",
  "Frontend-only",
  "ERC-7984",
];

export default function OperationsPage() {
  return (
    <div style={{ background: "#070707", color: "#f4f4f4", minHeight: "100vh" }}>
      <SiteNav activePath="/operations" />

      {/* ── Page header ── */}
      <div
        className="border-b px-4 py-12 sm:px-6 lg:px-10"
        style={{ borderColor: BORDER }}
      >
        <div className="mx-auto max-w-7xl">
          <p
            className="mb-3 text-xs font-semibold uppercase"
            style={{ color: Y, letterSpacing: "0.18em" }}
          >
            Confidential Disperse · Sepolia
          </p>

          <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white sm:text-4xl">
                Operations Studio
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: "#888" }}>
                Send confidential token payouts to multiple recipients using TokenOps
                Confidential Disperse. Individual amounts are FHE-encrypted — only each
                recipient can see what they received.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {BADGES.map((b) => (
                <span
                  key={b}
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: "rgba(255,210,8,0.08)",
                    border: "1px solid rgba(255,210,8,0.25)",
                    color: Y,
                  }}
                >
                  {b}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Disperse form ── */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <DisperseForm />
      </div>
    </div>
  );
}
