import Point from './Point';
import Curve from './Curve';
import Sum from './Sum';
/**
 * Path class representing a traced path
 */
export default class Path {
    points: Point[];
    area: number;
    isHole: boolean;
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
    curve: Curve;
    x0?: number;
    y0?: number;
    sums?: Sum[];
    lon?: number[];
    po?: number[];
    m?: number;
    constructor(points: Point[], area: number, isHole: boolean);
    reverse(): void;
}
//# sourceMappingURL=Path.d.ts.map