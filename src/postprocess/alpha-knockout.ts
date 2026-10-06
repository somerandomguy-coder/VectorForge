/**
 * Alpha Knockout & Luminance Binarization Engine
 * Strips solid white or solid black backgrounds from raster diffusion outputs client-side.
 */

export interface KnockoutOptions {
  threshold: number; // 0 - 255 (default 205)
  invert?: boolean;  // Invert mask polarity
  smoothEdges?: boolean;
}

export interface KnockoutResult {
  maskedBitmap: ImageBitmap;
  binarizedImageData: ImageData;
  width: number;
  height: number;
}

/**
 * Removes background using luminance thresholding and returns both a transparent ImageBitmap
 * and a 1-bit binarized ImageData suitable for Potrace vector tracing.
 */
export async function performAlphaKnockout(
  bitmap: ImageBitmap,
  options: KnockoutOptions
): Promise<KnockoutResult> {
  const width = bitmap.width;
  const height = bitmap.height;
  const threshold = options.threshold ?? 205;
  const invert = !!options.invert;

  // 1. Draw source bitmap to OffscreenCanvas
  const canvas = new OffscreenCanvas(width, height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(bitmap, 0, 0);

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Create binarized image data copy for tracing
  const binarized = ctx.createImageData(width, height);
  const binData = binarized.data;

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Standard ITU-R BT.601 luminance
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    const isBackground = invert ? luminance < threshold : luminance > threshold;

    if (isBackground) {
      // Transparent in masked bitmap
      data[i + 3] = 0;

      // Pure white (empty) in binarized tracing buffer
      binData[i] = 255;
      binData[i + 1] = 255;
      binData[i + 2] = 255;
      binData[i + 3] = 255;
    } else {
      // Solid foreground mask
      data[i + 3] = 255;

      // Pure black (solid mark) in binarized tracing buffer
      binData[i] = 0;
      binData[i + 1] = 0;
      binData[i + 2] = 0;
      binData[i + 3] = 255;
    }
  }

  // Put transparent masked pixels back on canvas
  ctx.putImageData(imgData, 0, 0);
  const maskedBitmap = canvas.transferToImageBitmap();

  return {
    maskedBitmap,
    binarizedImageData: binarized,
    width,
    height,
  };
}
