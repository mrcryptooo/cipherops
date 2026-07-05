/**
 * Runway — office backdrop artwork lookup.
 *
 * Swapping the office's appearance for a later quarter requires changing
 * only this file — add the image under /public/runway/office/ and map it
 * here. Q1 uses the Art Bible v1.0 canonical reference asset
 * (runway-office-q1-base) — every future asset must visually match it.
 * Quarters without art yet fall back to a plain gradient, never a fake
 * illustration.
 */

import type { Quarter } from "./types";

const OFFICE_BACKDROPS: Partial<Record<Quarter, string>> = {
  1: "/runway/office/runway-office-q1-base.png",
};

export function getOfficeBackdrop(quarter: Quarter): string | null {
  return OFFICE_BACKDROPS[quarter] ?? null;
}
