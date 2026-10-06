import Bitmap from './Bitmap.js';
import Path from './Path.js';
import Point from './Point.js';
import Curve from './Curve.js';
import bitmapToPathList from './bitmapToPathList.js';
import processPath from './processPath.js';
import getSVG from './getSVG.js';
import getPaths from './getPaths.js';
import { imageDataToBitmap } from './utils.js';

export type TurnPolicy = 'right' | 'black' | 'white' | 'majority' | 'minority';

export interface PotraceOptions {
  turnpolicy: TurnPolicy;
  turdsize: number;
  optcurve: boolean;
  alphamax: number;
  opttolerance: number;
}

export const DEFAULT_OPTIONS: PotraceOptions = {
  turnpolicy: 'right',
  turdsize: 2,
  optcurve: true,
  alphamax: 1,
  opttolerance: 0.2,
};

export function traceBitmap(bitmap: Bitmap, options?: Partial<PotraceOptions>): Path[] {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const pathList = bitmapToPathList(bitmap, opts as any);
  processPath(pathList, opts as any);
  return pathList;
}

export { Bitmap, Path, Point, Curve, getSVG, getPaths, imageDataToBitmap };
