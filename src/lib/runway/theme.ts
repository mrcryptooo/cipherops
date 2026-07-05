/**
 * Runway — shared visual constants. Single source for the glass/accent
 * treatment every Runway screen uses, so there's one place to change it,
 * not three copies that can quietly drift apart.
 *
 * The glass card treatment is a deliberate, scoped exception to the core
 * product's flat card system — Runway's narrative-game framing has departed
 * from the SaaS visual language throughout this build; this is the one
 * place that departure gets a name.
 */

export const RUNWAY_Y = "#FFD208";
export const RUNWAY_YDIM = "rgba(255,210,8,0.10)";
export const RUNWAY_YBORDER = "rgba(255,210,8,0.22)";
export const RUNWAY_CARD = "rgba(8,8,8,0.66)";
export const RUNWAY_BORDER = "rgba(255,255,255,0.10)";
export const RUNWAY_GLASS_BLUR = "blur(18px) saturate(140%)";
