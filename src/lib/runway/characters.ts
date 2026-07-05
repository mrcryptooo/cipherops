/**
 * Runway — the five founding-crew characters.
 *
 * Starting qualities are authored, not randomized: every playthrough begins
 * from the same point. Divergence comes entirely from choices made during
 * play, per the frozen GDD.
 */

import type { CharacterId, CharacterProfile, CharacterQualities, GameState, WorldState } from "./types";

export const CHARACTER_PROFILES: Record<CharacterId, CharacterProfile> = {
  mara: { id: "mara", name: "Mara", role: "Founder & CEO" },
  priya: { id: "priya", name: "Priya", role: "Head of People & Ops" },
  kai: { id: "kai", name: "Kai", role: "Founding Engineer" },
  dana: { id: "dana", name: "Dana", role: "Board Advisor" },
  theo: { id: "theo", name: "Theo", role: "Intern" },
};

/**
 * Q1 starting qualities. See PRODUCT reference (Runway GDD §3) for the
 * character bios these values are derived from.
 */
export const INITIAL_CHARACTER_QUALITIES: Record<CharacterId, CharacterQualities> = {
  mara: {
    confidence: 80,
    overwhelm: 30,
    trustInPlayer: 65,
    trustInOthers: { priya: 80, kai: 70, dana: 50, theo: 50 },
  },
  priya: {
    confidence: 75,
    overwhelm: 35,
    trustInPlayer: 75,
    trustInOthers: { mara: 85, kai: 90, dana: 45, theo: 70 },
  },
  kai: {
    confidence: 70,
    overwhelm: 45,
    trustInPlayer: 55,
    trustInOthers: { mara: 65, priya: 90, dana: 35, theo: 60 },
  },
  dana: {
    confidence: 85,
    overwhelm: 15,
    trustInPlayer: 50,
    trustInOthers: { mara: 55, priya: 50, kai: 35, theo: 40 },
  },
  theo: {
    confidence: 40,
    overwhelm: 50,
    trustInPlayer: 70,
    trustInOthers: { mara: 75, priya: 80, kai: 65, dana: 30 },
  },
};

/** Q1 starting world state — scrappy, early, low scrutiny. */
export const INITIAL_WORLD_STATE: WorldState = {
  runway: 60,
  reputation: 40,
  morale: 70,
  heat: 15,
  quarter: 1,
};

export function createInitialGameState(): GameState {
  return {
    world: { ...INITIAL_WORLD_STATE },
    characters: Object.fromEntries(
      Object.entries(INITIAL_CHARACTER_QUALITIES).map(([id, qualities]) => [
        id,
        { ...qualities, trustInOthers: { ...qualities.trustInOthers } },
      ]),
    ) as Record<CharacterId, CharacterQualities>,
    flags: new Set<string>(),
    resolved: new Set<string>(),
    missionLog: [],
  };
}
