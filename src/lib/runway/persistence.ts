/**
 * Runway — save/load. Session-scoped only, per the Layer-1 honesty rule
 * established for the rest of the product: this never implies a saved
 * account, cloud sync, or persistence beyond the current tab. Closing the
 * tab genuinely ends the session, exactly as the game's own fiction expects.
 */

import type { CharacterId, CharacterQualities, GameState, MissionRecord, WorldState } from "./types";

// v2 adds missionLog — bumped so a v1 save from before this schema never
// gets loaded half-formed; it just starts a fresh episode instead.
const STORAGE_KEY = "runway:q1:save:v2";

interface SerializedGameState {
  world: WorldState;
  characters: Record<CharacterId, CharacterQualities>;
  flags: string[];
  resolved: string[];
  missionLog: MissionRecord[];
}

export function saveGameState(state: GameState): void {
  if (typeof window === "undefined") return;
  try {
    const serialized: SerializedGameState = {
      world: state.world,
      characters: state.characters,
      flags: Array.from(state.flags),
      resolved: Array.from(state.resolved),
      missionLog: state.missionLog,
    };
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch {
    // sessionStorage unavailable (private mode, etc.) — session just won't persist
  }
}

export function loadGameState(): GameState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SerializedGameState;
    return {
      world: parsed.world,
      characters: parsed.characters,
      flags: new Set(parsed.flags),
      resolved: new Set(parsed.resolved),
      missionLog: parsed.missionLog ?? [],
    };
  } catch {
    return null;
  }
}

export function clearGameState(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

// Tracks whether the one-time intro screen has been dismissed this session —
// cleared alongside the save on replay, so a fresh playthrough sees it again.
const INTRO_SEEN_KEY = "runway:q1:intro-seen";

export function hasSeenIntro(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.sessionStorage.getItem(INTRO_SEEN_KEY) === "1";
  } catch {
    return true;
  }
}

export function markIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(INTRO_SEEN_KEY, "1");
  } catch {
    // ignore
  }
}

export function clearIntroSeen(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(INTRO_SEEN_KEY);
  } catch {
    // ignore
  }
}
