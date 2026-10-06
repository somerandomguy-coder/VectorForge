import type { LogoStyle } from '../workers/rpc-protocol';

export interface StyleConfig {
  name: string;
  prefix: string;
  suffix: string;
  negativePrompt: string;
  icon: string;
  description: string;
}

export const STYLE_PRESETS: Record<LogoStyle, StyleConfig> = {
  'minimal-vector': {
    name: 'Minimal Vector',
    icon: '📐',
    description: 'Clean 2D corporate silhouette',
    prefix: 'minimalist flat vector logo of',
    suffix: 'clean silhouette, sharp edges, 2D vector art, solid white background, corporate identity, high contrast',
    negativePrompt: 'photorealistic, 3d render, complex shading, gradients, text, watermark, messy lines',
  },
  'app-icon': {
    name: 'Modern App Icon',
    icon: '📱',
    description: 'Sleek rounded glyph',
    prefix: 'modern rounded app icon of',
    suffix: 'sleek glyph, flat design, Apple iOS design aesthetic, solid white background, high contrast',
    negativePrompt: 'photograph, noisy, messy, realistic textures, words, typography',
  },
  'monogram': {
    name: 'Monogram Emblem',
    icon: '💠',
    description: 'Interlocking geometry',
    prefix: 'typographic monogram logo emblem representing',
    suffix: 'vector geometry, interlocking clean lines, solid background, luxury brand icon',
    negativePrompt: 'complex background, organic texture, photographic, blur',
  },
  'geometric-badge': {
    name: 'Geometric Badge',
    icon: '🛡️',
    description: 'Hexagonal crisp stamp',
    prefix: 'geometric badge logo of',
    suffix: 'hexagonal border, symmetrical vector linework, clean stamp, solid white background',
    negativePrompt: 'busy background, gradient, drop shadow, photograph',
  },
};

export function buildPrompt(userKeyword: string, style: LogoStyle): string {
  const config = STYLE_PRESETS[style] || STYLE_PRESETS['minimal-vector'];
  return `${config.prefix} ${userKeyword.trim()}, ${config.suffix}`;
}

export interface SampleConcept {
  id: string;
  title: string;
  keyword: string;
  style: LogoStyle;
  brandName: string;
  tagline: string;
  seed: number;
  color: string;
}

export const SAMPLE_CONCEPTS: SampleConcept[] = [
  {
    id: 'cyber-falcon',
    title: 'Cyber Falcon',
    keyword: 'cybernetic falcon silhouette',
    style: 'minimal-vector',
    brandName: 'FALCON LABS',
    tagline: 'AUTONOMOUS SYSTEMS',
    seed: 1042,
    color: '#06b6d4',
  },
  {
    id: 'origami-fox',
    title: 'Origami Fox',
    keyword: 'origami fox emblem',
    style: 'minimal-vector',
    brandName: 'KITSUNE',
    tagline: 'CREATIVE STUDIO',
    seed: 5882,
    color: '#f59e0b',
  },
  {
    id: 'quantum-atom',
    title: 'Quantum Core',
    keyword: 'quantum atom vortex',
    style: 'app-icon',
    brandName: 'NEXUS QUANTUM',
    tagline: 'DEEP TECH RESEARCH',
    seed: 9941,
    color: '#6366f1',
  },
  {
    id: 'geometric-wolf',
    title: 'Apex Wolf',
    keyword: 'geometric wolf head',
    style: 'geometric-badge',
    brandName: 'APEX DIGITAL',
    tagline: 'ENGINEERED PRECISION',
    seed: 2048,
    color: '#10b981',
  },
  {
    id: 'orbital-rocket',
    title: 'Orbit Rocket',
    keyword: 'minimal rocket glyph',
    style: 'app-icon',
    brandName: 'LAUNCHPAD',
    tagline: 'VENTURE ACCELERATOR',
    seed: 7712,
    color: '#ec4899',
  },
  {
    id: 'imperial-crown',
    title: 'Monarch Crest',
    keyword: 'crown emblem linework',
    style: 'monogram',
    brandName: 'SOVEREIGN',
    tagline: 'PRIVATE ASSETS',
    seed: 3311,
    color: '#ffffff',
  },
];
