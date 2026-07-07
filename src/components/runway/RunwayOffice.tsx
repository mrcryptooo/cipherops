"use client";
/**
 * Runway — the Office. The one persistent place. No navigation, no list of
 * pages — the player either gets pulled into something by a character's
 * presence, or opens their own laptop when it's quiet. Resolving whatever's
 * in front of them returns them here, and the office reflects what changed.
 *
 * State is session-scoped, persisted to sessionStorage — closing the tab
 * genuinely ends the session, per the Layer-1 honesty rule; no fake cloud
 * save. Real on-chain Mission verification is still Phase 2 — this screen
 * shows the real outbound link but doesn't fake a transaction or a receipt.
 */

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CHARACTER_PROFILES, createInitialGameState } from "@/lib/runway/characters";
import { getCharacterArt } from "@/lib/runway/character-art";
import { getPropArt } from "@/lib/runway/prop-art";
import { getEarnedAchievements } from "@/lib/runway/achievements";
import { Q1_STORYLETS } from "@/lib/runway/storylets";
import { Q1_BEATS } from "@/lib/runway/beats";
import {
  getEligibleStorylets,
  getEligibleBeats,
  pickCurrentMoment,
  renderSceneText,
  renderBeatText,
  type EligibleStorylet,
} from "@/lib/runway/engine";
import { applyChoice, applyBeat, recordMission } from "@/lib/runway/apply";
import { saveGameState, loadGameState, clearGameState, hasSeenIntro, markIntroSeen, clearIntroSeen } from "@/lib/runway/persistence";
import { OfficeBackdrop } from "./OfficeBackdrop";
import { MissionVerify } from "./MissionVerify";
import { CareerProfile } from "./CareerProfile";
import { RunwayIntro } from "./RunwayIntro";
import { RUNWAY_Y as Y, RUNWAY_YDIM as YDIM, RUNWAY_YBORDER as YBORDER, RUNWAY_CARD as CARD, RUNWAY_BORDER as BORDER, RUNWAY_GLASS_BLUR as GLASS_BLUR } from "@/lib/runway/theme";
import type { CharacterId, GameState, MissionRecord, StoryletChoice } from "@/lib/runway/types";

// ── Office ambience — the room's own accumulated history, in priority order ──
const AMBIENCE_RULES: { flag: string; line: string }[] = [
  { flag: "vesting-formalized", line: "There's a printed page on Theo's desk he's read at least six times. He thinks nobody's noticed." },
  { flag: "rewards-delivered", line: "The claim thread in the community channel is still going. Someone's pinned it." },
  { flag: "openness-escalated", line: "Kai's camera has been off in every meeting for a week. Nobody's mentioned it out loud yet." },
  { flag: "mistake-owned", line: "There's a thank-you email from a customer pinned near the door, right next to the one about the bell." },
  { flag: "referral-taken", line: "A new name is on next week's calendar, one that wasn't there before. Mara keeps glancing at it." },
  { flag: "promise-power-user-rewards", line: "There's a rewards program you now owe someone, and it doesn't exist yet." },
  { flag: "contractor-felt-valued", line: "The bell rang once today, quietly. Nobody needed telling why." },
  { flag: "testimonial-public", line: "Someone printed out a nice thing a customer said and taped it by the door." },
  { flag: "bell-built", line: "Theo's bell sits by the door, waiting for a reason to ring." },
  { flag: "confidential-asset-ready", line: "There's a new line in Kai's monitoring dashboard that wasn't there last week. Everything downstream of it finally makes sense." },
];

function officeAmbience(state: GameState): { line: string; showBell: boolean; showNote: boolean } {
  const match = AMBIENCE_RULES.find((r) => state.flags.has(r.flag));
  return {
    line: match?.line ?? "The office is small enough that everyone can hear everyone else.",
    showBell: state.flags.has("bell-built"),
    showNote: state.flags.has("testimonial-public"),
  };
}

// ── Varied framing for who's pulling you in ──
const INTERRUPT_LINES: Record<CharacterId, string> = {
  mara: "Mara's already talking before you've got your coat off.",
  priya: "Priya catches your eye from across the room.",
  kai: "Kai's standing by your desk, arms crossed, waiting.",
  dana: "Dana's already seated, laptop open, waiting for you.",
  theo: "Theo's hovering by the door, clearly wants to show you something.",
};

const QUIET_LINES = [
  "Nothing's pulling at you right now.",
  "It's a calm one, so far.",
  "Nobody needs anything urgent from you this minute.",
];

/**
 * Character presence. Renders the real portrait once character-art.ts has
 * one registered; until then, an initials monogram fills the exact same
 * square footprint the final 512x512 portrait will use, so swapping in
 * real art later changes zero layout math.
 */
function Avatar({ id, name, size = 36 }: { id: CharacterId; name: string; size?: number }) {
  const art = getCharacterArt(id);
  if (art) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={art}
        alt={name}
        className="fade-in flex-shrink-0 rounded-full object-cover"
        style={{
          width: size,
          height: size,
          border: `1px solid ${YBORDER}`,
          boxShadow: `0 0 0 3px rgba(0,0,0,0.35), 0 2px 10px rgba(0,0,0,0.5)`,
          // A light shared grade smooths over the slight per-portrait background
          // hue variance (warm gold vs. warm orange) so the cast reads as one set.
          filter: "saturate(0.94) contrast(1.03)",
        }}
      />
    );
  }
  return (
    <span
      className="fade-in flex flex-shrink-0 items-center justify-center rounded-full font-semibold"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.4,
        background: YDIM,
        border: `1px solid ${YBORDER}`,
        color: Y,
      }}
    >
      {name.charAt(0)}
    </span>
  );
}

/** Inline SVG only, single color, per the product's existing icon rules — no illustration substitute. */
function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" className="flex-shrink-0" aria-hidden>
      <path
        d="M12 3a5 5 0 0 0-5 5v3.5c0 .9-.36 1.76-1 2.4L5 15h14l-1-1.1c-.64-.64-1-1.5-1-2.4V8a5 5 0 0 0-5-5Z"
        stroke={Y}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M10 18a2 2 0 0 0 4 0" stroke={Y} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** Fallback icon for the testimonial-note prop, used only if getPropArt() ever returns null. */
function NoteIcon() {
  return (
    <svg viewBox="0 0 24 24" width={16} height={16} fill="none" className="flex-shrink-0" aria-hidden>
      <rect x="5" y="3" width="14" height="18" rx="1.5" stroke={Y} strokeWidth="1.5" transform="rotate(-4 12 12)" />
      <path d="M8 9h8M8 13h5" stroke={Y} strokeWidth="1.3" strokeLinecap="round" transform="rotate(-4 12 12)" />
    </svg>
  );
}

/** Small round medallion treatment shared by every achievement badge — same
 *  framing rule as propIcon() above, since the delivered art is opaque. */
function AchievementBadge({ src, name }: { src: string; name: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      className="flex-shrink-0 rounded-full object-cover"
      style={{ width: 44, height: 44, border: `1px solid ${YBORDER}`, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
    />
  );
}

function propIcon(key: "bell" | "testimonialNote") {
  const art = getPropArt(key);
  if (art) {
    // The delivered prop art renders on its own opaque warm backdrop rather
    // than a transparent cutout, so it's framed as a small round medallion —
    // consistent with the achievement badge treatment — instead of sitting
    // bare against the office ambience text.
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={art}
        alt=""
        className="flex-shrink-0 rounded-full object-cover"
        style={{ width: 26, height: 26, border: `1px solid ${YBORDER}`, marginTop: 1, boxShadow: "0 2px 8px rgba(0,0,0,0.5)" }}
      />
    );
  }
  return key === "bell" ? <BellIcon /> : <NoteIcon />;
}

type Stage =
  | { kind: "office" }
  | { kind: "scene"; storyletId: string }
  | { kind: "beat"; beatId: string }
  | { kind: "resolution"; text: string }
  | { kind: "episode-end"; text: string }
  | { kind: "career" };

export function RunwayOffice() {
  const [state, setState] = useState<GameState>(() => loadGameState() ?? createInitialGameState());
  const [stage, setStage] = useState<Stage>(() => (state.flags.has("episode-complete") ? { kind: "episode-end", text: "" } : { kind: "office" }));
  const [verifiedMissionId, setVerifiedMissionId] = useState<string | null>(null);
  const [showIntro, setShowIntro] = useState(() => !hasSeenIntro());

  useEffect(() => {
    saveGameState(state);
  }, [state]);

  function handleMissionVerified(record: MissionRecord) {
    setState((prev) => recordMission(prev, record));
    setVerifiedMissionId(record.missionId);
  }

  const eligibleStorylets = useMemo(() => getEligibleStorylets(Q1_STORYLETS, state), [state]);
  const eligibleBeats = useMemo(() => getEligibleBeats(Q1_BEATS, state), [state]);
  const moment = useMemo(() => pickCurrentMoment(eligibleStorylets, eligibleBeats), [eligibleStorylets, eligibleBeats]);

  const quietLine = QUIET_LINES[state.resolved.size % QUIET_LINES.length];

  const activeEntry: EligibleStorylet | undefined =
    stage.kind === "scene" ? eligibleStorylets.find((e) => e.storylet.id === stage.storyletId) : undefined;

  const activeBeat = stage.kind === "beat" ? eligibleBeats.find((b) => b.beat.id === stage.beatId) : undefined;

  function handlePlayAgain() {
    clearGameState();
    clearIntroSeen();
    const fresh = createInitialGameState();
    setState(fresh);
    setStage({ kind: "office" });
    setShowIntro(true);
  }

  function handleChoice(choice: StoryletChoice) {
    if (!activeEntry) return;
    const next = applyChoice(state, activeEntry.storylet.id, activeEntry.castCharacter, choice);
    setState(next);
    if (activeEntry.storylet.isEpisodeEnd) {
      setStage({ kind: "episode-end", text: choice.resultText });
    } else {
      setStage({ kind: "resolution", text: choice.resultText });
    }
  }

  function handleBeatContinue() {
    if (!activeBeat) return;
    setState(applyBeat(state, activeBeat.beat));
    setStage({ kind: "office" });
  }

  let content: React.ReactNode;

  // ── Episode end — the guaranteed finale, not a page, a real close ────
  if (stage.kind === "episode-end") {
    const decisions = state.resolved.size;
    const closingLine = stage.text || "It's been a real quarter. You made it through — barely, but you made it.";
    const earned = getEarnedAchievements(state);
    content = (
      <Scene keyId="episode-end">
        <p className="fade-in mb-2 text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.16em" }}>
          End of Q1
        </p>
        <div className="fade-in glass-accent mb-6 rounded-xl p-6" style={{ animationDelay: "60ms", background: YDIM, border: `1px solid ${YBORDER}` }}>
          <p className="text-[15px] leading-relaxed" style={{ color: "#e4e4e4" }}>{closingLine}</p>
        </div>
        <div className="fade-in glass mb-6 rounded-xl p-6" style={{ animationDelay: "120ms", background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-sm" style={{ color: "#999" }}>
            {decisions} real decisions this quarter — {state.missionLog.length} of them real enough to leave the building for.
          </p>
          {state.flags.has("theo-reveal-witnessed") && (
            <p className="mt-2 text-sm" style={{ color: "#999" }}>
              Theo still doesn&apos;t know anyone else could pull up what he&apos;s worth. Nobody can. That was never a coincidence.
            </p>
          )}
        </div>
        {earned.length > 0 && (
          <div className="fade-in glass mb-6 rounded-xl p-6" style={{ animationDelay: "160ms", background: CARD, border: `1px solid ${BORDER}` }}>
            <p className="mb-3 text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.14em" }}>
              Achievements this episode
            </p>
            <div className="space-y-2">
              {earned.map((a) => (
                <div key={a.id} className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <AchievementBadge src={a.image.finalPath} name={a.name} />
                    <div>
                      <p className="text-sm" style={{ color: "#e4e4e4" }}>{a.name}</p>
                      <p className="text-xs" style={{ color: "#777" }}>{a.description}</p>
                    </div>
                  </div>
                  <span
                    className="flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium"
                    style={{ background: a.category === "mission" ? YDIM : "rgba(255,255,255,0.06)", border: `1px solid ${a.category === "mission" ? YBORDER : BORDER}`, color: a.category === "mission" ? Y : "#888" }}
                  >
                    {a.category === "mission" ? "Mission" : "Milestone"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
        <button
          onClick={handlePlayAgain}
          className="fade-in cta-btn mt-6 rounded-lg px-4 py-2 text-sm font-bold"
          style={{ animationDelay: "200ms", background: Y, color: "#000" }}
        >
          Play Q1 again
        </button>
      </Scene>
    );
  } else if (stage.kind === "resolution") {
    content = (
      <Scene keyId="resolution">
        <div className="fade-in glass rounded-xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-[15px] leading-relaxed" style={{ color: "#e4e4e4" }}>{stage.text}</p>
        </div>
        <button
          onClick={() => setStage({ kind: "office" })}
          className="fade-in cta-btn mt-6 rounded-lg px-4 py-2 text-sm font-bold"
          style={{ animationDelay: "120ms", background: Y, color: "#000" }}
        >
          Back to the office
        </button>
      </Scene>
    );
  } else if (stage.kind === "beat" && activeBeat) {
    // ── Ambient beat — no choice, just a moment ──────────────────────────
    const text = renderBeatText(activeBeat.beat, activeBeat.castCharacter, CHARACTER_PROFILES);
    content = (
      <Scene keyId={stage.beatId}>
        <div className="fade-in glass rounded-xl p-6" style={{ background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-[15px] leading-relaxed" style={{ color: "#e4e4e4" }}>{text}</p>
        </div>
        <button
          onClick={handleBeatContinue}
          className="fade-in cta-btn-quiet mt-6 rounded-lg px-4 py-2 text-sm font-medium"
          style={{ animationDelay: "120ms", background: "transparent", border: `1px solid ${BORDER}`, color: "#e4e4e4" }}
        >
          Continue
        </button>
      </Scene>
    );
  } else if (stage.kind === "scene" && activeEntry) {
    // ── Inside a scene ────────────────────────────────────────────────────
    const { storylet, castCharacter } = activeEntry;
    const profile = CHARACTER_PROFILES[castCharacter];
    const text = renderSceneText(storylet, castCharacter, CHARACTER_PROFILES);

    content = (
      <Scene keyId={stage.storyletId}>
        <div className="fade-in mb-3 flex items-center gap-2.5">
          <Avatar id={castCharacter} name={profile.name} />
          <p className="text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.16em" }}>
            {profile.name} · {profile.role}
          </p>
        </div>
        <div className="fade-in glass mb-6 rounded-xl p-6" style={{ animationDelay: "60ms", background: CARD, border: `1px solid ${BORDER}` }}>
          <p className="text-[15px] leading-relaxed" style={{ color: "#e4e4e4" }}>{text}</p>
        </div>

        {storylet.mission ? (
          <div className="fade-in space-y-6" style={{ animationDelay: "140ms" }}>
            <div className="glass-accent rounded-xl p-6 text-center" style={{ background: YDIM, border: `1px solid ${YBORDER}` }}>
              <p className="mb-4 text-sm" style={{ color: "#ccc" }}>
                This one needs to happen for real. You grab your things and head out.
              </p>
              <p className="mb-5 text-sm font-medium" style={{ color: "#e4e4e4" }}>{storylet.mission.actionSummary}</p>
              <Link
                href={storylet.mission.route}
                className="mission-cta inline-flex rounded-lg px-5 py-2.5 text-sm font-bold"
                style={{ background: Y, color: "#000" }}
              >
                Open CipherOps →
              </Link>
            </div>

            {verifiedMissionId === storylet.id || state.missionLog.some((m) => m.missionId === storylet.id) ? (
              <div className="flex flex-col gap-2">
                <p className="text-xs" style={{ color: "#888" }}>It&apos;s confirmed. How do you want to close this out?</p>
                {storylet.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => handleChoice(choice)}
                    className="choice-btn glass rounded-lg px-4 py-3 text-left text-sm"
                    style={{ background: CARD, border: `1px solid ${BORDER}`, color: "#e4e4e4" }}
                  >
                    {choice.label}
                  </button>
                ))}
              </div>
            ) : (
              <MissionVerify
                missionId={storylet.id}
                missionName={storylet.mission.actionSummary}
                feature={storylet.mission.engine}
                onVerified={handleMissionVerified}
              />
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {storylet.choices.map((choice, i) => (
              <button
                key={choice.id}
                onClick={() => handleChoice(choice)}
                className="choice-btn fade-in glass rounded-lg px-4 py-3 text-left text-sm"
                style={{ animationDelay: `${140 + i * 60}ms`, background: CARD, border: `1px solid ${BORDER}`, color: "#e4e4e4" }}
              >
                {choice.label}
              </button>
            ))}
          </div>
        )}
      </Scene>
    );
  } else if (stage.kind === "career") {
    content = <CareerProfile state={state} onBack={() => setStage({ kind: "office" })} />;
  } else {
    // ── The office itself ──────────────────────────────────────────────
    const ambience = officeAmbience(state);

    content = (
      <Scene keyId={`office-${state.resolved.size}`}>
        <p className="fade-in mb-2 text-xs font-semibold uppercase" style={{ color: Y, letterSpacing: "0.16em" }}>
          The Office
        </p>
        <div className="fade-in mb-8 flex items-start gap-2" style={{ animationDelay: "40ms" }}>
          {ambience.showBell && propIcon("bell")}
          {ambience.showNote && propIcon("testimonialNote")}
          <p className="text-[15px] leading-relaxed" style={{ color: "#999" }}>{ambience.line}</p>
        </div>

        {moment.kind === "none" && (
          <div className="fade-in glass rounded-xl p-6 text-center" style={{ animationDelay: "100ms", background: CARD, border: `1px solid ${BORDER}` }}>
            <p className="text-sm" style={{ color: "#888" }}>Nothing needs you right now.</p>
          </div>
        )}

        {(moment.kind === "interrupt" || moment.kind === "finale") && (
          <div className="fade-in glass rounded-xl p-6" style={{ animationDelay: "100ms", background: CARD, border: `1px solid ${BORDER}` }}>
            <div className="mb-4 flex items-center gap-3">
              <Avatar id={moment.entry.castCharacter} name={CHARACTER_PROFILES[moment.entry.castCharacter].name} size={48} />
              <p className="text-sm leading-relaxed" style={{ color: "#e4e4e4" }}>
                {moment.kind === "finale" ? "Priya's waiting to close out the quarter with you." : INTERRUPT_LINES[moment.entry.castCharacter]}
              </p>
            </div>
            <button
              onClick={() => setStage({ kind: "scene", storyletId: moment.entry.storylet.id })}
              className="cta-btn rounded-lg px-4 py-2 text-sm font-bold"
              style={{ background: Y, color: "#000" }}
            >
              See what they need
            </button>
          </div>
        )}

        {(moment.kind === "quiet" || moment.kind === "beat") && (
          <div className="fade-in glass rounded-xl p-6" style={{ animationDelay: "100ms", background: CARD, border: `1px solid ${BORDER}` }}>
            <p className="mb-4 text-sm" style={{ color: "#888" }}>{quietLine}</p>
            <button
              onClick={() =>
                moment.kind === "beat"
                  ? setStage({ kind: "beat", beatId: moment.entry.beat.id })
                  : setStage({ kind: "scene", storyletId: moment.entry.storylet.id })
              }
              className="cta-btn-quiet rounded-lg px-4 py-2 text-sm font-medium"
              style={{ background: "transparent", border: `1px solid ${BORDER}`, color: "#e4e4e4" }}
            >
              Open your laptop
            </button>
          </div>
        )}

        <button
          onClick={() => setStage({ kind: "career" })}
          className="fade-in mt-6 text-xs underline-offset-2 hover:underline"
          style={{ animationDelay: "220ms", color: "#666" }}
        >
          Review your career
        </button>
      </Scene>
    );
  }

  if (showIntro) {
    return (
      <div className="runway-app">
        <OfficeBackdrop quarter={state.world.quarter} />
        <RunwayIntro
          onContinue={() => {
            markIntroSeen();
            setShowIntro(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="runway-app">
      <OfficeBackdrop quarter={state.world.quarter} />
      <div className="relative z-10">{content}</div>
    </div>
  );
}

/** Shared transition shell — fadeSlideIn per Design System §7, reduced-motion safe. */
function Scene({ keyId, children }: { keyId: string; children: React.ReactNode }) {
  return (
    <div key={keyId} className="scene-enter mx-auto max-w-xl px-4 py-16 sm:px-6 lg:px-10">
      {children}
      <style jsx global>{`
        .runway-app button:focus-visible,
        .runway-app a:focus-visible {
          outline: 2px solid ${Y};
          outline-offset: 2px;
          border-radius: 4px;
        }
        .glass {
          backdrop-filter: ${GLASS_BLUR};
          -webkit-backdrop-filter: ${GLASS_BLUR};
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45);
        }
        .glass-accent {
          backdrop-filter: ${GLASS_BLUR};
          -webkit-backdrop-filter: ${GLASS_BLUR};
          box-shadow: 0 8px 32px rgba(255, 210, 8, 0.08);
        }
        .scene-enter {
          animation: sceneFadeSlideIn 0.45s ease both;
        }
        .fade-in {
          animation: sceneFadeSlideIn 0.4s ease both;
        }
        @keyframes sceneFadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .mission-cta {
          animation: missionGlow 3s ease-in-out infinite;
          transition: transform 0.15s ease;
        }
        .mission-cta:hover {
          transform: translateY(-1px);
        }
        @keyframes missionGlow {
          0%, 100% { box-shadow: 0 0 16px rgba(255, 210, 8, 0.25); }
          50% { box-shadow: 0 0 28px rgba(255, 210, 8, 0.4); }
        }
        .cta-btn {
          transition: transform 0.15s ease, opacity 0.15s ease;
        }
        .cta-btn:hover {
          opacity: 0.9;
          transform: translateY(-1px);
        }
        .cta-btn:active {
          transform: translateY(0) scale(0.98);
        }
        .cta-btn-quiet {
          transition: transform 0.12s ease, border-color 0.12s ease, background 0.12s ease;
        }
        .cta-btn-quiet:hover {
          border-color: rgba(255, 210, 8, 0.3);
          background: rgba(255, 210, 8, 0.04);
          transform: translateY(-1px);
        }
        .choice-btn {
          transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        }
        .choice-btn:hover {
          border-color: rgba(255, 210, 8, 0.3) !important;
          background: rgba(255, 210, 8, 0.04) !important;
          transform: translateY(-2px);
          box-shadow: 0 8px 32px rgba(255, 210, 8, 0.06);
        }
        .choice-btn:active {
          transform: translateY(-1px) scale(0.99);
        }
        @media (prefers-reduced-motion: reduce) {
          .scene-enter, .fade-in { animation: none; }
          .mission-cta { animation: none; box-shadow: 0 0 20px rgba(255, 210, 8, 0.3); }
          .mission-cta:hover, .cta-btn:hover, .cta-btn-quiet:hover, .choice-btn:hover,
          .cta-btn:active, .choice-btn:active { transform: none; }
        }
      `}</style>
    </div>
  );
}
