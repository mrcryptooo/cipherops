import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/SiteNav";

export const metadata: Metadata = {
  title: "Launch App — CipherOps",
  description: "The CipherOps app is coming soon.",
};

const Y = "#FFD208";
const BORDER = "rgba(255,255,255,0.07)";

export default function LaunchAppPage() {
  return (
    <div style={{ background: "#070707", color: "#f4f4f4", minHeight: "100vh" }}>
      <SiteNav activePath="/launch-app" />
      <div
        className="flex flex-col items-center justify-center px-4 py-24 text-center sm:px-6 lg:px-10"
        style={{ minHeight: "calc(100vh - 65px)" }}
      >
        <p
          className="mb-4 text-xs font-semibold uppercase"
          style={{ color: Y, letterSpacing: "0.18em" }}
        >
          CipherOps
        </p>
        <h1 className="text-4xl font-bold text-white sm:text-5xl">Coming Soon</h1>
        <div
          className="mt-8 h-px w-16"
          style={{ background: BORDER }}
        />
      </div>
    </div>
  );
}
