import { SoftwareRasterizer } from './rasterizer.js';
import { traceBitmap, getSVG, type PotraceOptions } from '../postprocess/potrace/index.js';
import { formatAndRecolorSvg } from '../postprocess/vectorizer.js';
import { composeBrandSvg, type BrandLayout, type TypographyConfig } from '../ui/typography-layer.js';
import type { LogoStyle } from '../workers/rpc-protocol.js';

export interface McpLogoGenerationOptions {
  prompt: string;
  style?: LogoStyle;
  seed?: number;
  colorHex?: string;
  brandName?: string;
  tagline?: string;
  layout?: BrandLayout;
  letterSpacing?: number;
  turdsize?: number;
  opttolerance?: number;
}

export interface McpLogoResult {
  svg: string;
  markOnlySvg: string;
  pathCount: number;
  prompt: string;
  style: LogoStyle;
  colorHex: string;
  width: number;
  height: number;
}

// Mulberry32 PRNG
class SeededRandom {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  next(): number {
    let t = (this.state += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  range(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  int(min: number, max: number): number {
    return Math.floor(this.range(min, max + 1));
  }

  bool(probability = 0.5): boolean {
    return this.next() < probability;
  }

  pick<T>(array: T[]): T {
    return array[this.int(0, array.length - 1)];
  }
}

function hashPrompt(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function generateMcpLogo(options: McpLogoGenerationOptions): McpLogoResult {
  const width = 512;
  const height = 512;
  const cx = width / 2;
  const cy = height / 2;
  const style = options.style || 'geometric-badge';
  const colorHex = options.colorHex || '#6366f1';
  const turdsize = options.turdsize ?? 3;
  const opttolerance = options.opttolerance ?? 0.2;
  const rawPrompt = options.prompt || 'vectorforge emblem';
  const prompt = rawPrompt.toLowerCase();

  const seed = options.seed ?? 42;
  const promptHash = hashPrompt(prompt.trim().toLowerCase());
  const combinedSeed = (promptHash ^ (seed * 2654435761)) >>> 0;
  const rng = new SeededRandom(combinedSeed);

  const raster = new SoftwareRasterizer(width, height);

  // 1. Draw Motif using parametric generative engine
  renderGenerativeRasterMotif(raster, cx, cy, rng, prompt, style);

  // 2. Trace Bitmap to SVG
  const bitmap = raster.toPotraceBitmap();
  const potraceOpts: Partial<PotraceOptions> = {
    turdsize,
    optcurve: true,
    alphamax: 1.0,
    opttolerance,
  };

  const paths = traceBitmap(bitmap, potraceOpts);
  const rawSvg = getSVG(paths, 1);
  const markOnlySvg = formatAndRecolorSvg(rawSvg, colorHex, width, height);

  // 3. Compose Brand Typography if requested
  let finalSvg = markOnlySvg;
  if (options.brandName && options.brandName.trim()) {
    const typoConfig: TypographyConfig = {
      brandName: options.brandName,
      tagline: options.tagline || '',
      fontFamily: "'Space Grotesk', sans-serif",
      layout: options.layout || 'stacked',
      letterSpacing: options.letterSpacing ?? 4,
      colorHex,
    };
    finalSvg = composeBrandSvg(markOnlySvg, typoConfig);
  }

  return {
    svg: finalSvg,
    markOnlySvg,
    pathCount: paths.length,
    prompt: options.prompt,
    style,
    colorHex,
    width,
    height,
  };
}

function renderGenerativeRasterMotif(
  raster: SoftwareRasterizer,
  cx: number,
  cy: number,
  rng: SeededRandom,
  prompt: string,
  style: LogoStyle
) {
  if (prompt.includes('vectorforge') || prompt.includes('anvil') || prompt.includes('forge')) {
    renderVectorForgeMark(raster, cx, cy, rng);
  } else if (prompt.includes('falcon') || prompt.includes('eagle') || prompt.includes('bird') || prompt.includes('hawk') || prompt.includes('phoenix')) {
    renderBirdMark(raster, cx, cy, rng);
  } else if (prompt.includes('fox') || prompt.includes('wolf') || prompt.includes('canine') || prompt.includes('dog')) {
    renderCanineMark(raster, cx, cy, rng);
  } else if (prompt.includes('cat') || prompt.includes('lion') || prompt.includes('tiger') || prompt.includes('panther')) {
    renderFelineMark(raster, cx, cy, rng);
  } else if (prompt.includes('dragon') || prompt.includes('wyvern') || prompt.includes('serpent')) {
    renderDragonMark(raster, cx, cy, rng);
  } else if (prompt.includes('bear') || prompt.includes('bull') || prompt.includes('ram') || prompt.includes('stag')) {
    renderBeastMark(raster, cx, cy, rng);
  } else if (prompt.includes('flame') || prompt.includes('fire') || prompt.includes('blaze')) {
    renderFlameMark(raster, cx, cy, rng);
  } else if (prompt.includes('water') || prompt.includes('wave') || prompt.includes('ocean')) {
    renderWaveMark(raster, cx, cy, rng);
  } else if (prompt.includes('mountain') || prompt.includes('peak') || prompt.includes('summit')) {
    renderMountainMark(raster, cx, cy, rng);
  } else if (prompt.includes('tree') || prompt.includes('leaf') || prompt.includes('plant') || prompt.includes('flower') || prompt.includes('lotus')) {
    renderBotanicalMark(raster, cx, cy, rng);
  } else if (prompt.includes('atom') || prompt.includes('quantum') || prompt.includes('orbit')) {
    renderQuantumMark(raster, cx, cy, rng);
  } else if (prompt.includes('rocket') || prompt.includes('space') || prompt.includes('shuttle')) {
    renderRocketMark(raster, cx, cy, rng);
  } else if (prompt.includes('crown') || prompt.includes('king') || prompt.includes('royal')) {
    renderCrownMark(raster, cx, cy, rng);
  } else if (prompt.includes('shield') || prompt.includes('security') || prompt.includes('guard')) {
    renderShieldMark(raster, cx, cy, rng);
  } else if (prompt.includes('sword') || prompt.includes('blade') || prompt.includes('dagger')) {
    renderSwordMark(raster, cx, cy, rng);
  } else if (prompt.includes('lightning') || prompt.includes('electric') || prompt.includes('bolt')) {
    renderLightningMark(raster, cx, cy, rng);
  } else if (prompt.includes('diamond') || prompt.includes('crystal') || prompt.includes('gem')) {
    renderCrystalMark(raster, cx, cy, rng);
  } else if (prompt.includes('camera') || prompt.includes('lens') || prompt.includes('eye')) {
    renderEyeApertureMark(raster, cx, cy, rng);
  } else if (prompt.includes('anchor') || prompt.includes('marine') || prompt.includes('nautical')) {
    renderAnchorMark(raster, cx, cy, rng);
  } else if (prompt.includes('coffee') || prompt.includes('cup') || prompt.includes('tea')) {
    renderCoffeeMark(raster, cx, cy, rng);
  } else if (prompt.includes('cube') || prompt.includes('box') || prompt.includes('isometric')) {
    renderCubeMark(raster, cx, cy, rng);
  } else if (prompt.includes('infinity') || prompt.includes('loop')) {
    renderInfinityMark(raster, cx, cy, rng);
  } else if (prompt.includes('circuit') || prompt.includes('tech') || prompt.includes('cyber')) {
    renderCircuitMark(raster, cx, cy, rng);
  } else {
    if (style === 'app-icon') {
      renderAppIconMark(raster, cx, cy, rng);
    } else if (style === 'monogram') {
      renderMonogramMark(raster, cx, cy, rng);
    } else if (style === 'geometric-badge') {
      renderBadgeMark(raster, cx, cy, rng);
    } else {
      renderUniversalHarmonicMark(raster, cx, cy, rng);
    }
  }
}

// 1. VectorForge Brand Motif
function renderVectorForgeMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const r = rng.range(155, 175);
  const borderThick = Math.round(rng.range(12, 18));
  const hexPts: Array<[number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    hexPts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  raster.strokePolygon(hexPts, borderThick, 1);

  // Anvil Top Table
  const anvilW = rng.range(190, 225);
  raster.fillRect(cx - anvilW / 2, cy - 65, anvilW, 45, 1);
  // Anvil Horn
  raster.fillPolygon([
    [cx + anvilW / 2 - 10, cy - 65],
    [cx + anvilW / 2 + 55, cy - 35],
    [cx + anvilW / 2 - 10, cy - 20],
  ], 1);
  // Anvil Left Stepped Horn
  raster.fillPolygon([
    [cx - anvilW / 2, cy - 65],
    [cx - anvilW / 2 - 25, cy - 20],
    [cx - anvilW / 2, cy - 20],
  ], 1);
  // Anvil Base & Waist
  raster.fillPolygon([
    [cx - 70, cy - 20],
    [cx + 70, cy - 20],
    [cx + 115, cy + 95],
    [cx - 115, cy + 95],
  ], 1);

  // Center Vector Diamond Node Cutout (White 0)
  const d = Math.round(rng.range(30, 40));
  raster.fillPolygon([
    [cx, cy - d],
    [cx + d, cy],
    [cx, cy + d],
    [cx - d, cy],
  ], 0);

  // Center Vector Anchor Pin (Black 1)
  raster.fillCircle(cx, cy, Math.round(d * 0.35), 1);

  // Horizontal Alignment Cutout (White 0)
  raster.fillRect(cx - 85, cy + 45, 170, 7, 0);
}

// 2. Falcon / Eagle / Bird
function renderBirdMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const span = rng.range(170, 220);
  const headY = rng.range(cy - 160, cy - 130);
  const tailY = rng.range(cy + 140, cy + 175);
  raster.fillPolygon([
    [cx, headY],
    [cx - span * 0.5, cy - 40],
    [cx - span, cy + 50],
    [cx - span * 0.6, cy + 80],
    [cx - 35, cy + 120],
    [cx, tailY],
    [cx + 35, cy + 120],
    [cx + span * 0.6, cy + 80],
    [cx + span, cy + 50],
    [cx + span * 0.5, cy - 40],
  ], 1);

  // Cutouts
  raster.fillPolygon([
    [cx, cy - 50],
    [cx - 24, cy + 40],
    [cx, cy + 80],
    [cx + 24, cy + 40],
  ], 0);
}

// 3. Canine / Wolf / Fox
function renderCanineMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const earSpread = rng.range(110, 150);
  const earTop = rng.range(cy - 170, cy - 130);
  const jawSpread = rng.range(140, 185);
  const snoutY = rng.range(cy + 140, cy + 180);

  raster.fillPolygon([
    [cx, cy - 30],
    [cx - earSpread, earTop],
    [cx - 90, cy - 20],
    [cx - jawSpread, cy + 40],
    [cx - 70, cy + 100],
    [cx, snoutY],
    [cx + 70, cy + 100],
    [cx + jawSpread, cy + 40],
    [cx + 90, cy - 20],
    [cx + earSpread, earTop],
  ], 1);

  const eyeDist = rng.range(42, 58);
  raster.fillCircle(cx - eyeDist, cy + 30, 11, 0);
  raster.fillCircle(cx + eyeDist, cy + 30, 11, 0);
}

// 4. Feline / Lion
function renderFelineMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const maneR = rng.range(130, 160);
  raster.fillCircle(cx, cy, maneR, 1);
  // Cutout muzzle and eyes
  raster.fillCircle(cx - 50, cy - 25, 14, 0);
  raster.fillCircle(cx + 50, cy - 25, 14, 0);
  raster.fillPolygon([
    [cx, cy + 10],
    [cx + 25, cy + 55],
    [cx - 25, cy + 55],
  ], 0);
  raster.fillRect(cx - 3, cy + 55, 6, 45, 0);
}

// 5. Dragon / Wyvern
function renderDragonMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const wingR = rng.range(150, 200);
  raster.fillPolygon([
    [cx, cy - 140],
    [cx - wingR, cy - 40],
    [cx - wingR * 0.7, cy + 60],
    [cx - 30, cy + 110],
    [cx, cy + 160],
    [cx + 30, cy + 110],
    [cx + wingR * 0.7, cy + 60],
    [cx + wingR, cy - 40],
  ], 1);
  // Negative eyes / core
  raster.fillPolygon([
    [cx, cy - 40],
    [cx + 30, cy + 20],
    [cx, cy + 80],
    [cx - 30, cy + 20],
  ], 0);
}

// 6. Beast / Bull / Stag
function renderBeastMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const hornSpread = rng.range(150, 190);
  raster.fillPolygon([
    [cx - hornSpread, cy - 120],
    [cx - 70, cy - 30],
    [cx - 100, cy + 90],
    [cx, cy + 150],
    [cx + 100, cy + 90],
    [cx + 70, cy - 30],
    [cx + hornSpread, cy - 120],
    [cx, cy - 80],
  ], 1);
  raster.fillCircle(cx, cy + 40, 25, 0);
}

// 7. Flame / Fire
function renderFlameMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const w = rng.range(100, 140);
  const topY = rng.range(cy - 165, cy - 130);
  raster.fillPolygon([
    [cx, topY],
    [cx + w * 0.8, cy - 20],
    [cx + w, cy + 70],
    [cx + w * 0.4, cy + 150],
    [cx, cy + 165],
    [cx - w * 0.4, cy + 150],
    [cx - w, cy + 70],
    [cx - w * 0.8, cy - 20],
  ], 1);
  // Inner negative flame
  raster.fillPolygon([
    [cx, cy - 20],
    [cx + 35, cy + 60],
    [cx, cy + 120],
    [cx - 35, cy + 60],
  ], 0);
}

// 8. Water / Wave
function renderWaveMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const r = rng.range(120, 150);
  raster.strokeCircle(cx, cy, r, rng.range(16, 24), 1);
  raster.fillPolygon([
    [cx - r * 0.8, cy + 30],
    [cx - r * 0.3, cy - 40],
    [cx + r * 0.3, cy + 40],
    [cx + r * 0.8, cy - 30],
    [cx + r * 0.8, cy + 70],
    [cx - r * 0.8, cy + 70],
  ], 1);
}

// 9. Mountain
function renderMountainMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const w = rng.range(160, 210);
  const peakY = rng.range(cy - 150, cy - 110);
  raster.fillPolygon([
    [cx, peakY],
    [cx + w, cy + 130],
    [cx - w, cy + 130],
  ], 1);
  // Snow cap negative cutout
  raster.fillPolygon([
    [cx, peakY + 30],
    [cx + 40, peakY + 90],
    [cx + 15, peakY + 80],
    [cx, peakY + 95],
    [cx - 15, peakY + 80],
    [cx - 40, peakY + 90],
  ], 0);
}

// 10. Botanical / Leaf
function renderBotanicalMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const r = rng.range(110, 140);
  const petals = rng.int(4, 8);
  for (let i = 0; i < petals; i++) {
    const angle = (i * Math.PI * 2) / petals;
    const px = cx + Math.cos(angle) * r * 0.55;
    const py = cy + Math.sin(angle) * r * 0.55;
    raster.fillCircle(px, py, r * 0.38, 1);
  }
  raster.fillCircle(cx, cy, r * 0.25, 0);
}

// 11. Quantum / Atom
function renderQuantumMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const coreR = rng.range(36, 48);
  const ring1 = rng.range(125, 150);
  const ring2 = rng.range(85, 110);
  raster.fillCircle(cx, cy, coreR, 1);
  raster.strokeCircle(cx, cy, ring1, rng.range(10, 16), 1);
  raster.strokeCircle(cx, cy, ring2, rng.range(10, 14), 1);
}

// 12. Rocket
function renderRocketMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const w = rng.range(45, 65);
  const topY = rng.range(cy - 170, cy - 140);
  const botY = rng.range(cy + 90, cy + 120);

  raster.fillPolygon([
    [cx, topY],
    [cx + w, cy - 20],
    [cx + w, botY],
    [cx + w + 55, botY + 45],
    [cx + w * 0.4, botY + 20],
    [cx, botY + 40],
    [cx - w * 0.4, botY + 20],
    [cx - w - 55, botY + 45],
    [cx - w, botY],
    [cx - w, cy - 20],
  ], 1);
  // Porthole
  raster.fillCircle(cx, cy - 25, rng.range(20, 26), 0);
}

// 13. Crown
function renderCrownMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const w = rng.range(140, 175);
  const h = rng.range(120, 150);
  raster.fillPolygon([
    [cx - w, cy + 90],
    [cx - w - 20, cy - 50],
    [cx - w * 0.45, cy + 15],
    [cx, cy - h],
    [cx + w * 0.45, cy + 15],
    [cx + w + 20, cy - 50],
    [cx + w, cy + 90],
  ], 1);
  raster.fillCircle(cx, cy + 45, 18, 0);
  raster.fillCircle(cx - w * 0.5, cy + 45, 13, 0);
  raster.fillCircle(cx + w * 0.5, cy + 45, 13, 0);
}

// 14. Shield
function renderShieldMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const w = rng.range(120, 155);
  const topY = cy - 130;
  raster.fillPolygon([
    [cx - w, topY],
    [cx + w, topY],
    [cx + w, cy + 10],
    [cx, cy + 160],
    [cx - w, cy + 10],
  ], 1);
  // Inner cutout
  const iw = w * 0.72;
  raster.fillPolygon([
    [cx - iw, topY + 25],
    [cx + iw, topY + 25],
    [cx + iw, cy],
    [cx, cy + 125],
    [cx - iw, cy],
  ], 0);
}

// 15. Sword
function renderSwordMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const h = rng.range(140, 175);
  raster.fillPolygon([
    [cx, cy - h],
    [cx + 25, cy + 40],
    [cx + 80, cy + 50],
    [cx + 80, cy + 70],
    [cx + 15, cy + 70],
    [cx + 15, cy + 130],
    [cx - 15, cy + 130],
    [cx - 15, cy + 70],
    [cx - 80, cy + 70],
    [cx - 80, cy + 50],
    [cx - 25, cy + 40],
  ], 1);
  raster.fillCircle(cx, cy + 145, 18, 1);
}

// 16. Lightning
function renderLightningMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const span = rng.range(70, 95);
  raster.fillPolygon([
    [cx + span * 0.3, cy - 160],
    [cx - span, cy - 10],
    [cx - 10, cy - 10],
    [cx - span * 0.4, cy + 160],
    [cx + span, cy + 10],
    [cx + 10, cy + 10],
  ], 1);
}

// 17. Crystal / Diamond
function renderCrystalMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const w = rng.range(130, 165);
  const h = rng.range(140, 175);
  raster.fillPolygon([
    [cx, cy - h],
    [cx + w, cy - h * 0.25],
    [cx + w * 0.6, cy + h],
    [cx - w * 0.6, cy + h],
    [cx - w, cy - h * 0.25],
  ], 1);
  // Facet cutouts
  raster.fillCircle(cx, cy, 32, 0);
}

// 18. Eye / Camera
function renderEyeApertureMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const r = rng.range(125, 155);
  raster.strokeCircle(cx, cy, r, rng.range(14, 22), 1);
  raster.fillCircle(cx, cy, rng.range(42, 60), 1);
  raster.fillCircle(cx, cy, 18, 0);
}

// 19. Anchor
function renderAnchorMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const r = rng.range(120, 150);
  raster.fillRect(cx - 14, cy - 110, 28, 220, 1);
  raster.fillRect(cx - 75, cy - 50, 150, 22, 1);
  raster.strokeCircle(cx, cy + 60, r * 0.7, 24, 1);
  raster.fillCircle(cx, cy - 130, 30, 1);
  raster.fillCircle(cx, cy - 130, 14, 0);
}

// 20. Coffee Cup
function renderCoffeeMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const w = rng.range(110, 140);
  raster.fillPolygon([
    [cx - w, cy - 50],
    [cx + w, cy - 50],
    [cx + w * 0.7, cy + 90],
    [cx - w * 0.7, cy + 90],
  ], 1);
  raster.strokeCircle(cx + w + 15, cy + 10, 36, 18, 1);
  raster.fillRect(cx - w * 0.85, cy + 105, w * 1.7, 18, 1);
}

// 21. Isometric Cube
function renderCubeMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const r = rng.range(120, 155);
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  raster.fillPolygon(pts, 1);
  raster.drawLine(cx, cy, cx, cy - r, 16, 0);
  raster.drawLine(cx, cy, cx + Math.cos(Math.PI / 6) * r, cy + Math.sin(Math.PI / 6) * r, 16, 0);
  raster.drawLine(cx, cy, cx - Math.cos(Math.PI / 6) * r, cy + Math.sin(Math.PI / 6) * r, 16, 0);
}

// 22. Infinity Ribbon
function renderInfinityMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const span = rng.range(65, 85);
  const r = rng.range(55, 75);
  raster.strokeCircle(cx - span, cy, r, 24, 1);
  raster.strokeCircle(cx + span, cy, r, 24, 1);
}

// 23. Circuit Network
function renderCircuitMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const size = rng.range(140, 180);
  raster.strokePolygon([
    [cx - size / 2, cy - size / 2],
    [cx + size / 2, cy - size / 2],
    [cx + size / 2, cy + size / 2],
    [cx - size / 2, cy + size / 2],
  ], 18, 1);
  raster.fillCircle(cx, cy, 32, 1);
  raster.fillRect(cx - 10, cy - size * 0.8, 20, size * 0.4, 1);
  raster.fillRect(cx - 10, cy + size * 0.4, 20, size * 0.4, 1);
}

// 24. App Icon Style
function renderAppIconMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const size = rng.range(290, 330);
  const x = cx - size / 2;
  const y = cy - size / 2;
  raster.fillRect(x, y, size, size, 1);

  // Cutout glyph
  const glyphH = size * 0.4;
  raster.fillPolygon([
    [cx, cy - glyphH],
    [cx + glyphH * 0.8, cy + glyphH * 0.6],
    [cx + glyphH * 0.35, cy + glyphH * 0.75],
    [cx, cy],
    [cx - glyphH * 0.35, cy + glyphH * 0.75],
    [cx - glyphH * 0.8, cy + glyphH * 0.6],
  ], 0);
}

// 25. Monogram Style
function renderMonogramMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const r = rng.range(130, 160);
  const sides = 6;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * Math.PI * 2) / sides - Math.PI / 2;
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  raster.strokePolygon(pts, rng.range(20, 28), 1);
  raster.drawLine(cx - 60, cy - 60, cx + 60, cy + 60, 20, 1);
  raster.drawLine(cx + 60, cy - 60, cx - 60, cy + 60, 20, 1);
}

// 26. Geometric Badge Style
function renderBadgeMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const r = rng.range(145, 175);
  const sides = rng.pick([6, 8, 12]);
  const hexPts: Array<[number, number]> = [];
  for (let i = 0; i < sides; i++) {
    const angle = (i * Math.PI * 2) / sides - Math.PI / 2;
    hexPts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  raster.strokePolygon(hexPts, rng.range(12, 18), 1);
  raster.strokeCircle(cx, cy, r * 0.75, 5, 1);
  raster.fillCircle(cx, cy, r * 0.35, 1);
}

// 27. Universal Harmonic Radial & Origami Synthesizer (Infinite Mathematical Variety)
function renderUniversalHarmonicMark(raster: SoftwareRasterizer, cx: number, cy: number, rng: SeededRandom) {
  const symmetry = rng.pick([3, 4, 5, 6, 7, 8, 10, 12]);
  const baseR = rng.range(110, 150);
  const isSolid = rng.bool(0.65);
  const freq1 = rng.int(1, 3);
  const amp1 = rng.range(20, 50);
  const freq2 = rng.int(2, 6);
  const amp2 = rng.range(15, 35);

  const samples = symmetry * 36;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < samples; i++) {
    const theta = (i * Math.PI * 2) / samples;
    const modR = baseR + Math.sin(theta * symmetry * freq1) * amp1 + Math.cos(theta * freq2) * amp2;
    pts.push([cx + Math.cos(theta) * modR, cy + Math.sin(theta) * modR]);
  }

  if (isSolid) {
    raster.fillPolygon(pts, 1);
    const coreSides = rng.pick([3, 4, 5, 6, 8]);
    const coreR = rng.range(35, 65);
    const corePts: Array<[number, number]> = [];
    for (let i = 0; i < coreSides; i++) {
      const a = (i * Math.PI * 2) / coreSides - Math.PI / 2;
      corePts.push([cx + Math.cos(a) * coreR, cy + Math.sin(a) * coreR]);
    }
    raster.fillPolygon(corePts, 0);
  } else {
    raster.strokePolygon(pts, rng.range(18, 28), 1);
    raster.fillCircle(cx, cy, rng.range(25, 45), 1);
  }
}
