/**
 * Runway — character portrait artwork lookup.
 *
 * Same pattern as office-art.ts: swapping in a real portrait for any
 * character requires changing only this file. Until an asset lands here,
 * the UI renders the initials-monogram placeholder — which occupies the
 * exact same square aspect ratio the final 512x512 portrait will use, so
 * nothing about layout, spacing, or composition changes when the real
 * asset drops in.
 */

import type { CharacterId } from "./types";

export interface CharacterArtMeta {
  assetName: string;
  purpose: string;
  width: number;
  height: number;
  fileName: string;
  finalPath: string;
  priority: "Critical" | "High" | "Medium" | "Low";
}

export const CHARACTER_ART_META: Record<CharacterId, CharacterArtMeta> = {
  mara: {
    assetName: "runway-portrait-mara",
    purpose: "Founder presence portrait — scene header and office interrupt prompt",
    width: 512,
    height: 512,
    fileName: "runway-portrait-mara.png",
    finalPath: "/runway/characters/runway-portrait-mara.png",
    priority: "High",
  },
  priya: {
    assetName: "runway-portrait-priya",
    purpose: "Head of People & Ops presence portrait — scene header and office interrupt prompt",
    width: 512,
    height: 512,
    fileName: "runway-portrait-priya.png",
    finalPath: "/runway/characters/runway-portrait-priya.png",
    priority: "High",
  },
  kai: {
    assetName: "runway-portrait-kai",
    purpose: "Founding engineer presence portrait — scene header and office interrupt prompt",
    width: 512,
    height: 512,
    fileName: "runway-portrait-kai.png",
    finalPath: "/runway/characters/runway-portrait-kai.png",
    priority: "High",
  },
  dana: {
    assetName: "runway-portrait-dana",
    purpose: "Board advisor presence portrait — scene header and office interrupt prompt",
    width: 512,
    height: 512,
    fileName: "runway-portrait-dana.png",
    finalPath: "/runway/characters/runway-portrait-dana.png",
    priority: "High",
  },
  theo: {
    assetName: "runway-portrait-theo",
    purpose: "Intern presence portrait — scene header and office interrupt prompt",
    width: 512,
    height: 512,
    fileName: "runway-portrait-theo.png",
    finalPath: "/runway/characters/runway-portrait-theo.png",
    priority: "High",
  },
};

const CHARACTER_ART: Partial<Record<CharacterId, string>> = {
  mara: CHARACTER_ART_META.mara.finalPath,
  priya: CHARACTER_ART_META.priya.finalPath,
  kai: CHARACTER_ART_META.kai.finalPath,
  dana: CHARACTER_ART_META.dana.finalPath,
  theo: CHARACTER_ART_META.theo.finalPath,
};

export function getCharacterArt(id: CharacterId): string | null {
  return CHARACTER_ART[id] ?? null;
}
