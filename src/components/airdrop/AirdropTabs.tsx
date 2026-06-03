"use client";

import { useState } from "react";
import { CreateAirdropForm } from "./CreateAirdropForm";
import { IssueClaimsForm } from "./IssueClaimsForm";
import { ClaimAirdropForm } from "./ClaimAirdropForm";

const Y      = "#FFD208";
const BORDER = "rgba(255,255,255,0.07)";
// const YBORDER = "rgba(255,210,8,0.22)"; // reserved for future use

type Tab = "create" | "issue" | "claim-preview";

const TABS: { id: Tab; label: string; badge?: string }[] = [
  { id: "create",        label: "1 · Create Campaign" },
  { id: "issue",         label: "2 · Issue Claims" },
  { id: "claim-preview", label: "3 · Recipient Claim" },
];

export function AirdropTabs() {
  const [active, setActive] = useState<Tab>("create");

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex overflow-x-auto border-b" style={{ borderColor: BORDER, scrollbarWidth: "none" }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className="flex flex-shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{
              borderBottom: active === t.id ? `2px solid ${Y}` : "2px solid transparent",
              color: active === t.id ? Y : "#666",
            }}
          >
            {t.label}
            {t.badge && (
              <span className="rounded px-1.5 py-0.5 text-xs"
                style={{ background: "rgba(255,255,255,0.05)", border: `1px solid ${BORDER}`, color: "#555" }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {active === "create" && <CreateAirdropForm />}
      {active === "issue"  && <IssueClaimsForm />}
      {active === "claim-preview" && <ClaimAirdropForm />}
    </div>
  );
}
