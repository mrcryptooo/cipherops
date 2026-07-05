/**
 * Runway — core data schema.
 *
 * Everything in this file is content-as-data: storylets are records, not
 * scripted branches. The rules engine (Phase 1) selects among eligible
 * records at runtime; nothing here renders UI or holds engine logic.
 *
 * Numeric state (qualities, world state) is never displayed to the player.
 * Every consumer of this state must translate it into diegetic signal —
 * message tone, reply speed, environmental detail — never a number or bar.
 */

export type CharacterId = "mara" | "priya" | "kai" | "dana" | "theo";

export const CHARACTER_IDS: readonly CharacterId[] = ["mara", "priya", "kai", "dana", "theo"];

/** Always-visible descriptive data — names and roles are not hidden state. */
export interface CharacterProfile {
  id: CharacterId;
  name: string;
  role: string;
}

export type Quarter = 1 | 2 | 3 | 4;

export type Tier = 0 | 1 | 2 | 3;

/** Per-character invisible state. Values are conventionally 0-100. */
export interface CharacterQualities {
  confidence: number;
  overwhelm: number;
  trustInPlayer: number;
  /** Trust this character has in each other named character, keyed by id. */
  trustInOthers: Partial<Record<CharacterId, number>>;
}

/** Company-wide invisible state. Values are conventionally 0-100 except quarter. */
export interface WorldState {
  runway: number;
  reputation: number;
  morale: number;
  heat: number;
  quarter: Quarter;
}

export interface GameState {
  world: WorldState;
  characters: Record<CharacterId, CharacterQualities>;
  /** Flags left behind by resolved storylets — the callback mechanism. */
  flags: Set<string>;
  /** Ids of storylets already resolved this playthrough (for one-shot content). */
  resolved: Set<string>;
  /** Permanent record of every verified Mission this playthrough — real proof, never fabricated. */
  missionLog: MissionRecord[];
}

/**
 * Canonical proof a Mission actually happened. Written only after a real
 * on-chain read confirms the transaction — never constructed speculatively.
 */
export interface MissionRecord {
  missionId: string;
  missionName: string;
  feature: EngineId;
  walletAddress: string;
  txHash: string;
  blockNumber: string;
  timestamp: number;
  status: "verified";
  /** Reward NFT tracking. Honest by construction — "minted" only ever
   *  follows a real mint transaction; there is no fabricated success state. */
  nft: NftInfo;
}

export type NftMintStatus = "not_minted" | "minted";

export interface NftInfo {
  status: NftMintStatus;
  tokenId?: string;
  owner?: string;
  contractAddress?: string;
}

/** A single comparison against world state, a character's qualities, or a flag. */
export type TriggerCondition =
  | { kind: "world"; field: keyof Omit<WorldState, "quarter">; op: "gte" | "lte"; value: number }
  | { kind: "quarter"; op: "eq" | "gte" | "lte"; value: Quarter }
  | { kind: "flag"; has: string }
  | { kind: "flagAbsent"; has: string }
  | {
      kind: "castCandidateQuality";
      field: keyof Omit<CharacterQualities, "trustInOthers">;
      op: "gte" | "lte";
      value: number;
    };

/**
 * Determines which character(s) a re-castable storylet may be told about.
 * "fixed" pins it to one character (e.g. a Mara-only beat).
 * "anyMatching" casts against whichever character(s) currently satisfy the
 * given qualities condition — this is what lets the same template resolve
 * differently depending on who it lands on and what state they're in.
 */
export type CastRule =
  | { mode: "fixed"; character: CharacterId }
  | {
      mode: "anyMatching";
      condition: { field: keyof Omit<CharacterQualities, "trustInOthers">; op: "gte" | "lte"; value: number };
    };

/** Partial state changes a choice applies when resolved. */
export interface StateDelta {
  world?: Partial<Omit<WorldState, "quarter">>;
  /** Applied to the cast character unless a different id is given. */
  character?: Partial<Omit<CharacterQualities, "trustInOthers">>;
  characterId?: CharacterId;
  flagsSet?: string[];
  flagsCleared?: string[];
}

export interface StoryletChoice {
  id: string;
  /** Player-facing label — described by intent, never by feature or tool name. */
  label: string;
  /** Diegetic result text shown after the choice resolves. */
  resultText: string;
  delta: StateDelta;
}

/** The real-world engine a Mission's completion must be verified against. */
export type EngineId = "registry" | "operations" | "airdrop" | "vesting" | "verification";

export interface MissionSpec {
  engine: EngineId;
  /** Route the handoff screen links out to. */
  route: string;
  /** Plain-language description of the real action required — no jargon. */
  actionSummary: string;
}

/**
 * Ambient beat — pure texture. No choice, no stakes, no dilemma. Exists
 * purely so the office feels alive between real decisions: someone reacts
 * in chat, a bad joke lands, the coffee's terrible again. Optionally sets a
 * flag (for a much later callback) but never touches world/character
 * numeric state — that's what keeps it honestly stakes-free.
 */
export interface AmbientBeat {
  id: string;
  trigger: TriggerCondition[];
  /** Omit for a beat that's about the room itself, not any one person. */
  cast?: CastRule;
  /** Use {character} as a placeholder when cast is present. */
  text: string;
  flagsSet?: string[];
}

export interface Storylet {
  id: string;
  tier: Tier;
  trigger: TriggerCondition[];
  cast: CastRule;
  /** Scene text. Use {character} as a placeholder for the cast character's name. */
  sceneText: string;
  choices: StoryletChoice[];
  /** Present only for situations that require leaving the sim to resolve. */
  mission?: MissionSpec;
  /**
   * Marks the guaranteed finale for the current episode. Deferred by the
   * engine until nothing else is eligible, regardless of when its own
   * trigger condition first becomes true — so the episode always has a
   * real ending instead of trailing off into an empty "nothing to do" loop.
   */
  isEpisodeEnd?: boolean;
}
