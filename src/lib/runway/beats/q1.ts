/**
 * Runway — Q1 ambient beats. Pure texture, no stakes. These are what make
 * the office feel alive between the real dilemmas — never a decision,
 * never a consequence beyond an optional flag for a much later callback.
 */

import type { AmbientBeat } from "../types";

export const Q1_BEATS: AmbientBeat[] = [
  {
    id: "q1-beat-coffee",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    text: "Someone made a fresh pot of coffee. It's somehow worse than the old one. Everyone drinks it anyway.",
  },
  {
    id: "q1-beat-support-email",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "priya" },
    text: "{character} reads a support email out loud just because it's funny. It has nothing to do with anything.",
  },
  {
    id: "q1-beat-old-bug",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "kai" },
    text: "{character} finds a bug that's been sitting there since week one. Laughs instead of being annoyed. Fixes it in five minutes.",
  },
  {
    id: "q1-beat-loud-music",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    text: "Someone's playing music a little too loud. Nobody says anything about it today.",
  },
  {
    id: "q1-beat-quiet-afternoon",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "contractor-terms-set" }],
    text: "A slow afternoon. Everyone's just working. It's a good kind of quiet.",
  },
  {
    id: "q1-beat-bad-joke",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "theo" },
    text: "{character} tells a genuinely terrible joke. It lands anyway, mostly out of surprise.",
  },
  {
    id: "q1-beat-relief",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "contractor-felt-valued" }],
    cast: { mode: "fixed", character: "mara" },
    text: "{character} mentions, almost offhand, that things feel like they're actually working. She doesn't dwell on it.",
  },
  {
    id: "q1-beat-thankyou-note",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "sharp-eyed" }],
    text: "Someone left a sticky note on your monitor. It just says \"thanks for catching that.\" No name.",
  },
  {
    id: "q1-beat-mara-caps",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "mara" },
    text: "{character} posts \"BIG NEWS 🎉\" in the group chat. It turns out to be that the printer got fixed. Nobody points this out to her.",
  },
  {
    id: "q1-beat-priya-kai-glance",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    text: "Priya and Kai finish each other's sentence in a meeting, then both go slightly too quiet about it. Nobody says anything. Everybody notices.",
  },
  {
    id: "q1-beat-plant",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    text: "The office plant near the window is somehow still alive. Nobody remembers whose job it is to water it. It just keeps happening.",
  },
  {
    id: "q1-beat-wrong-meeting",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "theo" },
    text: "{character} joins the wrong video call for two full minutes before realizing. The other company was very polite about it.",
  },
  {
    id: "q1-beat-playlist-war",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    text: "Someone changes the office playlist without asking. Someone else changes it back within the hour. This has apparently been going on for weeks.",
  },
  {
    id: "q1-beat-dana-dry",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "dana" },
    text: "\"I've seen three companies die of optimism,\" {character} says, in the same tone she'd use to order coffee. It takes the room a solid five seconds to realize that was a joke.",
  },
  {
    id: "q1-beat-wifi",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    text: "The wifi drops for exactly four minutes. Everyone stares at their laptops like that will fix it. It does not. Then it's back.",
  },
  {
    id: "q1-beat-snacks-run",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "theo" },
    text: "{character} does a snack run without being asked and somehow gets everyone's order right, including the one nobody told him.",
  },
  {
    id: "q1-beat-late-light",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }, { kind: "flag", has: "contractor-terms-set" }],
    text: "It's dark outside by the time you look up. Just one lamp still on. It's a good kind of tired.",
  },
  {
    id: "q1-beat-kai-headphones",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "kai" },
    text: "{character} has had the same pair of headphones on since this morning without once taking them off. Nobody's brave enough to find out what he's listening to.",
  },
  {
    id: "q1-beat-priya-remembers",
    trigger: [{ kind: "quarter", op: "eq", value: 1 }],
    cast: { mode: "fixed", character: "priya" },
    text: "{character} remembers it's someone's half-birthday, or invents the concept on the spot, and brings in donuts anyway. Nobody questions the math.",
  },
];
