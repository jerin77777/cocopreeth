/**
 * fontLoader.ts
 * Utility to dynamically load Google Fonts on-demand in the browser.
 */

import FONTS_DATA from '../fonts.json';

export interface FontEntry {
  name: string;
  family: string;
  category: string;
  google: boolean;
}

export const ALL_FONTS: FontEntry[] = FONTS_DATA as FontEntry[];

const loadedFonts = new Set<string>();

export function loadFont(fontFamilyOrName: string | undefined | null): void {
  if (!fontFamilyOrName || typeof window === 'undefined' || typeof document === 'undefined') return;

  const clean = fontFamilyOrName.replace(/['",]/g, ' ').trim();
  const matched = ALL_FONTS.find(
    (f) =>
      clean.toLowerCase().includes(f.name.toLowerCase()) ||
      f.family.toLowerCase().includes(clean.toLowerCase())
  );

  if (!matched || !matched.google) return;
  if (loadedFonts.has(matched.name)) return;

  loadedFonts.add(matched.name);

  const fontParam = matched.name.replace(/\s+/g, '+') + ':ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,400;1,700';
  const url = `https://fonts.googleapis.com/css2?family=${fontParam}&display=swap`;

  const existingLink = document.querySelector(`link[href*="${matched.name.replace(/\s+/g, '+')}"]`);
  if (existingLink) return;

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}
