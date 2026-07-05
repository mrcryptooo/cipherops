/**
 * Runway — achievement registry. Part of one permanent, multi-episode
 * on-chain Career (see contracts/RunwayAchievements.sol) — every entry
 * here carries an `episode` number so Episode 2+ content plugs into the
 * exact same collection, never a second one.
 *
 * Two categories, both mintable, both real transactions once minted:
 *  - "mission": tied 1:1 to a real verified CipherOps Mission transaction.
 *  - "milestone": tied to a broader Runway career fact (a session flag, a
 *    count across missions, or — for "Early Adopter" — live on-chain supply
 *    at mint time). Still a real mint, still permanently soulbound; it just
 *    doesn't claim an external CipherOps transaction specifically, only a
 *    real fact about this playthrough.
 *
 * No NFT contract is deployed for this project yet — minting one is a real,
 * consequential infrastructure decision (a new deployed contract, gas, an
 * address to maintain) and isn't done unilaterally. Every achievement's
 * default nft.status is "not_minted" until that contract exists and a
 * player actually mints.
 */

import type { GameState, MissionRecord } from "./types";

export interface AchievementImageMeta {
  assetName: string;
  finalPath: string;
  width: number;
  height: number;
  priority: "Critical" | "High" | "Medium" | "Low";
}

export interface AchievementDefinition {
  id: string;
  category: "mission" | "milestone";
  /** Which Runway episode introduced this achievement. Episode 1 for all current entries. */
  episode: number;
  name: string;
  description: string;
  /** Only set for "mission" achievements — the mission that earns it. */
  missionId?: string;
  /** Only set for "milestone" achievements with a simple flag-AND condition. */
  storyFlags?: string[];
  /** Set instead of storyFlags for achievements needing custom logic (e.g. "all missions done"). */
  customCheckId?: "all-missions-complete" | "early-adopter";
  image: AchievementImageMeta;
}

function img(assetName: string, priority: AchievementImageMeta["priority"] = "Medium"): AchievementImageMeta {
  return {
    assetName,
    finalPath: `/runway/achievements/${assetName}.png`,
    width: 800,
    height: 800,
    priority,
  };
}

export const ACHIEVEMENTS: AchievementDefinition[] = [
  // ── Mission achievements — tied to a real verified CipherOps transaction ──
  {
    id: "ach-first-asset",
    category: "mission",
    episode: 1,
    missionId: "q1-reg",
    name: "First Confidential Asset",
    description: "Wrapped the company's first FHE-encrypted asset on Zama — everything else depended on this.",
    image: img("runway-achievement-first-asset"),
  },
  {
    id: "ach-first-payment",
    category: "mission",
    episode: 1,
    missionId: "q1-04",
    name: "First Secure Payment",
    description: "Paid someone through Zama's FHE — an amount only she could ever decrypt.",
    image: img("runway-achievement-first-payment"),
  },
  {
    id: "ach-first-distribution",
    category: "mission",
    episode: 1,
    missionId: "q1-air",
    name: "First Confidential Distribution",
    description: "Made good on a promise to your earliest users — every claim FHE-encrypted, at scale.",
    image: img("runway-achievement-first-distribution"),
  },
  {
    id: "ach-first-vesting",
    category: "mission",
    episode: 1,
    missionId: "q1-vest",
    name: "First Vesting Completion",
    description: "Turned an informal promise into something real, properly earned, and encrypted end to end on Zama.",
    image: img("runway-achievement-first-vesting"),
  },
  // ── Milestone achievements — real, but broader than one transaction ──────
  {
    id: "ach-mission-completion",
    category: "milestone",
    episode: 1,
    storyFlags: [],
    customCheckId: undefined,
    name: "Mission Completion",
    description: "Completed your first real Mission in Runway.",
    image: img("runway-achievement-mission-completion", "High"),
  },
  {
    id: "ach-confidential-master",
    category: "milestone",
    episode: 1,
    customCheckId: "all-missions-complete",
    name: "Confidential Master",
    description: "Touched every FHE-encrypted capability CipherOps offers — asset, payout, rewards, and vesting, all real, all on Zama.",
    image: img("runway-achievement-confidential-master", "High"),
  },
  {
    id: "ach-perfect-mission",
    category: "milestone",
    episode: 1,
    storyFlags: ["confidential-asset-ready", "contractor-felt-valued", "rewards-generous", "vesting-generous"],
    name: "Perfect Mission",
    description: "Every real Mission this quarter, handled the best way it could have been.",
    image: img("runway-achievement-perfect-mission", "Medium"),
  },
  {
    id: "ach-hidden-story",
    category: "milestone",
    episode: 1,
    storyFlags: ["hidden-story-neither"],
    name: "Hidden Story",
    description: "Found the option nobody points you toward — refusing to pick a side, on purpose.",
    image: img("runway-achievement-hidden-story", "Low"),
  },
  {
    id: "ach-protected-employee",
    category: "milestone",
    episode: 1,
    storyFlags: ["privacy-chosen-once"],
    name: "Protected Employee",
    description: "Kept someone's numbers off a spreadsheet they never agreed to be on.",
    image: img("runway-achievement-protected-employee", "Low"),
  },
  {
    id: "ach-team-guardian",
    category: "milestone",
    episode: 1,
    storyFlags: ["privacy-chosen-once", "theo-protected"],
    name: "Team Guardian",
    description: "Protected more than one person's interests, more than once, without making it a thing.",
    image: img("runway-achievement-team-guardian", "Low"),
  },
  {
    id: "ach-investor-confidence",
    category: "milestone",
    episode: 1,
    storyFlags: ["openness-chosen-once", "mistake-owned"],
    name: "Investor Confidence",
    description: "Played it straight with the board, even when it would've been easier not to.",
    image: img("runway-achievement-investor-confidence", "Low"),
  },
  {
    id: "ach-community-builder",
    category: "milestone",
    episode: 1,
    storyFlags: ["rewards-delivered", "testimonial-public"],
    name: "Community Builder",
    description: "Turned early users into people who talk about you unprompted.",
    image: img("runway-achievement-community-builder", "Low"),
  },
  {
    id: "ach-early-adopter",
    category: "milestone",
    episode: 1,
    customCheckId: "early-adopter",
    name: "Early Adopter",
    description: "Among the first Runway careers ever minted into this collection.",
    image: img("runway-achievement-early-adopter", "Medium"),
  },
  {
    id: "ach-episode-completion",
    category: "milestone",
    episode: 1,
    storyFlags: ["episode-complete"],
    name: "Episode Completion",
    description: "Finished Episode 1 — a full quarter, start to end.",
    image: img("runway-achievement-episode-completion", "High"),
  },
];

/** The one-off "mission-completion" flag check is just "any mission logged". */
function isMissionCompletionEarned(state: GameState): boolean {
  return state.missionLog.length >= 1;
}

const ALL_EPISODE_1_MISSION_IDS = ["q1-reg", "q1-04", "q1-air", "q1-vest"];

function isAllMissionsComplete(state: GameState): boolean {
  const done = new Set(state.missionLog.map((m) => m.missionId));
  return ALL_EPISODE_1_MISSION_IDS.every((id) => done.has(id));
}

/** Early Adopter needs live on-chain supply, not just local state — the
 *  Career Profile screen checks this separately via totalMinted(). */
export const EARLY_ADOPTER_CUTOFF = 500;

export function isAchievementEarned(def: AchievementDefinition, state: GameState): boolean {
  if (def.category === "mission") {
    return state.missionLog.some((m) => m.missionId === def.missionId);
  }
  if (def.id === "ach-mission-completion") return isMissionCompletionEarned(state);
  if (def.customCheckId === "all-missions-complete") return isAllMissionsComplete(state);
  // Early Adopter rewards being an early *player*, not an empty save — it
  // only becomes available once at least one real thing has been done; the
  // actual cutoff (still available at all) is checked on-chain at mint time.
  if (def.customCheckId === "early-adopter") return isMissionCompletionEarned(state);
  return (def.storyFlags ?? []).every((f) => state.flags.has(f));
}

export function getEarnedAchievements(state: GameState): AchievementDefinition[] {
  return ACHIEVEMENTS.filter((def) => isAchievementEarned(def, state));
}

/** Convenience — the mission record for a mission achievement, if earned. */
export function missionRecordFor(def: AchievementDefinition, state: GameState): MissionRecord | undefined {
  if (def.category !== "mission") return undefined;
  return state.missionLog.find((m) => m.missionId === def.missionId);
}
