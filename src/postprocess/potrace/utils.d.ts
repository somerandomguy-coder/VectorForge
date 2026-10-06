import Bitmap from './Bitmap';
/**
 * Returns the sign of a number: 1, -1, or 0
 */
export declare function sign(i: number): number;
/**
 * Interface for ImageData-like objects
 * Works with both browser ImageData and custom implementations
 */
export interface ImageDataLike {
    width: number;
    height: number;
    data: Uint8ClampedArray | number[];
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
export declare function imageDataToBitmap(imageData: ImageDataLike, threshold?: number, blackOnWhite?: boolean): Bitmap;
/**
 * Load an image from URL (browser-only, requires DOM)
 * @throws Error if DOM is not available
 */
export declare function loadImage(url: string): Promise<HTMLImageElement>;
/**
 * Create a bitmap from a canvas element (browser-only, requires DOM)
 * @throws Error if DOM is not available
 */
export declare function createBitmap(canvas: HTMLCanvasElement, threshold?: number): Bitmap;
//# sourceMappingURL=utils.d.ts.map