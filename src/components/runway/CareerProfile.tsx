"use client";
/**
 * Runway — Career Profile. Reads the connected wallet's real on-chain
 * achievements directly from RunwayAchievements (achievementsOf, totalMinted)
 * whenever the contract is deployed; falls back to local session state
 * (which achievements are earned but not yet minted) when it isn't. Never
 * fabricates ownership — an achievement only counts as "on-chain" here if
 * the contract itself says so.
 *
 * This is a Career, not an episode artifact: the same wallet's achievements
 * from Episode 2+ read from this exact same contract and show up here too,
 * automatically, with no code change required — that's the whole point of
 * one permanent collection instead of one contract per episode.
 */

import { useEffect, useState } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { sepolia } from "wagmi/chains";
import { ACHIEVEMENTS, EARLY_ADOPTER_CUTOFF, getEarnedAchievements, missionRecordFor, type AchievementDefinition } from "@/lib/runway/achievements";
import { ACHIEVEMENT_CONTRACT_ABI, buildTokenURI, getAchievementContractAddress } from "@/lib/runway/achievement-contract";
import { RUNWAY_Y as Y, RUNWAY_YDIM as YDIM, RUNWAY_YBORDER as YBORDER, RUNWAY_CARD as CARD, RUNWAY_BORDER as BORDER, RUNWAY_GLASS_BLUR as GLASS_BLUR } from "@/lib/runway/theme";
import type { GameState } from "@/lib/runway/types";

/** Round medallion treatment shared with the office's achievement/prop badges —
 *  the delivered art is opaque, not a transparent cutout, so it's framed as a
 *  small coin rather than floating bare against the card background. Locked
 *  achievements render the same badge desaturated and dimmed. */
function Badge({ src, name, locked = false }: { src: string; name: string; locked?: boolean }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="flex-shrink-0 rounded-full object-cover"
      style={{
        width: 44,
        height: 44,
        border: `1px solid ${locked ? BORDER : YBORDER}`,
        boxShadow: "0 2px 8px rgba(0,0,0,0.5)",
        filter: locked ? "grayscale(0.85) brightness(0.55)" : "none",
        opacity: locked ? 0.7 : 1,
      }}
    />
  );
}

function careerTitle(pct: number): string {
  if (pct >= 100) return "Runway Veteran";
  if (pct >= 76) return "Confidential Master";
  if (pct >= 51) return "Senior Operator";
  if (pct >= 26) return "Trusted Operator";
  if (pct > 0) return "Operator";
  return "New Operator";
}

interface CareerProfileProps {
  state: GameState;
  onBack: () => void;
}

export function CareerProfile({ state, onBack }: CareerProfileProps) {
  const { address } = useAccount();
  const contractAddress = getAchievementContractAddress();
  const [mintingId, setMintingId] = useState<string | null>(null);
  const [mintError, setMintError] = useState<string | null>(null);
  const [justMinted, setJustMinted] = useState<Set<string>>(new Set());

  const { data: onChain, refetch: refetchOwned } = useReadContract({
    address: contractAddress ?? undefined,
    abi: ACHIEVEMENT_CONTRACT_ABI,
    functionName: "achievementsOf",
    args: address ? [address] : undefined,
    chainId: sepolia.id,
    query: { enabled: !!contractAddress && !!address },
  });

  const { data: totalMinted } = useReadContract({
    address: contractAddress ?? undefined,
    abi: ACHIEVEMENT_CONTRACT_ABI,
    functionName: "totalMinted",
    chainId: sepolia.id,
    query: { enabled: !!contractAddress },
  });

  const { writeContract, data: mintHash, isPending: confirming } = useWriteContract();
  const { data: mintReceipt, isLoading: waitingForMint } = useWaitForTransactionReceipt({ hash: mintHash });

  useEffect(() => {
    if (!mintReceipt || !mintingId) return;
    setJustMinted((prev) => new Set(prev).add(mintingId));
    setMintingId(null);
    void refetchOwned();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mintReceipt]);

  function handleMint(def: AchievementDefinition) {
    if (!contractAddress || !address) return;
    setMintError(null);
    setMintingId(def.id);
    const record = missionRecordFor(def, state);
    const tokenURI = buildTokenURI(def, address, Date.now(), record);
    writeContract(
      {
        address: contractAddress,
        abi: ACHIEVEMENT_CONTRACT_ABI,
        functionName: "mintAchievement",
        args: [def.id, def.episode, tokenURI],
      },
      { onError: () => { setMintError(`Couldn't mint ${def.name} — try again.`); setMintingId(null); } },
    );
  }

  const onChainIds = new Set<string>(onChain ? (onChain[0] as readonly string[]) : []);
  const earnedLocally = getEarnedAchievements(state);
  const earnedLocallyIds = new Set(earnedLocally.map((a) => a.id));

  const isUnlocked = (def: AchievementDefinition) => onChainIds.has(def.id) || earnedLocallyIds.has(def.id);
  const isMintedOnChain = (def: AchievementDefinition) => onChainIds.has(def.id) || justMinted.has(def.id);

  const unlocked = ACHIEVEMENTS.filter(isUnlocked);
  const locked = ACHIEVEMENTS.filter((a) => !isUnlocked(a));
  const pct = Math.round((unlocked.length / ACHIEVEMENTS.length) * 100);

  const verifiedMissions = state.missionLog.length;
  const earlyAdopterEligible = totalMinted !== undefined && Number(totalMinted) < EARLY_ADOPTER_CUTOFF;

  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-10">
      <p className="fade-in mb-2 text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.16em" }}>
        Career Profile
      </p>
      <div className="fade-in glass-accent mb-6 rounded-xl p-6" style={{ animationDelay: "60ms", background: YDIM, border: `1px solid ${YBORDER}` }}>
        <p className="text-lg font-bold" style={{ color: "#e4e4e4" }}>{careerTitle(pct)}</p>
        <p className="mt-1 text-sm" style={{ color: "#999" }}>
          {unlocked.length} of {ACHIEVEMENTS.length} achievements — {pct}% complete
        </p>
        {!address && <p className="mt-3 text-xs" style={{ color: "#666" }}>Connect your wallet to read your achievements directly from the chain.</p>}
        {address && !contractAddress && (
          <p className="mt-3 text-xs" style={{ color: "#666" }}>No achievement contract deployed yet — showing this session&apos;s progress only.</p>
        )}
      </div>

      <div className="fade-in glass mb-6 grid grid-cols-2 gap-3 rounded-xl p-5" style={{ animationDelay: "100ms", background: CARD, border: `1px solid ${BORDER}` }}>
        <div>
          <p className="text-xs" style={{ color: "#777" }}>Current episode</p>
          <p className="text-sm font-semibold" style={{ color: "#e4e4e4" }}>Episode 1</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: "#777" }}>Total missions run</p>
          <p className="text-sm font-semibold" style={{ color: "#e4e4e4" }}>{verifiedMissions}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: "#777" }}>Verified on-chain</p>
          <p className="text-sm font-semibold" style={{ color: "#e4e4e4" }}>{verifiedMissions}</p>
        </div>
        <div>
          <p className="text-xs" style={{ color: "#777" }}>Career badges</p>
          <p className="text-sm font-semibold" style={{ color: "#e4e4e4" }}>{unlocked.length}</p>
        </div>
      </div>

      <p className="fade-in mb-2 text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.14em", animationDelay: "120ms" }}>
        Unlocked
      </p>
      <div className="fade-in mb-6 space-y-2" style={{ animationDelay: "140ms" }}>
        {unlocked.length === 0 && <p className="text-xs" style={{ color: "#666" }}>Nothing unlocked yet — the first real Mission changes that.</p>}
        {unlocked.map((a) => {
          const minted = isMintedOnChain(a);
          const busy = mintingId === a.id && (confirming || waitingForMint);
          return (
            <div key={a.id} className="glass rounded-lg p-3" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-start gap-3">
                  <Badge src={a.image.finalPath} name={a.name} />
                  <div className="min-w-0">
                    <p className="text-sm" style={{ color: "#e4e4e4" }}>{a.name}</p>
                    <p className="text-xs" style={{ color: "#777" }}>{a.description}</p>
                  </div>
                </div>
                <span
                  className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                  style={{
                    background: minted ? YDIM : "rgba(255,255,255,0.06)",
                    border: `1px solid ${minted ? YBORDER : BORDER}`,
                    color: minted ? Y : "#888",
                  }}
                >
                  {minted ? "Minted" : "Not yet minted"}
                </span>
              </div>
              {!minted && contractAddress && (
                <button
                  onClick={() => handleMint(a)}
                  disabled={!address || busy}
                  className="cta-btn-quiet mt-3 rounded-lg px-3 py-1.5 text-xs font-semibold disabled:opacity-40"
                  style={{ background: "transparent", border: `1px solid ${YBORDER}`, color: Y }}
                >
                  {busy ? (confirming ? "Confirm in wallet…" : "Minting…") : address ? "Mint this achievement" : "Connect wallet to mint"}
                </button>
              )}
            </div>
          );
        })}
        {mintError && <p className="text-xs text-red-400">{mintError}</p>}
      </div>

      <p className="fade-in mb-2 text-xs font-semibold uppercase" style={{ color: "#666", letterSpacing: "0.14em", animationDelay: "160ms" }}>
        Locked
      </p>
      <div className="fade-in space-y-2" style={{ animationDelay: "180ms" }}>
        {locked.map((a) => (
          <div key={a.id} className="flex items-start justify-between gap-3 rounded-lg p-3" style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${BORDER}` }}>
            <div className="flex min-w-0 items-start gap-3">
              <Badge src={a.image.finalPath} name={a.name} locked />
              <div className="min-w-0">
                <p className="text-sm" style={{ color: "#666" }}>{a.name}</p>
                <p className="text-xs" style={{ color: "#555" }}>
                  {a.id === "ach-early-adopter" && totalMinted !== undefined && !earlyAdopterEligible
                    ? "No longer available — the window's closed."
                    : "Locked"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={onBack}
        className="fade-in cta-btn-quiet mt-6 rounded-lg px-4 py-2 text-sm font-medium"
        style={{ animationDelay: "200ms", background: "transparent", border: `1px solid ${BORDER}`, color: "#e4e4e4" }}
      >
        Back to the office
      </button>

      <style jsx>{`
        .glass {
          backdrop-filter: ${GLASS_BLUR};
          -webkit-backdrop-filter: ${GLASS_BLUR};
        }
        .glass-accent {
          backdrop-filter: ${GLASS_BLUR};
          -webkit-backdrop-filter: ${GLASS_BLUR};
        }
      `}</style>
    </div>
  );
}
