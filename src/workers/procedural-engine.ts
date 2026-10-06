import type { GenerationParams, LogoStyle } from './rpc-protocol';

/**
 * Infinite Generative Logo Synthesis Engine (Worker Side)
 * Combines semantic prompt analysis with deterministic seeded PRNG
 * to generate infinite, visually unique vector logo marks and silhouettes.
 */

// Mulberry32 PRNG + helpers
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

/**
 * Deterministic string hash (FNV-1a 32-bit)
 */
function hashPrompt(str: string): number {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export async function generateProceduralLogo(params: GenerationParams): Promise<ImageBitmap> {
  const { prompt, style, seed } = params;
  const width = params.width || 512;
  const height = params.height || 512;

  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d')!;

  // Combine prompt text and numeric seed so BOTH affect generation
  const promptHash = hashPrompt(prompt.trim().toLowerCase());
  const combinedSeed = (promptHash ^ (seed * 2654435761)) >>> 0;
  const rng = new SeededRandom(combinedSeed);

  // 1. Fill crisp solid white background
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);

  // 2. Setup rendering state for dark mark
  ctx.fillStyle = '#0a0d18';
  ctx.strokeStyle = '#0a0d18';
  ctx.lineWidth = rng.range(12, 24);
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  const cx = width / 2;
  const cy = height / 2;
  const lowerPrompt = prompt.toLowerCase();

  ctx.save();

  // Dispatch based on semantic keyword match or style archetype
  renderGenerativeMotif(ctx, cx, cy, rng, lowerPrompt, style);

  ctx.restore();

  // Yield briefly
  await new Promise((r) => setTimeout(r, 20));

  return canvas.transferToImageBitmap();
}

/**
 * Master semantic dispatcher with infinite variations per seed
 */
function renderGenerativeMotif(
  ctx: OffscreenCanvasRenderingContext2D,
  cx: number,
  cy: number,
  rng: SeededRandom,
  prompt: string,
  style: LogoStyle
) {
  // Check semantic keywords
  if (prompt.includes('vectorforge') || prompt.includes('anvil') || prompt.includes('forge')) {
    renderVectorForgeGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('falcon') || prompt.includes('eagle') || prompt.includes('bird') || prompt.includes('hawk') || prompt.includes('phoenix')) {
    renderBirdGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('fox') || prompt.includes('wolf') || prompt.includes('canine') || prompt.includes('coyote') || prompt.includes('dog')) {
    renderCanineGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('cat') || prompt.includes('lion') || prompt.includes('tiger') || prompt.includes('panther') || prompt.includes('leopard')) {
    renderFelineGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('dragon') || prompt.includes('wyvern') || prompt.includes('serpent') || prompt.includes('snake')) {
    renderDragonGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('bear') || prompt.includes('bull') || prompt.includes('ram') || prompt.includes('stag') || prompt.includes('deer')) {
    renderHornedBeastGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('flame') || prompt.includes('fire') || prompt.includes('blaze') || prompt.includes('ember') || prompt.includes('burn')) {
    renderFlameGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('water') || prompt.includes('wave') || prompt.includes('drop') || prompt.includes('aqua') || prompt.includes('ocean')) {
    renderWaterWaveGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('mountain') || prompt.includes('peak') || prompt.includes('summit') || prompt.includes('alpine') || prompt.includes('rock')) {
    renderMountainGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('tree') || prompt.includes('leaf') || prompt.includes('plant') || prompt.includes('flower') || prompt.includes('lotus') || prompt.includes('flora')) {
    renderBotanicalGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('atom') || prompt.includes('quantum') || prompt.includes('orbit') || prompt.includes('nucleus') || prompt.includes('physics')) {
    renderQuantumGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('rocket') || prompt.includes('space') || prompt.includes('shuttle') || prompt.includes('cosmic') || prompt.includes('orbit')) {
    renderRocketGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('crown') || prompt.includes('king') || prompt.includes('royal') || prompt.includes('monarch') || prompt.includes('tiara')) {
    renderCrownGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('shield') || prompt.includes('security') || prompt.includes('guard') || prompt.includes('armor') || prompt.includes('protect')) {
    renderShieldGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('sword') || prompt.includes('blade') || prompt.includes('dagger') || prompt.includes('saber')) {
    renderSwordGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('lightning') || prompt.includes('electric') || prompt.includes('bolt') || prompt.includes('energy') || prompt.includes('flash') || prompt.includes('spark')) {
    renderLightningGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('diamond') || prompt.includes('crystal') || prompt.includes('gem') || prompt.includes('jewel') || prompt.includes('prism')) {
    renderCrystalGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('camera') || prompt.includes('lens') || prompt.includes('eye') || prompt.includes('aperture') || prompt.includes('vision') || prompt.includes('optical')) {
    renderEyeApertureGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('anchor') || prompt.includes('ship') || prompt.includes('marine') || prompt.includes('nautical')) {
    renderAnchorGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('coffee') || prompt.includes('cup') || prompt.includes('tea') || prompt.includes('mug') || prompt.includes('cafe')) {
    renderCoffeeGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('cube') || prompt.includes('box') || prompt.includes('hex') || prompt.includes('isometric')) {
    renderIsometricCubeGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('infinity') || prompt.includes('loop') || prompt.includes('mobius') || prompt.includes('ribbon')) {
    renderInfinityRibbonGenerative(ctx, cx, cy, rng);
  } else if (prompt.includes('circuit') || prompt.includes('chip') || prompt.includes('tech') || prompt.includes('cyber') || prompt.includes('neural')) {
    renderCircuitNetworkGenerative(ctx, cx, cy, rng);
  } else {
    // Style presets or free-form arbitrary prompt -> Infinite Parametric Synthesizers
    if (style === 'app-icon') {
      renderAppIconGenerative(ctx, cx, cy, rng);
    } else if (style === 'monogram') {
      renderMonogramGenerative(ctx, cx, cy, rng);
    } else if (style === 'geometric-badge') {
      renderGeometricBadgeGenerative(ctx, cx, cy, rng);
    } else {
      // Default: Universal Harmonic Radial & Origami Synthesizer
      renderUniversalHarmonicGenerative(ctx, cx, cy, rng);
    }
  }
}

/* ==========================================================================
   Motif Implementations (All parameterized by SeededRandom for infinite variety)
   ========================================================================== */

/** 1. VectorForge Brand Motif */
function renderVectorForgeGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const outerR = rng.range(155, 175);
  const borderThick = rng.range(12, 20);
  const anvilW = rng.range(190, 230);
  const anvilH = rng.range(38, 52);
  const hornCurve = rng.range(40, 75);
  const nodeD = rng.range(28, 44);

  // Outer Hex Badge
  ctx.lineWidth = borderThick;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 - Math.PI / 6;
    const x = cx + Math.cos(angle) * outerR;
    const y = cy + Math.sin(angle) * outerR;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Solid Anvil Body
  ctx.beginPath();
  ctx.moveTo(cx - anvilW / 2, cy - anvilH / 2);
  ctx.lineTo(cx + anvilW / 2 - 20, cy - anvilH / 2);
  ctx.bezierCurveTo(cx + anvilW / 2 + 15, cy - anvilH / 2, cx + anvilW / 2 + 35, cy - hornCurve / 2, cx + anvilW / 2 + hornCurve, cy - 10);
  ctx.lineTo(cx + anvilW / 2 - 10, cy + 10);
  ctx.lineTo(cx + 60, cy + 15);
  ctx.bezierCurveTo(cx + 45, cy + 40, cx + 55, cy + 65, cx + 80, cy + 85);
  ctx.lineTo(cx + 105, cy + 105);
  ctx.lineTo(cx - 105, cy + 105);
  ctx.lineTo(cx - 80, cy + 85);
  ctx.bezierCurveTo(cx - 55, cy + 65, cx - 45, cy + 40, cx - 60, cy + 15);
  ctx.lineTo(cx - anvilW / 2 - 15, cy + 10);
  ctx.lineTo(cx - anvilW / 2, cy - anvilH / 2);
  ctx.closePath();
  ctx.fill();

  // Center Vector Diamond Node
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx, cy - nodeD);
  ctx.lineTo(cx + nodeD, cy);
  ctx.lineTo(cx, cy + nodeD);
  ctx.lineTo(cx - nodeD, cy);
  ctx.closePath();
  ctx.fill();

  // Anchor Pin
  ctx.fillStyle = '#0a0d18';
  ctx.beginPath();
  ctx.arc(cx, cy, nodeD * 0.35, 0, Math.PI * 2);
  ctx.fill();

  // Horizontal Alignment Cutout
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - anvilW * 0.38, cy + 50, anvilW * 0.76, 7);
}

/** 2. Falcon / Eagle / Bird Motif */
function renderBirdGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const wingSpan = rng.range(180, 230);
  const wingHeight = rng.range(90, 150);
  const headY = rng.range(cy - 160, cy - 130);
  const featherSteps = rng.int(2, 4);

  ctx.beginPath();
  ctx.moveTo(cx, headY);
  // Left Wing Arch
  ctx.bezierCurveTo(cx - 80, headY + 10, cx - wingSpan * 0.8, cy - 40, cx - wingSpan, cy + wingHeight * 0.5);
  for (let i = 0; i < featherSteps; i++) {
    const fRatio = (i + 1) / featherSteps;
    ctx.lineTo(cx - wingSpan * (1 - fRatio * 0.6), cy + wingHeight * 0.4 + i * 20);
    ctx.lineTo(cx - wingSpan * (1 - (fRatio + 0.1) * 0.6), cy + wingHeight * 0.2 + i * 15);
  }
  ctx.lineTo(cx - 35, cy + 120);
  // Tail
  ctx.lineTo(cx, cy + rng.range(150, 180));
  // Right Wing
  ctx.lineTo(cx + 35, cy + 120);
  for (let i = featherSteps - 1; i >= 0; i--) {
    const fRatio = (i + 1) / featherSteps;
    ctx.lineTo(cx + wingSpan * (1 - (fRatio + 0.1) * 0.6), cy + wingHeight * 0.2 + i * 15);
    ctx.lineTo(cx + wingSpan * (1 - fRatio * 0.6), cy + wingHeight * 0.4 + i * 20);
  }
  ctx.bezierCurveTo(cx + wingSpan * 0.8, cy - 40, cx + 80, headY + 10, cx, headY);
  ctx.closePath();
  ctx.fill();

  // Chest & Beak Negative Cut
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx, headY + rng.range(50, 70));
  ctx.lineTo(cx - rng.range(20, 35), cy + 40);
  ctx.lineTo(cx, cy + rng.range(75, 95));
  ctx.lineTo(cx + rng.range(20, 35), cy + 40);
  ctx.closePath();
  ctx.fill();
}

/** 3. Fox / Wolf / Canine Motif */
function renderCanineGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const earW = rng.range(110, 150);
  const earH = rng.range(140, 180);
  const cheekW = rng.range(150, 190);
  const snoutY = rng.range(cy + 140, cy + 180);
  const isAngular = rng.bool(0.7);

  ctx.beginPath();
  ctx.moveTo(cx, cy - rng.range(30, 50));
  // Left Ear
  ctx.lineTo(cx - earW, cy - earH);
  ctx.lineTo(cx - earW * 0.7, cy - 20);
  // Left Cheek
  ctx.lineTo(cx - cheekW, cy + 40);
  ctx.lineTo(cx - cheekW * 0.45, cy + 100);
  // Snout
  ctx.lineTo(cx, snoutY);
  // Right Cheek
  ctx.lineTo(cx + cheekW * 0.45, cy + 100);
  ctx.lineTo(cx + cheekW, cy + 40);
  // Right Ear
  ctx.lineTo(cx + earW * 0.7, cy - 20);
  ctx.lineTo(cx + earW, cy - earH);
  ctx.closePath();
  ctx.fill();

  // Slanted Eyes Cutouts
  ctx.fillStyle = '#ffffff';
  const eyeX = rng.range(40, 60);
  const eyeY = rng.range(10, 35);
  const eyeL = rng.range(25, 38);

  ctx.beginPath();
  ctx.moveTo(cx - eyeX, cy + eyeY);
  ctx.lineTo(cx - eyeX + eyeL, cy + eyeY + 12);
  ctx.lineTo(cx - eyeX + 8, cy + eyeY + 18);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx + eyeX, cy + eyeY);
  ctx.lineTo(cx + eyeX - eyeL, cy + eyeY + 12);
  ctx.lineTo(cx + eyeX - 8, cy + eyeY + 18);
  ctx.closePath();
  ctx.fill();

  // Forehead Geometric Inset
  if (isAngular) {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 10);
    ctx.lineTo(cx - 16, cy + 30);
    ctx.lineTo(cx, cy + 50);
    ctx.lineTo(cx + 16, cy + 30);
    ctx.closePath();
    ctx.fill();
  }
}

/** 4. Lion / Tiger / Feline Motif */
function renderFelineGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const r = rng.range(130, 160);
  const manePts = rng.int(8, 14);

  // Mane Spikes
  ctx.beginPath();
  for (let i = 0; i < manePts * 2; i++) {
    const rad = i % 2 === 0 ? r : r * rng.range(0.65, 0.78);
    const angle = (i * Math.PI) / manePts - Math.PI / 2;
    const x = cx + Math.cos(angle) * rad;
    const y = cy + Math.sin(angle) * rad;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Face Silhouette Cutout
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 10, r * 0.55, r * 0.6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Inner Dark Muzzle & Ears
  ctx.fillStyle = '#0a0d18';
  ctx.beginPath();
  // Left ear
  ctx.arc(cx - r * 0.35, cy - r * 0.38, 18, 0, Math.PI * 2);
  // Right ear
  ctx.arc(cx + r * 0.35, cy - r * 0.38, 18, 0, Math.PI * 2);
  ctx.fill();

  // Nose / Muzzle
  ctx.beginPath();
  ctx.moveTo(cx - 20, cy + 20);
  ctx.lineTo(cx + 20, cy + 20);
  ctx.lineTo(cx, cy + 45);
  ctx.closePath();
  ctx.fill();
}

/** 5. Dragon / Serpent Motif */
function renderDragonGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const hornLen = rng.range(120, 170);
  const snoutLen = rng.range(90, 130);

  ctx.beginPath();
  ctx.moveTo(cx - 20, cy - 30);
  // Crest Horns
  ctx.bezierCurveTo(cx - 60, cy - 100, cx - hornLen, cy - 80, cx - hornLen - 20, cy - 150);
  ctx.bezierCurveTo(cx - 50, cy - 60, cx - 20, cy - 40, cx, cy - 60);
  ctx.bezierCurveTo(cx + 20, cy - 40, cx + 50, cy - 60, cx + hornLen + 20, cy - 150);
  ctx.bezierCurveTo(cx + hornLen, cy - 80, cx + 60, cy - 100, cx + 20, cy - 30);
  // Jaws
  ctx.lineTo(cx + snoutLen, cy + 30);
  ctx.lineTo(cx + snoutLen * 0.5, cy + 50);
  ctx.lineTo(cx + snoutLen * 0.7, cy + 90);
  ctx.lineTo(cx, cy + 150);
  ctx.lineTo(cx - snoutLen * 0.7, cy + 90);
  ctx.lineTo(cx - snoutLen * 0.5, cy + 50);
  ctx.lineTo(cx - snoutLen, cy + 30);
  ctx.closePath();
  ctx.fill();

  // Eye Cutouts
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - 35, cy, 14, 0, Math.PI * 2);
  ctx.arc(cx + 35, cy, 14, 0, Math.PI * 2);
  ctx.fill();
}

/** 6. Horned Beast / Stag / Bull Motif */
function renderHornedBeastGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const hornSpread = rng.range(130, 180);
  const hornHeight = rng.range(120, 170);

  ctx.beginPath();
  // Horns
  ctx.moveTo(cx - 30, cy - 20);
  ctx.bezierCurveTo(cx - 90, cy - 80, cx - hornSpread, cy - 20, cx - hornSpread, cy - hornHeight);
  ctx.bezierCurveTo(cx - hornSpread * 0.6, cy - 60, cx - 50, cy - 20, cx - 25, cy + 10);
  // Head
  ctx.lineTo(cx - 55, cy + 80);
  ctx.lineTo(cx, cy + 140);
  ctx.lineTo(cx + 55, cy + 80);
  ctx.lineTo(cx + 25, cy + 10);
  // Right Horn
  ctx.bezierCurveTo(cx + 50, cy - 20, cx + hornSpread * 0.6, cy - 60, cx + hornSpread, cy - hornHeight);
  ctx.bezierCurveTo(cx + hornSpread, cy - 20, cx + 90, cy - 80, cx + 30, cy - 20);
  ctx.closePath();
  ctx.fill();
}

/** 7. Flame / Fire Motif */
function renderFlameGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const h = rng.range(140, 180);
  const w = rng.range(90, 130);

  ctx.beginPath();
  ctx.moveTo(cx, cy + h);
  ctx.bezierCurveTo(cx - w * 1.2, cy + h * 0.8, cx - w * 1.3, cy - 20, cx - w * 0.3, cy - h * 0.7);
  ctx.bezierCurveTo(cx - w * 0.2, cy - h * 0.3, cx + w * 0.4, cy - h * 0.4, cx, cy - h);
  ctx.bezierCurveTo(cx + w * 1.2, cy - h * 0.6, cx + w * 1.4, cy + 20, cx, cy + h);
  ctx.closePath();
  ctx.fill();

  // Inner Flame Cutout
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx, cy + h * 0.7);
  ctx.bezierCurveTo(cx - w * 0.6, cy + h * 0.5, cx - w * 0.6, cy + 10, cx, cy - h * 0.3);
  ctx.bezierCurveTo(cx + w * 0.6, cy + 10, cx + w * 0.6, cy + h * 0.5, cx, cy + h * 0.7);
  ctx.closePath();
  ctx.fill();
}

/** 8. Water / Wave Motif */
function renderWaterWaveGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const isDroplet = rng.bool(0.5);

  if (isDroplet) {
    // Teardrop with internal ripple
    const r = rng.range(100, 130);
    ctx.beginPath();
    ctx.moveTo(cx, cy - r * 1.3);
    ctx.bezierCurveTo(cx - r * 1.4, cy, cx - r * 1.2, cy + r, cx, cy + r);
    ctx.bezierCurveTo(cx + r * 1.2, cy + r, cx + r * 1.4, cy, cx, cy - r * 1.3);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy + r * 0.25, r * 0.45, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Crashing Hokusai Wave Arc
    ctx.lineWidth = rng.range(22, 34);
    ctx.beginPath();
    ctx.arc(cx, cy, 130, Math.PI * 0.3, Math.PI * 1.7);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx - 30, cy + 10, 80, Math.PI * 0.5, Math.PI * 1.9);
    ctx.stroke();
  }
}

/** 9. Mountain / Summit Motif */
function renderMountainGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const w = rng.range(160, 200);
  const peakY = rng.range(cy - 140, cy - 100);
  const subPeakY = peakY + rng.range(30, 60);

  // Main Peaks
  ctx.beginPath();
  ctx.moveTo(cx - w, cy + 100);
  ctx.lineTo(cx - w * 0.35, subPeakY);
  ctx.lineTo(cx, peakY);
  ctx.lineTo(cx + w * 0.45, subPeakY + 20);
  ctx.lineTo(cx + w, cy + 100);
  ctx.closePath();
  ctx.fill();

  // Snowcap Cutouts
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx, peakY);
  ctx.lineTo(cx - 28, peakY + 50);
  ctx.lineTo(cx - 10, peakY + 42);
  ctx.lineTo(cx + 8, peakY + 52);
  ctx.lineTo(cx + 26, peakY + 45);
  ctx.closePath();
  ctx.fill();
}

/** 10. Botanical / Flower / Leaf Motif */
function renderBotanicalGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const petals = rng.int(4, 8);
  const petalLen = rng.range(110, 150);
  const petalW = rng.range(35, 60);

  for (let i = 0; i < petals; i++) {
    const angle = (i * Math.PI * 2) / petals;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-petalW, -petalLen * 0.4, -petalW * 0.7, -petalLen, 0, -petalLen);
    ctx.bezierCurveTo(petalW * 0.7, -petalLen, petalW, -petalLen * 0.4, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // Center Cutout
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy, rng.range(25, 45), 0, Math.PI * 2);
  ctx.fill();
}

/** 11. Quantum / Atom Motif */
function renderQuantumGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const orbits = rng.int(2, 4);
  const coreR = rng.range(30, 48);
  ctx.lineWidth = rng.range(14, 22);

  // Nucleus
  ctx.beginPath();
  ctx.arc(cx, cy, coreR, 0, Math.PI * 2);
  ctx.fill();

  // Elliptical Orbits
  for (let i = 0; i < orbits; i++) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((i * Math.PI) / orbits + rng.range(-0.1, 0.1));
    ctx.beginPath();
    ctx.ellipse(0, 0, rng.range(150, 180), rng.range(55, 75), 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

/** 12. Rocket / Spacecraft Motif */
function renderRocketGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const noseY = rng.range(cy - 170, cy - 140);
  const bodyW = rng.range(45, 65);
  const finW = rng.range(100, 140);

  ctx.beginPath();
  ctx.moveTo(cx, noseY);
  ctx.bezierCurveTo(cx + bodyW, noseY + 60, cx + bodyW, cy + 70, cx + bodyW * 0.8, cy + 110);
  ctx.lineTo(cx + finW, cy + 150);
  ctx.lineTo(cx + finW * 0.7, cy + 90);
  ctx.lineTo(cx + bodyW * 0.5, cy + 85);
  ctx.lineTo(cx + 20, cy + 130);
  ctx.lineTo(cx - 20, cy + 130);
  ctx.lineTo(cx - bodyW * 0.5, cy + 85);
  ctx.lineTo(cx - finW * 0.7, cy + 90);
  ctx.lineTo(cx - finW, cy + 150);
  ctx.lineTo(cx - bodyW * 0.8, cy + 110);
  ctx.bezierCurveTo(cx - bodyW, cy + 70, cx - bodyW, noseY + 60, cx, noseY);
  ctx.closePath();
  ctx.fill();

  // Window Cutout
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx, cy - 25, rng.range(22, 32), 0, Math.PI * 2);
  ctx.fill();
}

/** 13. Crown / Crest Motif */
function renderCrownGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const peaks = rng.int(3, 5);
  const crownW = rng.range(130, 160);
  const crownH = rng.range(80, 120);

  ctx.beginPath();
  ctx.moveTo(cx - crownW, cy + 80);
  for (let i = 0; i < peaks; i++) {
    const ratio = i / (peaks - 1);
    const px = cx - crownW + ratio * (crownW * 2);
    const py = (i === 0 || i === peaks - 1) ? cy - crownH * 0.7 : cy - crownH;
    ctx.lineTo(px, py);
    if (i < peaks - 1) {
      const midRatio = (i + 0.5) / (peaks - 1);
      ctx.lineTo(cx - crownW + midRatio * (crownW * 2), cy + 10);
    }
  }
  ctx.lineTo(cx + crownW, cy + 80);
  ctx.closePath();
  ctx.fill();

  // Jewels
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < peaks; i++) {
    const ratio = i / (peaks - 1);
    const px = cx - crownW + ratio * (crownW * 2);
    ctx.beginPath();
    ctx.arc(px, cy + 45, rng.range(12, 18), 0, Math.PI * 2);
    ctx.fill();
  }
}

/** 14. Shield / Defense Motif */
function renderShieldGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const w = rng.range(120, 150);
  const h = rng.range(130, 160);

  ctx.beginPath();
  ctx.moveTo(cx, cy - h);
  ctx.lineTo(cx + w, cy - h * 0.75);
  ctx.lineTo(cx + w, cy + 10);
  ctx.bezierCurveTo(cx + w, cy + h * 0.6, cx, cy + h, cx, cy + h);
  ctx.bezierCurveTo(cx, cy + h, cx - w, cy + h * 0.6, cx - w, cy + 10);
  ctx.lineTo(cx - w, cy - h * 0.75);
  ctx.closePath();
  ctx.fill();

  // Inset Emblem Cutout (Star, Cross, or Chevron)
  ctx.fillStyle = '#ffffff';
  const inset = rng.pick(['star', 'chevron', 'cross']);
  if (inset === 'star') {
    renderStarPath(ctx, cx, cy, 5, 55, 25);
  } else if (inset === 'chevron') {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 30);
    ctx.lineTo(cx + 45, cy + 15);
    ctx.lineTo(cx + 25, cy + 30);
    ctx.lineTo(cx, cy + 5);
    ctx.lineTo(cx - 25, cy + 30);
    ctx.lineTo(cx - 45, cy + 15);
    ctx.closePath();
    ctx.fill();
  } else {
    // Cross
    ctx.fillRect(cx - 15, cy - 60, 30, 120);
    ctx.fillRect(cx - 50, cy - 25, 100, 30);
  }
}

/** 15. Sword / Blade Motif */
function renderSwordGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const bladeL = rng.range(150, 190);
  const guardW = rng.range(65, 95);

  ctx.beginPath();
  // Blade tip
  ctx.moveTo(cx, cy - bladeL);
  ctx.lineTo(cx + 22, cy - bladeL + 40);
  ctx.lineTo(cx + 22, cy + 50);
  // Guard
  ctx.lineTo(cx + guardW, cy + 55);
  ctx.lineTo(cx + guardW, cy + 72);
  ctx.lineTo(cx + 14, cy + 72);
  // Handle & Pommel
  ctx.lineTo(cx + 12, cy + 130);
  ctx.arc(cx, cy + 140, 16, 0, Math.PI * 2);
  ctx.lineTo(cx - 12, cy + 130);
  ctx.lineTo(cx - 14, cy + 72);
  ctx.lineTo(cx - guardW, cy + 72);
  ctx.lineTo(cx - guardW, cy + 55);
  ctx.lineTo(cx - 22, cy + 50);
  ctx.lineTo(cx - 22, cy - bladeL + 40);
  ctx.closePath();
  ctx.fill();

  // Fuller slit
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 4, cy - bladeL + 60, 8, bladeL - 20);
}

/** 16. Lightning / Energy Motif */
function renderLightningGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const w = rng.range(70, 110);
  const h = rng.range(140, 180);

  ctx.beginPath();
  ctx.moveTo(cx + rng.range(10, 30), cy - h);
  ctx.lineTo(cx - w * 0.8, cy + 10);
  ctx.lineTo(cx - 10, cy + 10);
  ctx.lineTo(cx - rng.range(25, 45), cy + h);
  ctx.lineTo(cx + w * 0.8, cy - 10);
  ctx.lineTo(cx + 10, cy - 10);
  ctx.closePath();
  ctx.fill();
}

/** 17. Crystal / Diamond Motif */
function renderCrystalGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const w = rng.range(110, 150);
  const topH = rng.range(40, 60);
  const botH = rng.range(90, 130);

  ctx.beginPath();
  ctx.moveTo(cx - w * 0.6, cy - topH);
  ctx.lineTo(cx + w * 0.6, cy - topH);
  ctx.lineTo(cx + w, cy);
  ctx.lineTo(cx, cy + botH);
  ctx.lineTo(cx - w, cy);
  ctx.closePath();
  ctx.fill();

  // Facet Lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(cx - w, cy);
  ctx.lineTo(cx + w, cy);
  ctx.moveTo(cx - w * 0.6, cy - topH);
  ctx.lineTo(cx, cy + botH);
  ctx.moveTo(cx + w * 0.6, cy - topH);
  ctx.lineTo(cx, cy + botH);
  ctx.stroke();
}

/** 18. Eye / Aperture / Lens Motif */
function renderEyeApertureGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const isAperture = rng.bool(0.5);

  if (isAperture) {
    const blades = rng.int(6, 8);
    const r = rng.range(120, 150);
    ctx.lineWidth = 14;

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.stroke();

    for (let i = 0; i < blades; i++) {
      const angle = (i * Math.PI * 2) / blades;
      const x0 = cx + Math.cos(angle) * r;
      const y0 = cy + Math.sin(angle) * r;
      const x1 = cx + Math.cos(angle + 1.2) * (r * 0.4);
      const y1 = cy + Math.sin(angle + 1.2) * (r * 0.4);
      ctx.beginPath();
      ctx.moveTo(x0, y0);
      ctx.lineTo(x1, y1);
      ctx.stroke();
    }
  } else {
    // Stylized Eye
    const w = rng.range(140, 180);
    ctx.beginPath();
    ctx.moveTo(cx - w, cy);
    ctx.bezierCurveTo(cx - w * 0.5, cy - 90, cx + w * 0.5, cy - 90, cx + w, cy);
    ctx.bezierCurveTo(cx + w * 0.5, cy + 90, cx - w * 0.5, cy + 90, cx - w, cy);
    ctx.closePath();
    ctx.fill();

    // Pupil
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx, cy, 45, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#0a0d18';
    ctx.beginPath();
    ctx.arc(cx, cy, 22, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** 19. Anchor Motif */
function renderAnchorGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const armR = rng.range(110, 140);
  ctx.lineWidth = rng.range(22, 30);

  // Central Shank
  ctx.beginPath();
  ctx.moveTo(cx, cy - 110);
  ctx.lineTo(cx, cy + 110);
  ctx.stroke();

  // Crossbar
  ctx.beginPath();
  ctx.moveTo(cx - 70, cy - 40);
  ctx.lineTo(cx + 70, cy - 40);
  ctx.stroke();

  // Top Ring
  ctx.beginPath();
  ctx.arc(cx, cy - 125, 24, 0, Math.PI * 2);
  ctx.stroke();

  // Bottom Fluke Arc
  ctx.beginPath();
  ctx.arc(cx, cy + 50, armR, Math.PI * 0.15, Math.PI * 0.85);
  ctx.stroke();
}

/** 20. Coffee / Cup Motif */
function renderCoffeeGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const w = rng.range(80, 110);
  const h = rng.range(70, 95);

  ctx.beginPath();
  ctx.moveTo(cx - w, cy - 20);
  ctx.lineTo(cx + w, cy - 20);
  ctx.bezierCurveTo(cx + w, cy + h, cx - w, cy + h, cx - w, cy - 20);
  ctx.closePath();
  ctx.fill();

  // Cup Handle
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.arc(cx + w + 12, cy + 15, 32, -Math.PI * 0.4, Math.PI * 0.5);
  ctx.stroke();

  // Steam Ribbons
  ctx.lineWidth = 10;
  for (let i = -1; i <= 1; i++) {
    const sx = cx + i * 35;
    ctx.beginPath();
    ctx.moveTo(sx, cy - 40);
    ctx.bezierCurveTo(sx + 15, cy - 65, sx - 15, cy - 90, sx, cy - 120);
    ctx.stroke();
  }
}

/** 21. Isometric Cube Motif */
function renderIsometricCubeGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const size = rng.range(120, 150);
  const ang = Math.PI / 6;

  // Hexagon outline
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3 - ang;
    const x = cx + Math.cos(a) * size;
    const y = cy + Math.sin(a) * size;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();

  // Isometric Y Cutout Lines
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx, cy + size);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx - Math.cos(ang) * size, cy - Math.sin(ang) * size);
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + Math.cos(ang) * size, cy - Math.sin(ang) * size);
  ctx.stroke();
}

/** 22. Infinity / Mobius Loop Motif */
function renderInfinityRibbonGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const w = rng.range(130, 160);
  const h = rng.range(60, 90);
  ctx.lineWidth = rng.range(26, 36);

  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.bezierCurveTo(cx + w * 0.5, cy - h, cx + w, cy - h * 0.5, cx + w, cy);
  ctx.bezierCurveTo(cx + w, cy + h * 0.5, cx + w * 0.5, cy + h, cx, cy);
  ctx.bezierCurveTo(cx - w * 0.5, cy - h, cx - w, cy - h * 0.5, cx - w, cy);
  ctx.bezierCurveTo(cx - w, cy + h * 0.5, cx - w * 0.5, cy + h, cx, cy);
  ctx.stroke();
}

/** 23. Circuit / Cyber Network Motif */
function renderCircuitNetworkGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const count = rng.int(6, 10);
  ctx.lineWidth = 12;

  // Center Processor Chip
  ctx.fillRect(cx - 50, cy - 50, 100, 100);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(cx - 30, cy - 30, 60, 60);

  // Circuit Bus Lines
  ctx.strokeStyle = '#0a0d18';
  ctx.fillStyle = '#0a0d18';
  for (let i = 0; i < count; i++) {
    const angle = (i * Math.PI * 2) / count;
    const len1 = rng.range(75, 110);
    const len2 = rng.range(130, 170);
    const x0 = cx + Math.cos(angle) * 50;
    const y0 = cy + Math.sin(angle) * 50;
    const x1 = cx + Math.cos(angle) * len1;
    const y1 = cy + Math.sin(angle) * len1;
    const x2 = cx + Math.cos(angle + 0.3) * len2;
    const y2 = cy + Math.sin(angle + 0.3) * len2;

    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    // Node Terminal
    ctx.beginPath();
    ctx.arc(x2, y2, 10, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** 24. Parametric App Icon Style */
function renderAppIconGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const size = rng.range(290, 330);
  const radius = rng.range(55, 80);
  const x = cx - size / 2;
  const y = cy - size / 2;

  ctx.beginPath();
  ctx.roundRect(x, y, size, size, radius);
  ctx.fill();

  // Procedural Glyph Cutout
  ctx.fillStyle = '#ffffff';
  const glyphType = rng.int(0, 3);
  if (glyphType === 0) {
    // Dynamic Chevron Prism
    ctx.beginPath();
    ctx.moveTo(cx, cy - 75);
    ctx.lineTo(cx + 70, cy + 45);
    ctx.lineTo(cx + 35, cy + 55);
    ctx.lineTo(cx, cy - 10);
    ctx.lineTo(cx - 35, cy + 55);
    ctx.lineTo(cx - 70, cy + 45);
    ctx.closePath();
    ctx.fill();
  } else if (glyphType === 1) {
    // Intersecting Arcs
    ctx.beginPath();
    ctx.arc(cx - 20, cy, 55, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx + 20, cy, 55, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Bold Monogram Initial Icon
    ctx.font = '900 160px "Space Grotesk", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const char = rng.pick(['V', 'X', 'A', 'N', 'Z', 'M', 'K', 'Q']);
    ctx.fillText(char, cx, cy);
  }
}

/** 25. Parametric Monogram Style */
function renderMonogramGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const outerR = rng.range(130, 160);
  const sides = rng.pick([4, 6, 8]);
  ctx.lineWidth = rng.range(20, 30);

  // Outer Geometric Matrix
  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i * Math.PI * 2) / sides - Math.PI / 2;
    const x = cx + Math.cos(angle) * outerR;
    const y = cy + Math.sin(angle) * outerR;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Interlocking Monogram Geometry
  ctx.lineWidth = rng.range(18, 24);
  const w = outerR * 0.6;
  ctx.beginPath();
  ctx.moveTo(cx - w, cy - w * 0.8);
  ctx.lineTo(cx, cy + w * 0.8);
  ctx.lineTo(cx + w, cy - w * 0.8);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - w * 0.6, cy);
  ctx.lineTo(cx + w * 0.6, cy);
  ctx.stroke();
}

/** 26. Parametric Geometric Badge Style */
function renderGeometricBadgeGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const r = rng.range(145, 175);
  const sides = rng.pick([6, 8, 12]);
  ctx.lineWidth = rng.range(12, 18);

  ctx.beginPath();
  for (let i = 0; i < sides; i++) {
    const angle = (i * Math.PI * 2) / sides - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.stroke();

  // Inner Ring
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();

  // Center Emblem
  const centerSymbol = rng.pick(['star', 'diamond', 'bolt']);
  if (centerSymbol === 'star') {
    renderStarPath(ctx, cx, cy, rng.int(4, 8), r * 0.5, r * 0.22);
  } else if (centerSymbol === 'diamond') {
    const d = r * 0.45;
    ctx.beginPath();
    ctx.moveTo(cx, cy - d);
    ctx.lineTo(cx + d, cy);
    ctx.lineTo(cx, cy + d);
    ctx.lineTo(cx - d, cy);
    ctx.closePath();
    ctx.fill();
  } else {
    renderLightningGenerative(ctx, cx, cy, rng);
  }
}

/** 27. Universal Harmonic Radial & Origami Synthesizer (Infinite Mathematical Variety) */
function renderUniversalHarmonicGenerative(ctx: OffscreenCanvasRenderingContext2D, cx: number, cy: number, rng: SeededRandom) {
  const symmetry = rng.pick([3, 4, 5, 6, 7, 8, 10, 12]);
  const baseR = rng.range(110, 150);
  const harmonicsCount = rng.int(2, 4);
  const isSolid = rng.bool(0.65);

  const freq1 = rng.int(1, 3);
  const amp1 = rng.range(20, 50);
  const freq2 = rng.int(2, 6);
  const amp2 = rng.range(15, 35);

  ctx.beginPath();
  const samples = symmetry * 36;
  for (let i = 0; i <= samples; i++) {
    const theta = (i * Math.PI * 2) / samples;
    const modR = baseR + Math.sin(theta * symmetry * freq1) * amp1 + Math.cos(theta * freq2) * amp2;
    const x = cx + Math.cos(theta) * modR;
    const y = cy + Math.sin(theta) * modR;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();

  if (isSolid) {
    ctx.fill();
    // Negative Space Geometric Core
    ctx.fillStyle = '#ffffff';
    const coreSides = rng.pick([3, 4, 5, 6, 8]);
    const coreR = rng.range(35, 65);
    ctx.beginPath();
    for (let i = 0; i < coreSides; i++) {
      const a = (i * Math.PI * 2) / coreSides - Math.PI / 2;
      const x = cx + Math.cos(a) * coreR;
      const y = cy + Math.sin(a) * coreR;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();
  } else {
    ctx.lineWidth = rng.range(18, 28);
    ctx.stroke();
    // Center Accent
    ctx.beginPath();
    ctx.arc(cx, cy, rng.range(25, 45), 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Helper: Draw parametric star path */
function renderStarPath(
  ctx: OffscreenCanvasRenderingContext2D,
  cx: number,
  cy: number,
  points: number,
  outerR: number,
  innerR: number
) {
  ctx.beginPath();
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (i * Math.PI) / points - Math.PI / 2;
    const x = cx + Math.cos(angle) * r;
    const y = cy + Math.sin(angle) * r;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}
