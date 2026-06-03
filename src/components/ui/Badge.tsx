import type { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "success" | "warning" | "neutral" | "muted";
}

export function Badge({ children, variant = "neutral" }: BadgeProps) {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    // neutral → Zama yellow
    neutral: "border",
    muted: "bg-zinc-700/40 text-zinc-500 border border-zinc-700/50",
  };

  if (variant === "neutral") {
    return (
      <span
        className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium tracking-wide border"
        style={{ background: "rgba(255,210,8,0.08)", color: "#FFD208", borderColor: "rgba(255,210,8,0.22)" }}
      >
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium tracking-wide ${styles[variant]}`}
    >
      {children}
    </span>
  );
}
