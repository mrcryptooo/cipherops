import type { Metadata } from "next";
import { RegistryExplorer } from "@/components/registry/RegistryExplorer";
import { SiteNav } from "@/components/layout/SiteNav";

export const metadata: Metadata = {
  title: "Registry Explorer — CipherOps",
  description: "Use Zama's official wrapper registry to test the full confidential token lifecycle on Sepolia.",
};

const BORDER = "rgba(255,255,255,0.07)";
const Y = "#FFD208";

const PILLS = [
  "Official Registry",
  "Sepolia Full Lifecycle",
  "Mainnet Read-only",
  "6/6 Protocol Coverage",
];

export default function RegistryPage() {
  return (
    <div style={{ background: "#070707", color: "#f4f4f4", minHeight: "100vh" }}>
      <SiteNav activePath="/registry" />

      {/* Page header */}
      <div
        className="border-b px-4 py-12 sm:px-6 lg:px-10"
        style={{ borderColor: BORDER }}
      >
        <div className="mx-auto max-w-7xl">
          {/* Yellow label */}
          <p
            className="mb-3 text-xs font-semibold uppercase"
            style={{ color: Y, letterSpacing: "0.18em" }}
          >
            Live on Sepolia
          </p>

          {/* H1 */}
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Registry Explorer
          </h1>

          {/* Subtitle */}
          <p className="mt-3 max-w-2xl text-sm leading-relaxed" style={{ color: "#888" }}>
            Wrap any ERC-20 into its confidential ERC-7984 form so balances stay private on-chain.
            A payroll token is a good example: everyone can see the contract exists, but only each
            employee can ever reveal their own balance. Reveal or unwrap back to the public token
            any time you need to.
          </p>

          {/* Pill badges */}
          <div className="mt-6 flex flex-wrap gap-2">
            {PILLS.map((label) => (
              <span
                key={label}
                className="rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  background: "rgba(255, 210, 8, 0.10)",
                  color: Y,
                  border: `1px solid rgba(255, 210, 8, 0.30)`,
                  letterSpacing: "0.04em",
                }}
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Registry app */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <RegistryExplorer />
      </div>
    </div>
  );
}
