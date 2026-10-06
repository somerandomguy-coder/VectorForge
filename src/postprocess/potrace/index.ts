import Bitmap from './Bitmap';
import Path from './Path';
import Point from './Point';
import Curve from './Curve';
import bitmapToPathList from './bitmapToPathList';
import processPath from './processPath';
import getSVG from './getSVG';
import getPaths from './getPaths';
import { imageDataToBitmap } from './utils';

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
