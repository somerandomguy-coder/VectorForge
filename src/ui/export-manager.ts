import confetti from 'canvas-confetti';

/**
 * Multi-Format Export Engine
 * Handles SVG, high-res transparent PNGs, and multi-resolution .ICO Favicons.
 */

/**
 * Downloads a raw SVG string as a file
 */
export function downloadSvgFile(svgContent: string, filename: string = 'vectorforge-logo.svg'): void {
  const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
  triggerDownload(blob, filename);
}

/**
 * Converts an SVG string to a transparent PNG at specified resolution and downloads it
 */
export async function downloadPngFromSvg(
  svgContent: string,
  width: number = 512,
  height: number = 512,
  filename: string = 'vectorforge-logo.png'
): Promise<void> {
  const blob = await renderSvgToPngBlob(svgContent, width, height);
  triggerDownload(blob, filename);
}

/**
 * Helper to rasterize an SVG to PNG Blob using Canvas
 */
export async function renderSvgToPngBlob(
  svgContent: string,
  width: number,
  height: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, width, height);
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Canvas PNG conversion failed'));
      }, 'image/png');
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load SVG into image element'));
    };

    img.src = url;
  });
}

/**
 * Generates and downloads a multi-resolution Favicon (.ICO)
 * Contains 16x16, 32x32, and 48x48 icon frames in standard ICO format.
 */
export async function downloadFaviconIco(
  svgContent: string,
  filename: string = 'favicon.ico'
): Promise<void> {
  const sizes = [16, 32, 48];
  const pngBlobs: Blob[] = [];

  for (const size of sizes) {
    const blob = await renderSvgToPngBlob(svgContent, size, size);
    pngBlobs.push(blob);
  }

  const pngBuffers = await Promise.all(pngBlobs.map((b) => b.arrayBuffer()));
  const icoBlob = buildIcoBlob(sizes, pngBuffers);
  triggerDownload(icoBlob, filename);
}

/**
 * Builds standard Windows ICO format with embedded PNG frames
 */
function buildIcoBlob(sizes: number[], pngBuffers: ArrayBuffer[]): Blob {
  const count = sizes.length;
  // Header: 6 bytes
  // Directory entries: count * 16 bytes
  const headerSize = 6;
  const dirEntrySize = 16;
  let offset = headerSize + count * dirEntrySize;

  const totalLength = offset + pngBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
  const icoBuffer = new ArrayBuffer(totalLength);
  const view = new DataView(icoBuffer);

  // 1. ICONDIR Header
  view.setUint16(0, 0, true);     // Reserved (0)
  view.setUint16(2, 1, true);     // Type (1 = ICO)
  view.setUint16(4, count, true); // Image count

  // 2. ICONDIRENTRY records
  for (let i = 0; i < count; i++) {
    const entryOffset = headerSize + i * dirEntrySize;
    const size = sizes[i];
    const buf = pngBuffers[i];

    view.setUint8(entryOffset + 0, size === 256 ? 0 : size); // Width
    view.setUint8(entryOffset + 1, size === 256 ? 0 : size); // Height
    view.setUint8(entryOffset + 2, 0);                       // Color palette (0 = no palette)
    view.setUint8(entryOffset + 3, 0);                       // Reserved
    view.setUint16(entryOffset + 4, 1, true);                // Color planes
    view.setUint16(entryOffset + 6, 32, true);               // Bits per pixel (32-bit RGBA)
    view.setUint32(entryOffset + 8, buf.byteLength, true);   // Size of image data
    view.setUint32(entryOffset + 12, offset, true);          // Offset to image data

    // Copy PNG bytes into ICO payload
    new Uint8Array(icoBuffer, offset, buf.byteLength).set(new Uint8Array(buf));
    offset += buf.byteLength;
  }

  return new Blob([icoBuffer], { type: 'image/x-icon' });
}

/**
 * Copies clean SVG to clipboard and fires confetti
 */
export async function copySvgToClipboard(svgContent: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(svgContent);
    // Fire celebratory micro-confetti
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.85, x: 0.8 },
      colors: ['#6366f1', '#06b6d4', '#ec4899', '#ffffff'],
      disableForReducedMotion: true,
    });
    return true;
  } catch (err) {
    console.warn('Clipboard write failed:', err);
    return false;
  }
}

/**
 * Helper to trigger browser file download via temporary anchor
 */
function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
