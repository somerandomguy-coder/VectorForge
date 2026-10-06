/**
 * A 2D point class used throughout potrace
 */
export default class Point {
    x: number;
    y: number;
    constructor(x?: number, y?: number);
    copy(): Point;
    toIndex(width: number, height: number): number | null;
    lerp(point: Point, lambda: number): Point;
    dorthInfty(point: Point): Point;
    ddenom(point: Point): number;
    dpara(p1: Point, p2: Point): number;
    interval(p1: Point, p2: Point): number;
    subtract(p: Point): Point;
    add(p: Point): Point;
    multiply(s: number): Point;
    dot(p: Point): number;
    cross(p: Point): number;
}
//# sourceMappingURL=Point.d.ts.map