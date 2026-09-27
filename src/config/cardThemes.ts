import React from 'react';
import { TemplatePreset } from '../types';

export interface CardThemeItem {
  id: TemplatePreset;
  name: string;
  category: string;
  description: string;
  defaultBaseColor: string; // Warna dasar utama
  accentColor: string;
  headerBg: string;
  headerText: string;
  badgeBg: string;
  badgeText: string;
  bannerBg: string;
  cardBg: string;
  borderColor: string;
  fontFamilyClass: string;
  photoFrameShape: 'neobrutal' | 'dual_ring' | 'classic_piagam' | 'mihrab_dome' | 'cyber_hud' | 'royal_octa' | 'scandi_box' | 'aurora_glow' | 'vintage_stitch' | 'corporate_clip';
  lanyardColor: string;
}

export const CARD_THEMES: CardThemeItem[] = [
  {
    id: 'neobrutal',
    name: 'Neobrutal Pop',
    category: 'Chunky & Kontras',
    description: 'Gaya tebal kontras 3px, bayangan offset hitam padat, frame foto berbayang stiker punchy',
    defaultBaseColor: '#FFE600',
    accentColor: '#00F0FF',
    headerBg: '#FFE600',
    headerText: '#111111',
    badgeBg: '#111111',
    badgeText: '#FFE600',
    bannerBg: '#111111',
    cardBg: '#FFFFFF',
    borderColor: '#111111',
    fontFamilyClass: 'font-sans font-black',
    photoFrameShape: 'neobrutal',
    lanyardColor: '#FFE600',
  },
  {
    id: 'modern',
    name: 'Modern Minimalist',
    category: 'Sleek & Dual-Ring',
    description: 'Geometris bersih, frame foto dengan ring ganda teal, badge status pil elegan, bayangan lembut',
    defaultBaseColor: '#0F766E',
    accentColor: '#14B8A6',
    headerBg: '#0F766E',
    headerText: '#FFFFFF',
    badgeBg: '#CCFBF1',
    badgeText: '#0F766E',
    bannerBg: '#134E4A',
    cardBg: '#FFFFFF',
    borderColor: '#0F766E',
    fontFamilyClass: 'font-sans font-bold',
    photoFrameShape: 'dual_ring',
    lanyardColor: '#0F766E',
  },
  {
    id: 'classic',
    name: 'Classic Academic',
    category: 'Formal Piagam',
    description: 'Tata letak piagam resmi akademis, ornamen garis ganda emas & navy, tipografi serif bermartabat',
    defaultBaseColor: '#1E3A8A',
    accentColor: '#D97706',
    headerBg: '#1E3A8A',
    headerText: '#FFFFFF',
    badgeBg: '#FEF3C7',
    badgeText: '#92400E',
    bannerBg: '#0F172A',
    cardBg: '#FCFDFE',
    borderColor: '#1E3A8A',
    fontFamilyClass: 'font-serif',
    photoFrameShape: 'classic_piagam',
    lanyardColor: '#1E3A8A',
  },
  {
    id: 'madrasah',
    name: 'Madrasah Islami',
    category: 'Kubah Mihrab Hijau',
    description: 'Nuansa hijau Kemenag & emas madrasah, frame foto lengkung kubah mihrab islami',
    defaultBaseColor: '#047857',
    accentColor: '#F59E0B',
    headerBg: '#047857',
    headerText: '#FFFFFF',
    badgeBg: '#FEF08A',
    badgeText: '#854D0E',
    bannerBg: '#064E3B',
    cardBg: '#FFFFFF',
    borderColor: '#065F46',
    fontFamilyClass: 'font-sans font-bold',
    photoFrameShape: 'mihrab_dome',
    lanyardColor: '#047857',
  },
  {
    id: 'cyber',
    name: 'Cyber Tech HUD',
    category: 'Dark HUD Monospace',
    description: 'Antarmuka futuristik gelap, sudut frame chamfered 45° glowing neon cyan, font monospace',
    defaultBaseColor: '#0A0F1D',
    accentColor: '#06B6D4',
    headerBg: '#0A0F1D',
    headerText: '#38BDF8',
    badgeBg: '#083344',
    badgeText: '#22D3EE',
    bannerBg: '#020617',
    cardBg: '#060A12',
    borderColor: '#0EA5E9',
    fontFamilyClass: 'font-mono',
    photoFrameShape: 'cyber_hud',
    lanyardColor: '#0284C7',
  },
  {
    id: 'royal',
    name: 'Royal Luxury Gold',
    category: 'Emas & Hitam Mewah',
    description: 'Gaya eksekutif piagam kehormatan, garis ganda emas metalik berkilau, frame foto oktagonal',
    defaultBaseColor: '#78350F',
    accentColor: '#F59E0B',
    headerBg: '#1C1917',
    headerText: '#FDE68A',
    badgeBg: '#78350F',
    badgeText: '#FDE68A',
    bannerBg: '#292524',
    cardBg: '#FFFDF9',
    borderColor: '#B45309',
    fontFamilyClass: 'font-serif font-bold',
    photoFrameShape: 'royal_octa',
    lanyardColor: '#D97706',
  },
  {
    id: 'minimalist',
    name: 'Scandinavian Clean',
    category: 'Swiss Grid Minimalis',
    description: 'Tipografi presisi Swiss grid, pembatas garis 1px bersih, frame foto studio proporsional',
    defaultBaseColor: '#334155',
    accentColor: '#64748B',
    headerBg: '#1E293B',
    headerText: '#F8FAFC',
    badgeBg: '#F1F5F9',
    badgeText: '#334155',
    bannerBg: '#0F172A',
    cardBg: '#FFFFFF',
    borderColor: '#CBD5E1',
    fontFamilyClass: 'font-sans font-semibold tracking-tight',
    photoFrameShape: 'scandi_box',
    lanyardColor: '#475569',
  },
  {
    id: 'aurora',
    name: 'Vibrant Aurora Flow',
    category: 'Gradasi Dinamis',
    description: 'Aksen gradien ungu-violet modern, sudut membulat kontemporer, bingkai foto bergradasi glowing',
    defaultBaseColor: '#6D28D9',
    accentColor: '#EC4899',
    headerBg: '#6D28D9',
    headerText: '#FFFFFF',
    badgeBg: '#F3E8FF',
    badgeText: '#6D28D9',
    bannerBg: '#4C1D95',
    cardBg: '#FFFFFF',
    borderColor: '#8B5CF6',
    fontFamilyClass: 'font-sans font-extrabold',
    photoFrameShape: 'aurora_glow',
    lanyardColor: '#7C3AED',
  },
  {
    id: 'vintage',
    name: 'Vintage Badge Retro',
    category: 'Stempel Piagam Retro',
    description: 'Gaya piagam retro vintage berkas dinas, border jahitan dashed, stempel verifikasi otentik',
    defaultBaseColor: '#854D0E',
    accentColor: '#B45309',
    headerBg: '#FEF3C7',
    headerText: '#78350F',
    badgeBg: '#FDE68A',
    badgeText: '#78350F',
    bannerBg: '#451A03',
    cardBg: '#FFFDF5',
    borderColor: '#B45309',
    fontFamilyClass: 'font-serif',
    photoFrameShape: 'vintage_stitch',
    lanyardColor: '#92400E',
  },
  {
    id: 'corporate',
    name: 'Corporate Executive',
    category: 'Lanyard ID Profesional',
    description: 'Desain tanda pengenal dinas resmi, garis aksen vertikal kiri, slot kait lanyard keamanan',
    defaultBaseColor: '#0369A1',
    accentColor: '#0284C7',
    headerBg: '#075985',
    headerText: '#FFFFFF',
    badgeBg: '#E0F2FE',
    badgeText: '#0369A1',
    bannerBg: '#0C4A6E',
    cardBg: '#FFFFFF',
    borderColor: '#0284C7',
    fontFamilyClass: 'font-sans font-bold',
    photoFrameShape: 'corporate_clip',
    lanyardColor: '#0284C7',
  },
];

export const getThemeById = (themeId?: string): CardThemeItem => {
  if (!themeId) return CARD_THEMES[0];
  const found = CARD_THEMES.find((t) => t.id === themeId);
  if (found) return found;

  // Fallback mappings for old preset keys
  if (themeId === 'playful') return CARD_THEMES[0]; // neobrutal
  if (themeId === 'crimson') return CARD_THEMES[5]; // royal
  if (themeId === 'dark') return CARD_THEMES[4]; // cyber
  if (themeId === 'indigo') return CARD_THEMES[7]; // aurora
  if (themeId === 'violet') return CARD_THEMES[7]; // aurora
  if (themeId === 'coral') return CARD_THEMES[8]; // vintage

  return CARD_THEMES[0];
};

/**
 * Helper to calculate dynamic colors if user overrides the base color of any theme
 */
export const resolveThemeStyles = (theme: CardThemeItem, customBaseColor?: string) => {
  const baseColor = customBaseColor && customBaseColor.trim() ? customBaseColor.trim() : theme.defaultBaseColor;
  const isDarkCyber = theme.id === 'cyber';

  return {
    baseColor,
    headerBg: customBaseColor ? baseColor : theme.headerBg,
    headerText: theme.headerText,
    accentColor: theme.accentColor,
    cardBg: isDarkCyber ? theme.cardBg : '#FFFFFF',
    borderColor: isDarkCyber ? theme.borderColor : baseColor,
    bannerBg: customBaseColor ? baseColor : theme.bannerBg,
    badgeBg: theme.badgeBg,
    badgeText: theme.badgeText,
    fontFamilyClass: theme.fontFamilyClass,
    photoFrameShape: theme.photoFrameShape,
    lanyardColor: customBaseColor ? baseColor : theme.lanyardColor,
  };
};

export const COLOR_SWATCH_PRESETS = [
  { name: 'Kuning Brutal', hex: '#FFE600' },
  { name: 'Teal Modern', hex: '#0F766E' },
  { name: 'Navy Formal', hex: '#1E3A8A' },
  { name: 'Hijau Kemenag', hex: '#047857' },
  { name: 'Cyber Dark', hex: '#0A0F1D' },
  { name: 'Emas Mewah', hex: '#78350F' },
  { name: 'Abu Skandinavia', hex: '#334155' },
  { name: 'Violet Aurora', hex: '#6D28D9' },
  { name: 'Terra Cotta Retro', hex: '#854D0E' },
  { name: 'Biru Korporat', hex: '#0369A1' },
  { name: 'Merah Marun', hex: '#991B1B' },
  { name: 'Oranye Senja', hex: '#EA580C' },
];
