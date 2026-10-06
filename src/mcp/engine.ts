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

export function generateMcpLogo(options: McpLogoGenerationOptions): McpLogoResult {
  const width = 512;
  const height = 512;
  const cx = width / 2;
  const cy = height / 2;
  const style = options.style || 'geometric-badge';
  const colorHex = options.colorHex || '#6366f1';
  const turdsize = options.turdsize ?? 3;
  const opttolerance = options.opttolerance ?? 0.2;
  const prompt = (options.prompt || 'vectorforge emblem').toLowerCase();

  const raster = new SoftwareRasterizer(width, height);

  // 1. Draw Motif
  if (prompt.includes('vectorforge') || prompt.includes('forge') || prompt.includes('anvil')) {
    // Hexagonal Badge + Anvil Body + Vector Node
    renderVectorForgeMark(raster, cx, cy);
  } else if (prompt.includes('falcon') || prompt.includes('eagle') || prompt.includes('bird')) {
    renderFalconMark(raster, cx, cy);
  } else if (prompt.includes('fox') || prompt.includes('wolf')) {
    renderCanineMark(raster, cx, cy);
  } else if (prompt.includes('atom') || prompt.includes('quantum')) {
    renderAtomMark(raster, cx, cy);
  } else if (prompt.includes('rocket')) {
    renderRocketMark(raster, cx, cy);
  } else if (prompt.includes('crown')) {
    renderCrownMark(raster, cx, cy);
  } else if (style === 'app-icon') {
    renderAppIconMark(raster, cx, cy);
  } else if (style === 'monogram') {
    renderMonogramMark(raster, cx, cy);
  } else if (style === 'geometric-badge') {
    renderBadgeMark(raster, cx, cy);
  } else {
    renderMinimalPolygonMark(raster, cx, cy);
  }

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

function renderVectorForgeMark(raster: SoftwareRasterizer, cx: number, cy: number) {
  // Hexagonal Outer Border
  const r = 168;
  const hexPts: Array<[number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    hexPts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  raster.strokePolygon(hexPts, 16, 1);

  // Anvil Top Table
  raster.fillRect(cx - 105, cy - 65, 205, 45, 1);
  // Anvil Horn (Right)
  raster.fillPolygon([
    [cx + 100, cy - 65],
    [cx + 165, cy - 35],
    [cx + 100, cy - 20],
  ], 1);
  // Left Stepped Horn
  raster.fillPolygon([
    [cx - 105, cy - 65],
    [cx - 130, cy - 20],
    [cx - 105, cy - 20],
  ], 1);
  // Anvil Base & Waist
  raster.fillPolygon([
    [cx - 70, cy - 20],
    [cx + 70, cy - 20],
    [cx + 115, cy + 95],
    [cx - 115, cy + 95],
  ], 1);

  // Center Vector Diamond Node Cutout (White 0)
  const d = 34;
  raster.fillPolygon([
    [cx, cy - d],
    [cx + d, cy],
    [cx, cy + d],
    [cx - d, cy],
  ], 0);

  // Center Vector Anchor Pin (Black 1)
  raster.fillCircle(cx, cy, 12, 1);

  // Horizontal Alignment Cutout (White 0)
  raster.fillRect(cx - 85, cy + 45, 170, 7, 0);
}

function renderFalconMark(raster: SoftwareRasterizer, cx: number, cy: number) {
  // Wing and tail silhouette
  raster.fillPolygon([
    [cx, cy - 130],
    [cx - 200, cy + 70],
    [cx - 70, cy + 70],
    [cx - 40, cy + 120],
    [cx, cy + 160],
    [cx + 40, cy + 120],
    [cx + 70, cy + 70],
    [cx + 200, cy + 70],
  ], 1);

  // Negative cuts
  raster.fillPolygon([
    [cx, cy - 50],
    [cx - 24, cy + 40],
    [cx, cy + 80],
    [cx + 24, cy + 40],
  ], 0);
}

function renderCanineMark(raster: SoftwareRasterizer, cx: number, cy: number) {
  raster.fillPolygon([
    [cx, cy - 30],
    [cx - 130, cy - 150],
    [cx - 100, cy - 20],
    [cx - 170, cy + 40],
    [cx - 70, cy + 100],
    [cx, cy + 170],
    [cx + 70, cy + 100],
    [cx + 170, cy + 40],
    [cx + 100, cy - 20],
    [cx + 130, cy - 150],
  ], 1);
  raster.fillCircle(cx - 50, cy + 30, 12, 0);
  raster.fillCircle(cx + 50, cy + 30, 12, 0);
}

function renderAtomMark(raster: SoftwareRasterizer, cx: number, cy: number) {
  raster.fillCircle(cx, cy, 42, 1);
  raster.strokeCircle(cx, cy, 140, 14, 1);
  raster.strokeCircle(cx, cy, 95, 12, 1);
}

function renderRocketMark(raster: SoftwareRasterizer, cx: number, cy: number) {
  raster.fillPolygon([
    [cx, cy - 160],
    [cx + 60, cy + 100],
    [cx + 120, cy + 150],
    [cx + 30, cy + 130],
    [cx, cy + 140],
    [cx - 30, cy + 130],
    [cx - 120, cy + 150],
    [cx - 60, cy + 100],
  ], 1);
  raster.fillCircle(cx, cy - 25, 24, 0);
}

function renderCrownMark(raster: SoftwareRasterizer, cx: number, cy: number) {
  raster.fillPolygon([
    [cx - 150, cy + 90],
    [cx - 170, cy - 60],
    [cx - 80, cy + 15],
    [cx, cy - 100],
    [cx + 80, cy + 15],
    [cx + 170, cy - 60],
    [cx + 150, cy + 90],
  ], 1);
  raster.fillCircle(cx, cy + 45, 18, 0);
  raster.fillCircle(cx - 85, cy + 45, 14, 0);
  raster.fillCircle(cx + 85, cy + 45, 14, 0);
}

function renderAppIconMark(raster: SoftwareRasterizer, cx: number, cy: number) {
  const size = 320;
  const x = cx - size / 2;
  const y = cy - size / 2;
  raster.fillRect(x, y, size, size, 1);
  // Cutout glyph
  raster.fillPolygon([
    [cx, cy - 70],
    [cx + 70, cy + 50],
    [cx + 35, cy + 60],
    [cx, cy - 5],
    [cx - 35, cy + 60],
    [cx - 70, cy + 50],
  ], 0);
}

function renderMonogramMark(raster: SoftwareRasterizer, cx: number, cy: number) {
  raster.strokePolygon([
    [cx, cy - 140],
    [cx + 120, cy - 40],
    [cx + 120, cy + 70],
    [cx, cy + 140],
    [cx - 120, cy + 70],
    [cx - 120, cy - 40],
  ], 24, 1);
  raster.drawLine(cx - 60, cy - 50, cx + 60, cy + 50, 18, 1);
  raster.drawLine(cx + 60, cy - 50, cx - 60, cy + 50, 18, 1);
}

function renderBadgeMark(raster: SoftwareRasterizer, cx: number, cy: number) {
  const r = 160;
  const hexPts: Array<[number, number]> = [];
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    hexPts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  raster.strokePolygon(hexPts, 14, 1);
  raster.strokeCircle(cx, cy, 120, 6, 1);
  raster.fillCircle(cx, cy, 50, 1);
}

function renderMinimalPolygonMark(raster: SoftwareRasterizer, cx: number, cy: number) {
  const pts: Array<[number, number]> = [];
  const count = 6;
  const r = 135;
  for (let i = 0; i < count; i++) {
    const angle = (i * Math.PI) / 3;
    pts.push([cx + Math.cos(angle) * r, cy + Math.sin(angle) * r]);
  }
  raster.fillPolygon(pts, 1);
  raster.fillCircle(cx, cy, 45, 0);
}
