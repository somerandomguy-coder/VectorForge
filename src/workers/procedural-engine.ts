import type { GenerationParams, LogoStyle } from './rpc-protocol';

/**
 * Procedural Logo Synthesis Engine (Worker Side)
 * Renders high-contrast 512x512 silhouette bitmaps directly onto OffscreenCanvas
 * using mathematical geometry, bezier curves, symmetry, and style motifs.
 */

// Simple seeded PRNG (Linear Congruential Generator / Mulberry32)
function createRng(seed: number) {
  let s = seed >>> 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export async function generateProceduralLogo(params: GenerationParams): Promise<ImageBitmap> {
  const { prompt, style, seed } = params;
  const width = params.width || 512;
  const height = params.height || 512;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  const rng = createRng(seed);

  // 1. Fill solid crisp white background (required for clean alpha knockout)
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 2. Setup rendering state for dark mark
  ctx.fillStyle = '#0a0d18';
  ctx.strokeStyle = '#0a0d18';
  ctx.lineWidth = 14 + rng() * 10;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const cx = width / 2;
  const cy = height / 2;
  const lowerPrompt = prompt.toLowerCase();

  ctx.save();

  // Draw according to style & motif
  if (style === 'app-icon') {
    renderAppIconMotif(ctx, cx, cy, rng, lowerPrompt);
  } else if (style === 'monogram') {
    renderMonogramMotif(ctx, cx, cy, rng, lowerPrompt);
  } else if (style === 'geometric-badge') {
    renderGeometricBadgeMotif(ctx, cx, cy, rng, lowerPrompt);
  } else {
    // Default: 'minimal-vector'
    renderMinimalVectorMotif(ctx, cx, cy, rng, lowerPrompt);
  }

  ctx.restore();

  // Small pause to mimic compute and yield to event loop
  await new Promise((r) => setTimeout(r, 40));

  return canvas.transferToImageBitmap();
}

/**
 * Style 1: Minimal Vector (Clean corporate silhouette with bilateral symmetry)
 */
function renderMinimalVectorMotif(
  ctx: OffscreenCanvasRenderingContext2D,
  cx: number,
  cy: number,
  rng: () => number,
  prompt: string
) {
  const isBird = prompt.includes('falcon') || prompt.includes('eagle') || prompt.includes('bird') || prompt.includes('hawk');
  const isFoxOrWolf = prompt.includes('fox') || prompt.includes('wolf') || prompt.includes('dog');
  const isAtom = prompt.includes('atom') || prompt.includes('quantum') || prompt.includes('orbit');
  const isRocket = prompt.includes('rocket') || prompt.includes('space') || prompt.includes('ship');
  const isCrown = prompt.includes('crown') || prompt.includes('king') || prompt.includes('royal');

  if (isBird) {
    // Sharp falcon / eagle wing & beak silhouette
    ctx.beginPath();
    ctx.moveTo(cx, cy - 130);
    // Left wing
    ctx.bezierCurveTo(cx - 70, cy - 120, cx - 180, cy - 30, cx - 210, cy + 80);
    ctx.bezierCurveTo(cx - 150, cy + 60, cx - 110, cy + 30, cx - 70, cy + 70);
    ctx.lineTo(cx - 50, cy + 120);
    // Center tail
    ctx.lineTo(cx, cy + 160);
    // Right wing
    ctx.lineTo(cx + 50, cy + 120);
    ctx.lineTo(cx + 70, cy + 70);
    ctx.bezierCurveTo(cx + 110, cy + 30, cx + 150, cy + 60, cx + 210, cy + 80);
    ctx.bezierCurveTo(cx + 180, cy - 30, cx + 70, cy - 120, cx, cy - 130);
    ctx.closePath();
    ctx.fill();

    // Sharp cutouts for vector feather lines
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 60);
    ctx.lineTo(cx - 24, cy + 40);
    ctx.lineTo(cx, cy + 80);
    ctx.lineTo(cx + 24, cy + 40);
    ctx.closePath();
    ctx.fill();
  } else if (isFoxOrWolf) {
    // Sharp origami / geometric canine head
    ctx.beginPath();
    // Forehead
    ctx.moveTo(cx, cy - 30);
    // Left ear
    ctx.lineTo(cx - 130, cy - 150);
    ctx.lineTo(cx - 100, cy - 20);
    // Left cheek
    ctx.lineTo(cx - 170, cy + 40);
    ctx.lineTo(cx - 70, cy + 100);
    // Snout
    ctx.lineTo(cx, cy + 170);
    // Right cheek
    ctx.lineTo(cx + 70, cy + 100);
    ctx.lineTo(cx + 170, cy + 40);
    // Right ear
    ctx.lineTo(cx + 100, cy - 20);
    ctx.lineTo(cx + 130, cy - 150);
    ctx.closePath();
    ctx.fill();

    // Eye cuts
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx - 65, cy + 20);
    ctx.lineTo(cx - 30, cy + 35);
    ctx.lineTo(cx - 60, cy + 45);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + 65, cy + 20);
    ctx.lineTo(cx + 30, cy + 35);
    ctx.lineTo(cx + 60, cy + 45);
    ctx.closePath();
    ctx.fill();
  } else if (isAtom) {
    // Quantum orbits with nucleus
    ctx.lineWidth = 18;
    // Nucleus
    ctx.beginPath();
    ctx.arc(cx, cy, 40, 0, Math.PI * 2);
    ctx.fill();

    // 3 Elliptical orbits
    for (let i = 0; i < 3; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((i * Math.PI) / 3);
      ctx.beginPath();
      ctx.ellipse(0, 0, 170, 65, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  } else if (isRocket) {
    // Sleek space rocket
    ctx.beginPath();
    ctx.moveTo(cx, cy - 160);
    ctx.bezierCurveTo(cx + 60, cy - 80, cx + 65, cy + 60, cx + 55, cy + 120);
    // Right fin
    ctx.lineTo(cx + 130, cy + 150);
    ctx.lineTo(cx + 100, cy + 90);
    ctx.lineTo(cx + 50, cy + 85);
    // Bottom thruster
    ctx.lineTo(cx + 25, cy + 135);
    ctx.lineTo(cx - 25, cy + 135);
    // Left fin
    ctx.lineTo(cx - 50, cy + 85);
    ctx.lineTo(cx - 100, cy + 90);
    ctx.lineTo(cx - 130, cy + 150);
    ctx.lineTo(cx - 55, cy + 120);
    ctx.bezierCurveTo(cx - 65, cy + 60, cx - 60, cy - 80, cx, cy - 160);
    ctx.closePath();
    ctx.fill();

    // Rocket porthole window
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy - 30, 28, 0, Math.PI * 2);
    ctx.fill();
  } else if (isCrown) {
    // Minimal royal crown
    ctx.beginPath();
    ctx.moveTo(cx - 150, cy + 100);
    ctx.lineTo(cx - 170, cy - 70);
    ctx.lineTo(cx - 80, cy + 10);
    ctx.lineTo(cx, cy - 110);
    ctx.lineTo(cx + 80, cy + 10);
    ctx.lineTo(cx + 170, cy - 70);
    ctx.lineTo(cx + 150, cy + 100);
    ctx.closePath();
    ctx.fill();

    // Jewels
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy + 50, 20, 0, Math.PI * 2);
    ctx.arc(cx - 85, cy + 50, 16, 0, Math.PI * 2);
    ctx.arc(cx + 85, cy + 50, 16, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Abstract dynamic polygonal vortex / brand mark
    const points = 5 + Math.floor(rng() * 4);
    const radius = 140;
    ctx.beginPath();
    for (let i = 0; i < points * 2; i++) {
      const r = i % 2 === 0 ? radius : radius * 0.45;
      const angle = (i * Math.PI) / points - Math.PI / 2;
      const x = cx + Math.cos(angle) * r;
      const y = cy + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Center negative geometric cutout
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Style 2: App Icon (Modern rounded aesthetic with smooth glyph inside)
 */
function renderAppIconMotif(
  ctx: OffscreenCanvasRenderingContext2D,
  cx: number,
  cy: number,
  rng: () => number,
  prompt: string
) {
  // Squircle / rounded app frame
  const size = 320;
  const radius = 70;
  const x = cx - size / 2;
  const y = cy - size / 2;

  ctx.beginPath();
  ctx.roundRect(x, y, size, size, radius);
  ctx.fill();

  // White negative space glyph inside
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();

  if (prompt.includes('flame') || prompt.includes('fire')) {
    // Flame glyph
    ctx.moveTo(cx, cy + 90);
    ctx.bezierCurveTo(cx - 70, cy + 80, cx - 80, cy - 20, cx - 20, cy - 70);
    ctx.bezierCurveTo(cx - 10, cy - 30, cx + 30, cy - 50, cx, cy - 100);
    ctx.bezierCurveTo(cx + 70, cy - 70, cx + 80, cy + 30, cx, cy + 90);
    ctx.closePath();
    ctx.fill();
  } else if (prompt.includes('shield') || prompt.includes('security')) {
    // Shield glyph
    ctx.moveTo(cx, cy - 80);
    ctx.lineTo(cx + 65, cy - 50);
    ctx.lineTo(cx + 65, cy + 20);
    ctx.bezierCurveTo(cx + 65, cy + 65, cx, cy + 95, cx, cy + 95);
    ctx.bezierCurveTo(cx, cy + 95, cx - 65, cy + 65, cx - 65, cy + 20);
    ctx.lineTo(cx - 65, cy - 50);
    ctx.closePath();
    ctx.fill();
  } else {
    // Sleek geometric chevron / prism glyph
    ctx.moveTo(cx, cy - 70);
    ctx.lineTo(cx + 65, cy + 45);
    ctx.lineTo(cx + 35, cy + 55);
    ctx.lineTo(cx, cy - 10);
    ctx.lineTo(cx - 35, cy + 55);
    ctx.lineTo(cx - 65, cy + 45);
    ctx.closePath();
    ctx.fill();
  }
}

/**
 * Style 3: Monogram (Interlocking geometric letters or initials)
 */
function renderMonogramMotif(
  ctx: OffscreenCanvasRenderingContext2D,
  cx: number,
  cy: number,
  rng: () => number,
  prompt: string
) {
  ctx.lineWidth = 30;
  ctx.strokeStyle = '#0a0d18';

  // Interlocking diamond / hex framework
  ctx.beginPath();
  ctx.moveTo(cx, cy - 140);
  ctx.lineTo(cx + 120, cy - 40);
  ctx.lineTo(cx + 120, cy + 70);
  ctx.lineTo(cx, cy + 140);
  ctx.lineTo(cx - 120, cy + 70);
  ctx.lineTo(cx - 120, cy - 40);
  ctx.closePath();
  ctx.stroke();

  // Intersecting ribbons / monogram lines
  ctx.lineWidth = 22;
  ctx.beginPath();
  // V and F intersecting lines
  ctx.moveTo(cx - 70, cy - 60);
  ctx.lineTo(cx, cy + 60);
  ctx.lineTo(cx + 70, cy - 60);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 40, cy);
  ctx.lineTo(cx + 40, cy);
  ctx.stroke();
}

/**
 * Style 4: Geometric Badge (Stamp, seal, hexagonal border with sharp linework)
 */
function renderGeometricBadgeMotif(
  ctx: OffscreenCanvasRenderingContext2D,
  cx: number,
  cy: number,
  rng: () => number,
  prompt: string
) {
  // Hexagonal Badge Border
  const r = 160;
  ctx.lineWidth = 14;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Inner decorative ring
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 125, 0, Math.PI * 2);
  ctx.stroke();

  // Center Emblem Symbol (Lion/Star/Mountain/Lightning)
  if (prompt.includes('lightning') || prompt.includes('electric') || prompt.includes('energy')) {
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy - 90);
    ctx.lineTo(cx - 45, cy + 5);
    ctx.lineTo(cx - 5, cy + 5);
    ctx.lineTo(cx - 20, cy + 90);
    ctx.lineTo(cx + 45, cy - 10);
    ctx.lineTo(cx + 5, cy - 10);
    ctx.closePath();
    ctx.fill();
  } else if (prompt.includes('mountain') || prompt.includes('peak')) {
    ctx.beginPath();
    ctx.moveTo(cx - 85, cy + 60);
    ctx.lineTo(cx - 15, cy - 55);
    ctx.lineTo(cx + 25, cy);
    ctx.lineTo(cx + 60, cy - 40);
    ctx.lineTo(cx + 85, cy + 60);
    ctx.closePath();
    ctx.fill();
  } else {
    // Bold star emblem
    ctx.beginPath();
    const starPts = 5;
    for (let i = 0; i < starPts * 2; i++) {
      const radius = i % 2 === 0 ? 80 : 35;
      const angle = (i * Math.PI) / starPts - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  }
}
