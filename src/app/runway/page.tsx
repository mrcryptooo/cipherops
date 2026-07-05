import type { Metadata } from "next";
import { SiteNav } from "@/components/layout/SiteNav";
import { RunwayOffice } from "@/components/runway/RunwayOffice";

export const metadata: Metadata = {
  title: "Runway — CipherOps",
  description: "Run a startup's first year. Real business decisions, real consequences, real CipherOps missions when the story demands them.",
};

export default function RunwayPage() {
  return (
    <div style={{ background: "#000000", color: "#f4f4f4", minHeight: "100vh" }}>
      <SiteNav activePath="/runway" />
      <RunwayOffice />
    </div>
  );
}
