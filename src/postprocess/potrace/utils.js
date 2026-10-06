import Bitmap from './Bitmap.js';
/**
 * Returns the sign of a number: 1, -1, or 0
 */
export function sign(i) {
    return i > 0 ? 1 : i < 0 ? -1 : 0;
}
/**
 * Convert ImageData to a binary Bitmap.
 * Blends transparent pixels with white (like original node-potrace).
 *
 * @param imageData - RGBA pixel data (4 bytes per pixel)
 * @param threshold - Brightness threshold (0-255). Default: 128
 * @param blackOnWhite - If true (default), dark pixels become foreground (1).
 *                       If false, light pixels become foreground (1).
 * @returns A binary Bitmap ready for tracing
 */
export function imageDataToBitmap(imageData, threshold = 128, blackOnWhite = true) {
    const { width, height, data } = imageData;
    const bitmap = new Bitmap(width, height);
    for (let i = 0; i < width * height; i++) {
        const idx = i * 4;
        const opacity = data[idx + 3] / 255;
        // Blend with white background (255) based on opacity
        // This is exactly what node-potrace does
        const r = 255 + (data[idx + 0] - 255) * opacity;
        const g = 255 + (data[idx + 1] - 255) * opacity;
        const b = 255 + (data[idx + 2] - 255) * opacity;
        const lum = Math.round(0.2126 * r + 0.7153 * g + 0.0721 * b);
        // blackOnWhite=true: pixels DARKER than threshold become foreground (1)
        // blackOnWhite=false: pixels LIGHTER than threshold become foreground (1)
        if (blackOnWhite) {
            bitmap.data[i] = lum > threshold ? 0 : 1;
        }
        else {
            bitmap.data[i] = lum < threshold ? 0 : 1;
        }
    }
    return bitmap;
}
/**
 * Load an image from URL (browser-only, requires DOM)
 * @throws Error if DOM is not available
 */
export function loadImage(url) {
    if (typeof document === 'undefined' || typeof Image === 'undefined') {
        throw new Error('loadImage requires a DOM environment. Use imageDataToBitmap for worker-compatible tracing.');
    }
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = reject;
        image.src = url;
    });
}
/**
 * Create a bitmap from a canvas element (browser-only, requires DOM)
 * @throws Error if DOM is not available
 */
export function createBitmap(canvas, threshold = 128) {
    const { width, height } = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
        throw new Error('Could not get 2D context from canvas');
    }
    const imageData = context.getImageData(0, 0, width, height);
    return imageDataToBitmap(imageData, threshold);
}
