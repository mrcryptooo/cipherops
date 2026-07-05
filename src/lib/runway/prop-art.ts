/**
 * Runway — office prop artwork lookup.
 *
 * Props are small illustrated objects that appear once a specific flag is
 * set — the room's own visible memory of what happened. Until a real prop
 * image lands, each renders as an inline icon placeholder next to its
 * ambience line, at the prop's registered flag and priority. Swapping in
 * the real illustrated asset is a one-file change here plus pointing the
 * office's icon-render call at the image instead of the icon component —
 * no layout or trigger logic changes.
 */

export type PropKey = "bell" | "testimonialNote";

export interface PropArtMeta {
  assetName: string;
  purpose: string;
  width: number;
  height: number;
  fileName: string;
  finalPath: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  /** The flag whose presence makes this prop visible in the office. */
  flag: string;
}

export const PROP_ART_META: Record<PropKey, PropArtMeta> = {
  bell: {
    assetName: "runway-prop-bell",
    purpose: "Theo's desk bell — visible once built, the room's physical memory of that moment",
    width: 300,
    height: 300,
    fileName: "runway-prop-bell.png",
    finalPath: "/runway/office/runway-prop-bell.png",
    priority: "Medium",
    flag: "bell-built",
  },
  testimonialNote: {
    assetName: "runway-prop-testimonial-note-v2",
    purpose: "Printed customer testimonial taped up once shared publicly",
    width: 250,
    height: 320,
    fileName: "runway-prop-testimonial-note-v2.png",
    finalPath: "/runway/office/runway-prop-testimonial-note-v2.png",
    priority: "Medium",
    flag: "testimonial-public",
  },
};

const PROP_ART: Partial<Record<PropKey, string>> = {
  bell: PROP_ART_META.bell.finalPath,
  testimonialNote: PROP_ART_META.testimonialNote.finalPath,
};

export function getPropArt(key: PropKey): string | null {
  return PROP_ART[key] ?? null;
}
