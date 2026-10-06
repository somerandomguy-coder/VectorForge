import Path from './Path';
export interface SVGOptions {
    width?: number;
    height?: number;
    optType?: 'fill' | 'curve';
}
/**
 * Generate SVG string from a path list
 */
export default function getSVG(pathList: Path[], size?: number, optType?: 'fill' | 'curve'): string;
//# sourceMappingURL=getSVG.d.ts.map