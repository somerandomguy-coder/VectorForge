import Bitmap from '../postprocess/potrace/Bitmap.js';

/**
 * Pure-TypeScript Software Rasterizer for Node.js / MCP environments
 * Renders geometric shapes and curves directly into binary bitmaps for Potrace tracing.
 */

export class SoftwareRasterizer {
  public width: number;
  public height: number;
  public data: Uint8Array; // 0 = white (bg), 1 = black (fg)

  constructor(width: number = 512, height: number = 512) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height); // Initialize all white (0)
  }

  public fillRect(x: number, y: number, w: number, h: number, val: 0 | 1 = 1) {
    const x0 = Math.max(0, Math.floor(x));
    const y0 = Math.max(0, Math.floor(y));
    const x1 = Math.min(this.width, Math.ceil(x + w));
    const y1 = Math.min(this.height, Math.ceil(y + h));

    for (let py = y0; py < y1; py++) {
      const row = py * this.width;
      for (let px = x0; px < x1; px++) {
        this.data[row + px] = val;
      }
    }
  }

  public fillCircle(cx: number, cy: number, r: number, val: 0 | 1 = 1) {
    const r2 = r * r;
    const y0 = Math.max(0, Math.floor(cy - r));
    const y1 = Math.min(this.height, Math.ceil(cy + r));
    const x0 = Math.max(0, Math.floor(cx - r));
    const x1 = Math.min(this.width, Math.ceil(cx + r));

    for (let py = y0; py < y1; py++) {
      const dy = py - cy;
      const dy2 = dy * dy;
      const row = py * this.width;
      for (let px = x0; px < x1; px++) {
        const dx = px - cx;
        if (dx * dx + dy2 <= r2) {
          this.data[row + px] = val;
        }
      }
    }
  }

  public strokeCircle(cx: number, cy: number, r: number, thickness: number = 8, val: 0 | 1 = 1) {
    const outer2 = (r + thickness / 2) ** 2;
    const inner2 = Math.max(0, r - thickness / 2) ** 2;
    const y0 = Math.max(0, Math.floor(cy - r - thickness));
    const y1 = Math.min(this.height, Math.ceil(cy + r + thickness));
    const x0 = Math.max(0, Math.floor(cx - r - thickness));
    const x1 = Math.min(this.width, Math.ceil(cx + r + thickness));

    for (let py = y0; py < y1; py++) {
      const dy2 = (py - cy) ** 2;
      const row = py * this.width;
      for (let px = x0; px < x1; px++) {
        const d2 = (px - cx) ** 2 + dy2;
        if (d2 >= inner2 && d2 <= outer2) {
          this.data[row + px] = val;
        }
      }
    }
  }

  public fillPolygon(points: Array<[number, number]>, val: 0 | 1 = 1) {
    if (points.length < 3) return;

    let minY = this.height;
    let maxY = 0;
    for (const [, y] of points) {
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
    minY = Math.max(0, Math.floor(minY));
    maxY = Math.min(this.height - 1, Math.ceil(maxY));

    for (let py = minY; py <= maxY; py++) {
      const nodeX: number[] = [];
      let j = points.length - 1;
      for (let i = 0; i < points.length; i++) {
        const [xi, yi] = points[i];
        const [xj, yj] = points[j];
        if ((yi < py && yj >= py) || (yj < py && yi >= py)) {
          nodeX.push(xi + ((py - yi) / (yj - yi)) * (xj - xi));
        }
        j = i;
      }
      nodeX.sort((a, b) => a - b);
      const row = py * this.width;
      for (let i = 0; i < nodeX.length; i += 2) {
        if (i + 1 >= nodeX.length) break;
        const xStart = Math.max(0, Math.floor(nodeX[i]));
        const xEnd = Math.min(this.width - 1, Math.ceil(nodeX[i + 1]));
        for (let px = xStart; px <= xEnd; px++) {
          this.data[row + px] = val;
        }
      }
    }
  }

  public strokePolygon(points: Array<[number, number]>, thickness: number = 8, val: 0 | 1 = 1) {
    for (let i = 0; i < points.length; i++) {
      const p0 = points[i];
      const p1 = points[(i + 1) % points.length];
      this.drawLine(p0[0], p0[1], p1[0], p1[1], thickness, val);
    }
  }

  public drawLine(x0: number, y0: number, x1: number, y1: number, thickness: number = 8, val: 0 | 1 = 1) {
    const dx = x1 - x0;
    const dy = y1 - y0;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) {
      this.fillCircle(x0, y0, thickness / 2, val);
      return;
    }
    const nx = (-dy / dist) * (thickness / 2);
    const ny = (dx / dist) * (thickness / 2);

    this.fillPolygon([
      [x0 + nx, y0 + ny],
      [x1 + nx, y1 + ny],
      [x1 - nx, y1 - ny],
      [x0 - nx, y0 - ny],
    ], val);
  }

  /**
   * Converts the internal 1-bit buffer to a Potrace Bitmap
   */
  public toPotraceBitmap(): Bitmap {
    const bitmap = new Bitmap(this.width, this.height);
    for (let i = 0; i < this.data.length; i++) {
      bitmap.data[i] = this.data[i];
    }
    return bitmap;
  }
}
