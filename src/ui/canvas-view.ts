/**
 * Interactive Canvas & SVG Viewport View Manager
 * Controls display modes, pan & zoom, backgrounds, and HUD indicators.
 */

export type ViewMode = 'vector' | 'brand' | 'knockout' | 'raster';
export type BackdropTheme = 'grid-dark' | 'grid-light' | 'solid-dark' | 'solid-light';

export class CanvasViewController {
  private svgStage: HTMLElement;
  private canvas: HTMLCanvasElement;
  private container: HTMLElement;
  private hudOverlay: HTMLElement;
  private hudStageName: HTMLElement;
  private hudSubtext: HTMLElement;
  private hudProgressFill: HTMLElement;
  private zoomLabel: HTMLElement;

  private currentZoom = 1.0;
  private currentMode: ViewMode = 'vector';
  private currentBackdrop: BackdropTheme = 'grid-dark';

  private rawBitmap: ImageBitmap | null = null;
  private maskedBitmap: ImageBitmap | null = null;
  private currentSvg: string = '';
  private currentBrandSvg: string = '';

  constructor() {
    this.svgStage = document.getElementById('svgRenderStage')!;
    this.canvas = document.getElementById('mainCanvas') as HTMLCanvasElement;
    this.container = document.getElementById('viewportCanvasContainer')!;
    this.hudOverlay = document.getElementById('hudOverlay')!;
    this.hudStageName = document.getElementById('hudStageName')!;
    this.hudSubtext = document.getElementById('hudSubtext')!;
    this.hudProgressFill = document.getElementById('hudProgressFill')!;
    this.zoomLabel = document.getElementById('zoomPercent')!;
  }

  public setViewMode(mode: ViewMode) {
    this.currentMode = mode;
    this.renderCurrent();
  }

  public setBackdrop(theme: BackdropTheme) {
    this.currentBackdrop = theme;
    this.container.classList.remove('grid-dark', 'grid-light', 'solid-dark', 'solid-light');
    this.container.classList.add(theme);
  }

  public setRawBitmap(bitmap: ImageBitmap) {
    this.rawBitmap = bitmap;
    if (this.currentMode === 'raster') this.renderCurrent();
  }

  public setMaskedBitmap(bitmap: ImageBitmap) {
    this.maskedBitmap = bitmap;
    if (this.currentMode === 'knockout') this.renderCurrent();
  }

  public setSvg(svgString: string) {
    this.currentSvg = svgString;
    if (this.currentMode === 'vector') this.renderCurrent();
  }

  public setBrandSvg(brandSvgString: string) {
    this.currentBrandSvg = brandSvgString;
    if (this.currentMode === 'brand') this.renderCurrent();
  }

  public showHud(stageName: string, subtext: string, percent: number = 20) {
    this.hudStageName.textContent = stageName;
    this.hudSubtext.textContent = subtext;
    this.hudProgressFill.style.width = `${percent}%`;
    this.hudOverlay.classList.add('active');
  }

  public updateHudProgress(percent: number, message?: string) {
    this.hudProgressFill.style.width = `${percent}%`;
    if (message) this.hudSubtext.textContent = message;
  }

  public hideHud() {
    this.hudOverlay.classList.remove('active');
  }

  public zoomIn() {
    this.setZoom(Math.min(2.5, this.currentZoom + 0.15));
  }

  public zoomOut() {
    this.setZoom(Math.max(0.4, this.currentZoom - 0.15));
  }

  public resetZoom() {
    this.setZoom(1.0);
  }

  private setZoom(zoom: number) {
    this.currentZoom = parseFloat(zoom.toFixed(2));
    this.zoomLabel.textContent = `${Math.round(this.currentZoom * 100)}%`;
    this.container.style.transform = `scale(${this.currentZoom})`;
  }

  public renderCurrent() {
    if (this.currentMode === 'vector') {
      this.canvas.style.display = 'none';
      this.svgStage.style.display = 'flex';
      this.svgStage.innerHTML = this.currentSvg;
    } else if (this.currentMode === 'brand') {
      this.canvas.style.display = 'none';
      this.svgStage.style.display = 'flex';
      this.svgStage.innerHTML = this.currentBrandSvg || this.currentSvg;
    } else if (this.currentMode === 'knockout') {
      this.svgStage.style.display = 'none';
      this.canvas.style.display = 'block';
      this.drawBitmapToCanvas(this.maskedBitmap);
    } else if (this.currentMode === 'raster') {
      this.svgStage.style.display = 'none';
      this.canvas.style.display = 'block';
      this.drawBitmapToCanvas(this.rawBitmap);
    }
  }

  private drawBitmapToCanvas(bmp: ImageBitmap | null) {
    const ctx = this.canvas.getContext('2d')!;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    if (bmp) {
      this.canvas.width = bmp.width;
      this.canvas.height = bmp.height;
      ctx.drawImage(bmp, 0, 0);
    }
  }
}
