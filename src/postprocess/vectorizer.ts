import { 
  getSVG, 
  imageDataToBitmap, 
  traceBitmap,
  type PotraceOptions,
  type TurnPolicy,
} from './potrace';

export interface VectorizerOptions {
  colorHex?: string;
  turdsize?: number;
  optcurve?: boolean;
  alphamax?: number;
  opttolerance?: number;
  turnpolicy?: TurnPolicy;
  scale?: number;
}

export interface VectorizationResult {
  svgString: string;
  pathCount: number;
  traceTimeMs: number;
  width: number;
  height: number;
}

/**
 * Traces binarized ImageData into an infinite-resolution SVG vector string
 */
export async function vectorizeImageData(
  imageData: ImageData,
  options: VectorizerOptions = {}
): Promise<VectorizationResult> {
  const startTime = performance.now();
  const color = options.colorHex || '#6366f1';
  const turdsize = options.turdsize ?? 3;
  const optcurve = options.optcurve ?? true;
  const alphamax = options.alphamax ?? 1.0;
  const opttolerance = options.opttolerance ?? 0.2;
  const turnpolicy = options.turnpolicy || 'black';

  const potraceOpts: Partial<PotraceOptions> = {
    turdsize,
    optcurve,
    alphamax,
    opttolerance,
    turnpolicy,
  };

  // Convert and trace bitmap
  const bitmap = imageDataToBitmap(imageData, 128);
  const paths = traceBitmap(bitmap, potraceOpts);

  // Generate SVG string
  const rawSvg = getSVG(paths, options.scale || 1);

  // Normalize SVG with proper viewBox and fill styling
  const svgString = formatAndRecolorSvg(rawSvg, color, imageData.width, imageData.height);
  const traceTimeMs = Math.round(performance.now() - startTime);

  return {
    svgString,
    pathCount: paths.length,
    traceTimeMs,
    width: imageData.width,
    height: imageData.height,
  };
}

/**
 * Normalizes SVG markup with standardized viewBox, dimensions, and fill color
 */
export function formatAndRecolorSvg(
  svgString: string,
  colorHex: string,
  width: number = 512,
  height: number = 512
): string {
  // If SVG already contains paths, update their fill or wrap cleanly
  let formatted = svgString;

  // Ensure fill color is applied
  if (!formatted.includes('fill=')) {
    formatted = formatted.replace(/<path\s/gi, `<path fill="${colorHex}" `);
  } else {
    // Replace existing fill attributes
    formatted = formatted.replace(/fill="[^"]*"/gi, `fill="${colorHex}"`);
  }

  // Ensure correct viewBox and width/height
  if (!formatted.includes('viewBox')) {
    formatted = formatted.replace(
      /<svg([^>]*)>/i,
      `<svg viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" $1>`
    );
  } else {
    // Standardize xmlns if missing
    if (!formatted.includes('xmlns=')) {
      formatted = formatted.replace(/<svg\s/i, '<svg xmlns="http://www.w3.org/2000/svg" ');
    }
  }

  return formatted;
}

/**
 * Re-colors an existing SVG string instantaneously without re-tracing
 */
export function recolorSvg(svgString: string, newColorHex: string): string {
  // Replace fill on all path elements
  let recolored = svgString.replace(/fill="[^"]*"/gi, `fill="${newColorHex}"`);

  // Also replace fill in root svg if present
  if (recolored.includes('fill="#') || recolored.includes('fill="rgb')) {
    return recolored;
  }

  // If no fill was replaced, add fill to paths
  return recolored.replace(/<path\s+/gi, `<path fill="${newColorHex}" `);
}
