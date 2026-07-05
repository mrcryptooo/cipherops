/**
 * Runway — applying a resolved choice to game state.
 *
 * Pure and immutable: returns a new GameState, never mutates the one it's
 * given. Keeps the engine side of this testable independent of any UI.
 */

import type { AmbientBeat, CharacterId, GameState, MissionRecord, NftInfo, StoryletChoice } from "./types";

function clamp(value: number): number {
  return Math.max(0, Math.min(100, value));
}

export function applyChoice(state: GameState, storyletId: string, castCharacter: CharacterId, choice: StoryletChoice): GameState {
  const { delta } = choice;
  const targetId = delta.characterId ?? castCharacter;

  const nextWorld = { ...state.world };
  if (delta.world) {
    for (const [key, value] of Object.entries(delta.world)) {
      const field = key as keyof typeof nextWorld;
      if (typeof nextWorld[field] === "number" && typeof value === "number") {
        (nextWorld[field] as number) = clamp(nextWorld[field] + value);
      }
    }
  }

  const nextCharacters = { ...state.characters };
  if (delta.character) {
    const current = nextCharacters[targetId];
    const updated = { ...current };
    for (const [key, value] of Object.entries(delta.character)) {
      const field = key as keyof typeof updated;
      if (typeof updated[field] === "number" && typeof value === "number") {
        (updated[field] as number) = clamp((updated[field] as number) + value);
      }
    }
    nextCharacters[targetId] = updated;
  }

  const nextFlags = new Set(state.flags);
  for (const f of delta.flagsSet ?? []) nextFlags.add(f);
  for (const f of delta.flagsCleared ?? []) nextFlags.delete(f);

  const nextResolved = new Set(state.resolved);
  nextResolved.add(storyletId);

  return {
    world: nextWorld,
    characters: nextCharacters,
    flags: nextFlags,
    resolved: nextResolved,
    missionLog: state.missionLog,
  };
}

/** Beats never touch numeric state — just an optional flag, and marking it seen. */
export function applyBeat(state: GameState, beat: AmbientBeat): GameState {
  const nextFlags = new Set(state.flags);
  for (const f of beat.flagsSet ?? []) nextFlags.add(f);

  const nextResolved = new Set(state.resolved);
  nextResolved.add(beat.id);

  return { ...state, flags: nextFlags, resolved: nextResolved };
}

/**
 * Appends a verified Mission to the permanent log. Called only after a real
 * on-chain read has confirmed the transaction — this function never
 * constructs or validates proof itself, it just records what was already
 * confirmed real.
 */
export function recordMission(state: GameState, record: MissionRecord): GameState {
  return { ...state, missionLog: [...state.missionLog, record] };
}

/**
 * Patches a mission's nft field after a real mint transaction confirms —
 * called only with data read back from an actual on-chain mint, same
 * honesty rule as recordMission itself.
 */
export function updateMissionNft(state: GameState, missionId: string, nft: NftInfo): GameState {
  return {
    ...state,
    missionLog: state.missionLog.map((m) => (m.missionId === missionId ? { ...m, nft } : m)),
  };
}
