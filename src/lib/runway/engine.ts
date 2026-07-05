/**
 * Runway — eligibility engine.
 *
 * Pure functions only: given a set of storylets and the current game state,
 * determine which are currently eligible and who they're cast against.
 * Applying a resolved choice (state mutation, flags) is a separate concern —
 * see apply.ts.
 */

import { CHARACTER_IDS } from "./types";
import type { AmbientBeat, CastRule, CharacterId, CharacterProfile, CharacterQualities, GameState, Storylet, TriggerCondition } from "./types";

type CandidateCondition = Extract<TriggerCondition, { kind: "castCandidateQuality" }>;

function evaluateGlobalCondition(condition: TriggerCondition, state: GameState): boolean {
  switch (condition.kind) {
    case "world": {
      const value = state.world[condition.field];
      return condition.op === "gte" ? value >= condition.value : value <= condition.value;
    }
    case "quarter": {
      const value = state.world.quarter;
      if (condition.op === "eq") return value === condition.value;
      return condition.op === "gte" ? value >= condition.value : value <= condition.value;
    }
    case "flag":
      return state.flags.has(condition.has);
    case "flagAbsent":
      return !state.flags.has(condition.has);
    default:
      return true;
  }
}

function evaluateCandidateCondition(condition: CandidateCondition, qualities: CharacterQualities): boolean {
  const value = qualities[condition.field];
  return condition.op === "gte" ? value >= condition.value : value <= condition.value;
}

function candidatesForCastRule(cast: CastRule, state: GameState): CharacterId[] {
  if (cast.mode === "fixed") return [cast.character];
  const { field, op, value } = cast.condition;
  return CHARACTER_IDS.filter((id) => {
    const q = state.characters[id][field];
    return op === "gte" ? q >= value : q <= value;
  });
}

export interface EligibleStorylet {
  storylet: Storylet;
  castCharacter: CharacterId;
}

/** Which storylets are currently eligible, and who each is cast against. */
export function getEligibleStorylets(storylets: Storylet[], state: GameState): EligibleStorylet[] {
  const results: EligibleStorylet[] = [];

  for (const storylet of storylets) {
    if (state.resolved.has(storylet.id)) continue;

    const globalConditions = storylet.trigger.filter((c): c is Exclude<TriggerCondition, CandidateCondition> => c.kind !== "castCandidateQuality");
    const candidateConditions = storylet.trigger.filter((c): c is CandidateCondition => c.kind === "castCandidateQuality");

    if (!globalConditions.every((c) => evaluateGlobalCondition(c, state))) continue;

    const candidates = candidatesForCastRule(storylet.cast, state);
    const castCharacter = candidates.find((id) =>
      candidateConditions.every((c) => evaluateCandidateCondition(c, state.characters[id])),
    );

    if (castCharacter) results.push({ storylet, castCharacter });
  }

  return results;
}

export interface EligibleBeat {
  beat: AmbientBeat;
  castCharacter?: CharacterId;
}

/** Same eligibility shape as storylets, but beats may have no cast at all. */
export function getEligibleBeats(beats: AmbientBeat[], state: GameState): EligibleBeat[] {
  const results: EligibleBeat[] = [];

  for (const beat of beats) {
    if (state.resolved.has(beat.id)) continue;
    if (!beat.trigger.every((c) => evaluateGlobalCondition(c, state))) continue;

    if (!beat.cast) {
      results.push({ beat });
      continue;
    }
    const candidates = candidatesForCastRule(beat.cast, state);
    if (candidates.length > 0) results.push({ beat, castCharacter: candidates[0] });
  }

  return results;
}

/** Substitutes {character} in beat text with the cast character's display name, if any. */
export function renderBeatText(beat: AmbientBeat, castCharacter: CharacterId | undefined, profiles: Record<CharacterId, CharacterProfile>): string {
  if (!castCharacter) return beat.text;
  return beat.text.replace(/\{character\}/g, profiles[castCharacter].name);
}

/** Substitutes {character} in scene text with the cast character's display name. */
export function renderSceneText(
  storylet: Storylet,
  castCharacter: CharacterId,
  profiles: Record<CharacterId, CharacterProfile>,
): string {
  return storylet.sceneText.replace(/\{character\}/g, profiles[castCharacter].name);
}

export type CurrentMoment =
  | { kind: "interrupt"; entry: EligibleStorylet }
  | { kind: "beat"; entry: EligibleBeat }
  | { kind: "quiet"; entry: EligibleStorylet }
  | { kind: "finale"; entry: EligibleStorylet }
  | { kind: "none" };

/**
 * Picks the one thing happening right now, instead of listing everything
 * eligible. A Mission or a tier 2+ situation is dramatic enough that someone
 * comes to you (interrupt) — those never wait. An ambient beat takes
 * priority over a routine storylet: texture before a real decision, so
 * opening the laptop doesn't always mean facing a dilemma. The episode's
 * finale storylet is deliberately excluded from all of the above and only
 * surfaces once truly nothing else is left — guaranteeing a real ending
 * instead of an infinite "nothing to do" loop, regardless of when its own
 * trigger condition happened to become true. Authored array order breaks
 * ties within the same class.
 */
export function pickCurrentMoment(eligible: EligibleStorylet[], beats: EligibleBeat[]): CurrentMoment {
  const normal = eligible.filter((e) => !e.storylet.isEpisodeEnd);
  const finale = eligible.find((e) => e.storylet.isEpisodeEnd);

  const mission = normal.find((e) => !!e.storylet.mission);
  if (mission) return { kind: "interrupt", entry: mission };

  const urgent = normal.find((e) => e.storylet.tier >= 2);
  if (urgent) return { kind: "interrupt", entry: urgent };

  if (beats.length > 0) return { kind: "beat", entry: beats[0] };

  const routine = normal.find((e) => e.storylet.tier <= 1);
  if (routine) return { kind: "quiet", entry: routine };

  if (finale) return { kind: "finale", entry: finale };

  return { kind: "none" };
}
