import Point from './Point';
export type CurveTag = 'CURVE' | 'CORNER';
/**
 * Curve class representing a traced path's curve segments
 */
export default class Curve {
    n: number;
    tag: CurveTag[];
    c: Point[];
    alphaCurve: number;
    vertex: Point[];
    alpha: number[];
    alpha0: number[];
    beta: number[];
    constructor(n: number);
}
//# sourceMappingURL=Curve.d.ts.map