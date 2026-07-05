/**
 * Runway — client-side interface to the RunwayAchievements contract
 * (contracts/RunwayAchievements.sol). Sepolia-only, soulbound ERC-721 —
 * one permanent collection spanning every Runway episode.
 *
 * getAchievementContractAddress() returns null until
 * NEXT_PUBLIC_ACHIEVEMENT_CONTRACT_ADDRESS is set (i.e. until the contract
 * is actually deployed) — every caller must treat null as "minting isn't
 * available yet," never fall back to a fabricated address.
 */

import type { AchievementDefinition } from "./achievements";
import type { MissionRecord } from "./types";

export const ACHIEVEMENT_CONTRACT_ABI = [
  {
    type: "function",
    name: "mintAchievement",
    stateMutability: "nonpayable",
    inputs: [
      { name: "achievementId", type: "string" },
      { name: "episode", type: "uint16" },
      { name: "metadataURI", type: "string" },
    ],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "hasMinted",
    stateMutability: "view",
    inputs: [
      { name: "player", type: "address" },
      { name: "achievementId", type: "string" },
    ],
    outputs: [{ name: "", type: "bool" }],
  },
  {
    type: "function",
    name: "achievementsOf",
    stateMutability: "view",
    inputs: [{ name: "player", type: "address" }],
    outputs: [
      { name: "ids", type: "string[]" },
      { name: "tokenIds", type: "uint256[]" },
      { name: "episodes", type: "uint16[]" },
    ],
  },
  {
    type: "function",
    name: "totalMinted",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "balanceOf",
    stateMutability: "view",
    inputs: [{ name: "owner", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "event",
    name: "AchievementMinted",
    inputs: [
      { name: "player", type: "address", indexed: true },
      { name: "achievementId", type: "string", indexed: false },
      { name: "episode", type: "uint16", indexed: false },
      { name: "tokenId", type: "uint256", indexed: true },
    ],
  },
] as const;

export function getAchievementContractAddress(): `0x${string}` | null {
  const address = process.env.NEXT_PUBLIC_ACHIEVEMENT_CONTRACT_ADDRESS;
  if (!address || !/^0x[0-9a-fA-F]{40}$/.test(address)) return null;
  return address as `0x${string}`;
}

/**
 * Builds a standard NFT metadata JSON object and encodes it as a data: URI —
 * fully on-chain, no external metadata hosting required. The image field
 * points at the achievement's registered art path (see achievements.ts).
 *
 * `record` is optional — mission achievements have a real transaction to
 * cite in attributes; milestone achievements don't, and say so honestly.
 */
export function buildTokenURI(
  achievement: AchievementDefinition,
  walletAddress: string,
  timestamp: number,
  record?: MissionRecord,
): string {
  const attributes: { trait_type: string; value: string }[] = [
    { trait_type: "Category", value: achievement.category === "mission" ? "Verified Mission" : "Career Milestone" },
    { trait_type: "Episode", value: String(achievement.episode) },
  ];
  if (record) {
    attributes.push(
      { trait_type: "Mission", value: record.missionName },
      { trait_type: "CipherOps Capability", value: record.feature },
      { trait_type: "Transaction Hash", value: record.txHash },
      { trait_type: "Block Number", value: record.blockNumber },
    );
  }

  const metadata = {
    name: achievement.name,
    description: achievement.description,
    image: achievement.image.finalPath,
    attributes,
    mission: record?.missionId ?? null,
    wallet: walletAddress,
    timestamp,
  };
  const json = JSON.stringify(metadata);
  const base64 = typeof window !== "undefined" ? window.btoa(json) : Buffer.from(json).toString("base64");
  return `data:application/json;base64,${base64}`;
}
