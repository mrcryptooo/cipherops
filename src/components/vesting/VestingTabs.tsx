"use client";

import { useState } from "react";
import { CreateVestingManagerForm } from "./CreateVestingManagerForm";
import { CreateVestingScheduleForm } from "./CreateVestingScheduleForm";
import { ClaimVestingForm } from "./ClaimVestingForm";

const Y      = "#FFD208";
const BORDER = "rgba(255,255,255,0.07)";

type Tab = "manager" | "schedule" | "claim";

const TABS: { id: Tab; label: string; badge?: string }[] = [
  { id: "manager",  label: "1 · Create Manager" },
  { id: "schedule", label: "2 · Create Schedules", badge: "Next" },
  { id: "claim",    label: "3 · Recipient Claim",  badge: "Next" },
];

export function VestingTabs() {
  const [active, setActive] = useState<Tab>("manager");

  return (
    <div>
      {/* Tab bar */}
      <div className="mb-6 flex overflow-x-auto border-b"
        style={{ borderColor: BORDER, scrollbarWidth: "none" }}>
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className="flex flex-shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-semibold transition-colors"
            style={{
              borderBottom: active === t.id ? `2px solid ${Y}` : "2px solid transparent",
              color: active === t.id ? Y : "#666",
            }}>
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
      {active === "manager" && <CreateVestingManagerForm />}

      {active === "schedule" && <CreateVestingScheduleForm />}

      {active === "claim" && <ClaimVestingForm />}
    </div>
  );
}
