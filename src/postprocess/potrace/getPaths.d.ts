import Path from './Path';
export interface PathPoint {
    type: 'POINT';
    x: number;
    y: number;
}
export interface PathCurve {
    type: 'CURVE';
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    x: number;
    y: number;
}
export type PathSegment = PathPoint | PathCurve;
/**
 * Extract path data from traced paths for programmatic use
 */
export default function getPaths(pathlist: Path[]): PathSegment[][];
//# sourceMappingURL=getPaths.d.ts.map