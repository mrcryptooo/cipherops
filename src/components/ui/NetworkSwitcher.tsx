"use client";

import { NETWORKS } from "@/lib/registry";

interface NetworkSwitcherProps {
  selected: string;
  onChange: (key: string) => void;
}

export function NetworkSwitcher({ selected, onChange }: NetworkSwitcherProps) {
  return (
    <div
      style={{
        background: "#111",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
      className="flex items-center gap-1 rounded-xl p-1"
    >
      {Object.entries(NETWORKS).map(([key, net]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={
            selected === key
              ? {
                  color: "#FFD208",
                  background: "rgba(255,210,8,0.08)",
                  border: "1px solid rgba(255,210,8,0.35)",
                }
              : {
                  color: "#666",
                  background: "transparent",
                  border: "1px solid transparent",
                }
          }
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150"
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: selected === key ? "#FFD208" : "#333" }}
          />
          {net.shortName}
        </button>
      ))}
    </div>
  );
}
