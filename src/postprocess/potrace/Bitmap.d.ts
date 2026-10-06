import Point from './Point';
/**
 * Bitmap class for storing binary image data
 * This is the main input for the tracing algorithm
 */
export default class Bitmap {
    width: number;
    height: number;
    size: number;
    data: Int8Array;
    constructor(width: number, height: number);
    /**
     * Check if pixel at (x, y) is set (black/foreground)
     */
    at(x: number, y: number): boolean;
    /**
     * Toggle pixel at (x, y)
     */
    flip(x: number, y: number): void;
    /**
     * Create a copy of this bitmap
     */
    copy(): Bitmap;
    /**
     * Convert flat index to Point
     */
    index(i: number): Point;
    /**
     * XOR a path with the bitmap
     */
    xOrPath(path: {
        points: Point[];
        maxX: number;
    }): void;
}
//# sourceMappingURL=Bitmap.d.ts.map