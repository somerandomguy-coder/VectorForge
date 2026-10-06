import './styles/index.css';
import type { 
  WorkerRequest, 
  WorkerResponse, 
  HardwareInspectionResult,
  LogoStyle 
} from './workers/rpc-protocol';
import { performAlphaKnockout, type KnockoutResult } from './postprocess/alpha-knockout';
import { vectorizeImageData, recolorSvg, formatAndRecolorSvg } from './postprocess/vectorizer';
import { composeBrandSvg, type TypographyConfig, type BrandLayout } from './ui/typography-layer';
import { CanvasViewController, type ViewMode, type BackdropTheme } from './ui/canvas-view';
import { STYLE_PRESETS, SAMPLE_CONCEPTS, buildPrompt } from './ui/style-presets';
import { 
  downloadSvgFile, 
  downloadPngFromSvg, 
  downloadFaviconIco, 
  copySvgToClipboard 
} from './ui/export-manager';
import { runHardwareBenchmark, type BenchmarkMetrics } from './benchmark/benchmark-engine.js';

// App State
let worker: Worker;
let canvasController: CanvasViewController;
let hardwareInfo: HardwareInspectionResult | null = null;

let currentStyle: LogoStyle = 'geometric-badge';
let currentColorHex = '#6366f1';
let currentRawBitmap: ImageBitmap | null = null;
let currentKnockout: KnockoutResult | null = null;
let currentVectorSvg = '';
let currentBrandSvg = '';

// DOM Elements
const hardwareStatusBtn = document.getElementById('hardwareStatusBtn')!;
const hardwareStatusText = document.getElementById('hardwareStatusText')!;
const storageStatusBtn = document.getElementById('storageStatusBtn')!;
const storageStatusText = document.getElementById('storageStatusText')!;
const engineModeSelect = document.getElementById('engineModeSelect') as HTMLSelectElement;

const promptInput = document.getElementById('promptInput') as HTMLTextAreaElement;
const randomPromptBtn = document.getElementById('randomPromptBtn')!;
const quickKeywordsContainer = document.getElementById('quickKeywordsContainer')!;
const presetGrid = document.getElementById('presetGrid')!;
const seedInput = document.getElementById('seedInput') as HTMLInputElement;
const randomSeedBtn = document.getElementById('randomSeedBtn')!;
const stepCount = document.getElementById('stepCount') as HTMLSelectElement;
const generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
const generateBtnText = document.getElementById('generateBtnText')!;

// Post-process sliders
const thresholdSlider = document.getElementById('thresholdSlider') as HTMLInputElement;
const thresholdVal = document.getElementById('thresholdVal')!;
const invertMaskCheckbox = document.getElementById('invertMaskCheckbox') as HTMLInputElement;
const turdsizeSlider = document.getElementById('turdsizeSlider') as HTMLInputElement;
const turdsizeVal = document.getElementById('turdsizeVal')!;
const curveToleranceSlider = document.getElementById('curveToleranceSlider') as HTMLInputElement;
const curveToleranceVal = document.getElementById('curveToleranceVal')!;

// Accordions
const vectorTuningToggle = document.getElementById('vectorTuningToggle')!;
const vectorTuningCard = document.getElementById('vectorTuningCard')!;
const typographyToggle = document.getElementById('typographyToggle')!;
const typographyCard = document.getElementById('typographyCard')!;

// Typography Layer Elements
const brandNameInput = document.getElementById('brandNameInput') as HTMLInputElement;
const taglineInput = document.getElementById('taglineInput') as HTMLInputElement;
const brandFontSelect = document.getElementById('brandFontSelect') as HTMLSelectElement;
const brandLayoutSelect = document.getElementById('brandLayoutSelect') as HTMLSelectElement;
const letterSpacingSlider = document.getElementById('letterSpacingSlider') as HTMLInputElement;
const letterSpacingVal = document.getElementById('letterSpacingVal')!;

// Swatches & Recolor
const swatchesContainer = document.getElementById('swatchesContainer')!;
const customColorPicker = document.getElementById('customColorPicker') as HTMLInputElement;
const customColorHex = document.getElementById('customColorHex') as HTMLInputElement;

// View Mode & Backdrop
const viewModeGroup = document.getElementById('viewModeGroup')!;
const backdropControls = document.querySelectorAll('.backdrop-btn');

// Export Buttons
const copySvgBtn = document.getElementById('copySvgBtn')!;
const downloadSvgBtn = document.getElementById('downloadSvgBtn')!;
const downloadPngBtn = document.getElementById('downloadPngBtn')!;
const downloadPng1024Btn = document.getElementById('downloadPng1024Btn')!;
const downloadIcoBtn = document.getElementById('downloadIcoBtn')!;

// Telemetry
const telemetryInference = document.getElementById('telemetryInference')!;
const telemetryTrace = document.getElementById('telemetryTrace')!;
const telemetryPaths = document.getElementById('telemetryPaths')!;

// Modals
const hardwareModal = document.getElementById('hardwareModal')!;
const storageModal = document.getElementById('storageModal')!;
const galleryModal = document.getElementById('galleryModal')!;
const guideModal = document.getElementById('guideModal')!;
const sampleGalleryBtn = document.getElementById('sampleGalleryBtn')!;
const helpModalBtn = document.getElementById('helpModalBtn')!;
const sampleGalleryGrid = document.getElementById('sampleGalleryGrid')!;
const toastContainer = document.getElementById('toastContainer')!;

// Storage Modal Controls
const opfsCacheStatus = document.getElementById('opfsCacheStatus')!;
const opfsQuotaInfo = document.getElementById('opfsQuotaInfo')!;
const streamWeightsBtn = document.getElementById('streamWeightsBtn')!;
const clearWeightsBtn = document.getElementById('clearWeightsBtn')!;
const downloadProgressFill = document.getElementById('downloadProgressFill')!;
const downloadBytesLabel = document.getElementById('downloadBytesLabel')!;
const downloadSpeedLabel = document.getElementById('downloadSpeedLabel')!;
const downloadStageLabel = document.getElementById('downloadStageLabel')!;

// Benchmark Modal Controls
const benchmarkBtn = document.getElementById('benchmarkBtn')!;
const benchmarkModal = document.getElementById('benchmarkModal')!;
const startBenchmarkBtn = document.getElementById('startBenchmarkBtn') as HTMLButtonElement;
const benchStatusLabel = document.getElementById('benchStatusLabel')!;
const benchProgressFill = document.getElementById('benchProgressFill')!;
const benchmarkResultsPanel = document.getElementById('benchmarkResultsPanel')!;
const tierBadge = document.getElementById('tierBadge')!;
const tierScore = document.getElementById('tierScore')!;
const tierDesc = document.getElementById('tierDesc')!;
const tierRecPill = document.getElementById('tierRecPill')!;
const metricGpuScore = document.getElementById('metricGpuScore')!;
const metricGflops = document.getElementById('metricGflops')!;
const metricBufferLimit = document.getElementById('metricBufferLimit')!;
const metricTraceLatency = document.getElementById('metricTraceLatency')!;
const metricKnockoutSpeed = document.getElementById('metricKnockoutSpeed')!;
const metricOpfsSpeed = document.getElementById('metricOpfsSpeed')!;
const benchBottlenecksBox = document.getElementById('benchBottlenecksBox')!;
const benchBottleneckList = document.getElementById('benchBottleneckList')!;

/**
 * Bootstraps the application
 */
function init() {
  canvasController = new CanvasViewController();
  initWorker();
  bindEventListeners();
  populateSampleGallery();

  // Run initial synthesis immediately so user sees a stunning logo on open!
  setTimeout(() => {
    runGeneration();
  }, 250);
}

/**
 * Initializes the WebGPU Web Worker
 */
function initWorker() {
  worker = new Worker(new URL('./workers/engine.worker.ts', import.meta.url), {
    type: 'module',
  });

  worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
    handleWorkerMessage(event.data);
  };

  // Inspect hardware & storage on start
  worker.postMessage({ type: 'CHECK_HARDWARE' } as WorkerRequest);
  worker.postMessage({ type: 'CHECK_STORAGE' } as WorkerRequest);
}

/**
 * Handles incoming RPC messages from the Web Worker
 */
async function handleWorkerMessage(response: WorkerResponse) {
  switch (response.type) {
    case 'HARDWARE_STATUS':
      hardwareInfo = response.result;
      updateHardwarePill(response.result);
      renderHardwareDiagnosticsModal(response.result);
      break;

    case 'STORAGE_STATUS':
      updateStoragePill(response.isCached, response.cacheSizeBytes, response.quotaBytes);
      break;

    case 'DOWNLOAD_PROGRESS':
      downloadProgressFill.style.width = `${response.percent}%`;
      downloadBytesLabel.textContent = `${(response.loadedBytes / (1024 * 1024)).toFixed(0)} MB / ${(response.totalBytes / (1024 * 1024)).toFixed(0)} MB (${response.percent}%)`;
      downloadSpeedLabel.textContent = `${response.speedMBps} MB/s`;
      downloadStageLabel.textContent = response.stage;
      break;

    case 'DOWNLOAD_COMPLETE':
      showToast(response.message, 'success');
      worker.postMessage({ type: 'CHECK_STORAGE' } as WorkerRequest);
      break;

    case 'CACHE_CLEARED':
      showToast('OPFS cache cleared successfully', 'info');
      worker.postMessage({ type: 'CHECK_STORAGE' } as WorkerRequest);
      break;

    case 'PROGRESS_UPDATE':
      canvasController.showHud(response.stage, `Step ${response.step} of ${response.totalSteps}`, response.percent);
      break;

    case 'GENERATE_COMPLETE':
      await processGeneratedBitmap(response.bitmap, response.inferenceTimeMs);
      canvasController.hideHud();
      setGeneratingState(false);
      break;

    case 'ERROR':
      showToast(`Error: ${response.message}`, 'error');
      canvasController.hideHud();
      setGeneratingState(false);
      break;
  }
}

/**
 * Processes generated ImageBitmap through Alpha Knockout, Vector Tracing, and Typography
 */
async function processGeneratedBitmap(bitmap: ImageBitmap, inferenceTimeMs: number) {
  currentRawBitmap = bitmap;
  canvasController.setRawBitmap(bitmap);
  telemetryInference.textContent = `${inferenceTimeMs}ms`;

  await retraceCurrentBitmap();
}

/**
 * Re-runs the alpha knockout and vectorization pipeline
 */
async function retraceCurrentBitmap() {
  if (!currentRawBitmap) return;

  const threshold = parseInt(thresholdSlider.value, 10);
  const invert = invertMaskCheckbox.checked;
  const turdsize = parseInt(turdsizeSlider.value, 10);
  const opttolerance = parseFloat(curveToleranceSlider.value);

  // 1. Alpha Knockout
  currentKnockout = await performAlphaKnockout(currentRawBitmap, {
    threshold,
    invert,
  });

  canvasController.setMaskedBitmap(currentKnockout.maskedBitmap);

  // 2. Potrace Vector Tracing
  const vectorResult = await vectorizeImageData(currentKnockout.binarizedImageData, {
    colorHex: currentColorHex,
    turdsize,
    opttolerance,
  });

  currentVectorSvg = vectorResult.svgString;
  telemetryTrace.textContent = `${vectorResult.traceTimeMs}ms`;
  telemetryPaths.textContent = `${vectorResult.pathCount} paths`;
  canvasController.setSvg(currentVectorSvg);

  // 3. Compose Brand Typography Mockup
  updateBrandTypography();
}

/**
 * Re-composes the brand typography layer
 */
function updateBrandTypography() {
  if (!currentVectorSvg) return;

  const config: TypographyConfig = {
    brandName: brandNameInput.value,
    tagline: taglineInput.value,
    fontFamily: brandFontSelect.value,
    layout: brandLayoutSelect.value as BrandLayout,
    letterSpacing: parseInt(letterSpacingSlider.value, 10),
    colorHex: currentColorHex,
  };

  currentBrandSvg = composeBrandSvg(currentVectorSvg, config);
  canvasController.setBrandSvg(currentBrandSvg);
}

/**
 * Triggers a new logo generation
 */
function runGeneration() {
  const keyword = promptInput.value.trim() || 'cybernetic falcon silhouette';
  const seed = parseInt(seedInput.value, 10) || Math.floor(Math.random() * 1000000);
  const steps = parseInt(stepCount.value, 10) || 1;
  const engineMode = engineModeSelect.value as 'turbo-synth' | 'webgpu-onnx';

  setGeneratingState(true);
  canvasController.showHud('Forging Vector Mark...', 'Initializing client-side engine', 15);

  worker.postMessage({
    type: 'GENERATE',
    params: {
      prompt: buildPrompt(keyword, currentStyle),
      style: currentStyle,
      seed,
      steps,
      engineMode,
    },
  } as WorkerRequest);
}

function setGeneratingState(isGenerating: boolean) {
  if (isGenerating) {
    generateBtn.disabled = true;
    generateBtn.classList.add('loading');
    generateBtnText.textContent = 'Forging...';
  } else {
    generateBtn.disabled = false;
    generateBtn.classList.remove('loading');
    generateBtnText.textContent = 'Forge Vector Logo';
  }
}

/**
 * Updates UI pills and status indicators
 */
function updateHardwarePill(info: HardwareInspectionResult) {
  hardwareStatusBtn.className = 'status-pill';
  if (info.hasWebGPU && info.hasFp16) {
    hardwareStatusBtn.classList.add('status-ready');
    hardwareStatusText.textContent = '⚡ WebGPU Ready (FP16)';
  } else if (info.hasWebGPU) {
    hardwareStatusBtn.classList.add('status-ready');
    hardwareStatusText.textContent = '⚡ WebGPU Active';
  } else {
    hardwareStatusBtn.classList.add('status-warning');
    hardwareStatusText.textContent = '⚠️ WebGPU Unsupported (Synth Active)';
  }
}

function updateStoragePill(isCached: boolean, cacheSizeBytes: number, quotaBytes: number) {
  storageStatusBtn.className = 'status-pill';
  const mb = (cacheSizeBytes / (1024 * 1024)).toFixed(0);
  const quotaGb = (quotaBytes / (1024 * 1024 * 1024)).toFixed(0);

  if (isCached) {
    storageStatusBtn.classList.add('status-ready');
    storageStatusText.textContent = `OPFS: ${mb} MB Cached`;
    opfsCacheStatus.textContent = `Cached (${mb} MB)`;
  } else {
    storageStatusText.textContent = `OPFS: Empty (${quotaGb} GB Avail)`;
    opfsCacheStatus.textContent = 'Not Downloaded (Using Instant Synth)';
  }

  opfsQuotaInfo.textContent = `${(quotaBytes / (1024 * 1024 * 1024)).toFixed(1)} GB Total Storage`;
}

function renderHardwareDiagnosticsModal(info: HardwareInspectionResult) {
  const diagIconGpu = document.getElementById('diagIconGpu')!;
  const diagValGpu = document.getElementById('diagValGpu')!;
  const diagIconF16 = document.getElementById('diagIconF16')!;
  const diagValF16 = document.getElementById('diagValF16')!;
  const diagIconBuffer = document.getElementById('diagIconBuffer')!;
  const diagValBuffer = document.getElementById('diagValBuffer')!;
  const diagIconOpfs = document.getElementById('diagIconOpfs')!;
  const diagValOpfs = document.getElementById('diagValOpfs')!;
  const diagIconAdapter = document.getElementById('diagIconAdapter')!;
  const diagValAdapter = document.getElementById('diagValAdapter')!;

  diagIconGpu.textContent = info.hasWebGPU ? '✅' : '❌';
  diagValGpu.textContent = info.hasWebGPU ? 'Supported & Enabled' : 'Not Available (Falling back to Canvas Synth)';

  diagIconF16.textContent = info.hasFp16 ? '✅' : '⚠️';
  diagValF16.textContent = info.hasFp16 ? 'Supported (Half-Precision Accelerated)' : 'Not Supported (FP32 Emulated)';

  diagIconBuffer.textContent = info.isStorageBufferSufficient ? '✅' : '⚠️';
  diagValBuffer.textContent = `${(info.maxStorageBufferBindingSize / (1024 * 1024)).toFixed(0)} MB (${info.isStorageBufferSufficient ? 'Sufficient for UNet' : 'Below 1GB recommendation'})`;

  diagIconOpfs.textContent = info.opfsSupported ? '✅' : '⚠️';
  diagValOpfs.textContent = info.opfsSupported ? `Supported (~${(info.storageQuotaBytes / (1024 * 1024 * 1024)).toFixed(0)} GB quota)` : 'Using Cache API fallback';

  diagIconAdapter.textContent = '🖥️';
  diagValAdapter.textContent = `${info.vendor} • ${info.description}`;
}

/**
 * Event Listeners & Interactive Controls
 */
function bindEventListeners() {
  // Generate button & Shortcut
  generateBtn.addEventListener('click', runGeneration);
  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runGeneration();
    }
  });

  // Random prompt
  randomPromptBtn.addEventListener('click', () => {
    const randomConcept = SAMPLE_CONCEPTS[Math.floor(Math.random() * SAMPLE_CONCEPTS.length)];
    loadConcept(randomConcept);
  });

  // Random seed
  randomSeedBtn.addEventListener('click', () => {
    seedInput.value = `${Math.floor(Math.random() * 1000000)}`;
  });

  // Quick keywords chips
  quickKeywordsContainer.addEventListener('click', (e) => {
    const chip = (e.target as HTMLElement).closest('.keyword-chip') as HTMLElement;
    if (chip && chip.dataset.prompt) {
      promptInput.value = chip.dataset.prompt;
      runGeneration();
    }
  });

  // Preset chips
  presetGrid.addEventListener('click', (e) => {
    const card = (e.target as HTMLElement).closest('.preset-card') as HTMLElement;
    if (card && card.dataset.preset) {
      document.querySelectorAll('.preset-card').forEach((c) => c.classList.remove('active'));
      card.classList.add('active');
      currentStyle = card.dataset.preset as LogoStyle;
      runGeneration();
    }
  });

  // Accordions
  vectorTuningToggle.addEventListener('click', () => {
    vectorTuningCard.classList.toggle('collapsed');
  });
  typographyToggle.addEventListener('click', () => {
    typographyCard.classList.toggle('collapsed');
  });

  // Vector Tuning Sliders (Instant Re-trace)
  thresholdSlider.addEventListener('input', () => {
    thresholdVal.textContent = thresholdSlider.value;
    retraceCurrentBitmap();
  });

  invertMaskCheckbox.addEventListener('change', () => {
    retraceCurrentBitmap();
  });

  turdsizeSlider.addEventListener('input', () => {
    turdsizeVal.textContent = `${turdsizeSlider.value} px`;
    retraceCurrentBitmap();
  });

  curveToleranceSlider.addEventListener('input', () => {
    curveToleranceVal.textContent = curveToleranceSlider.value;
    retraceCurrentBitmap();
  });

  // Typography Inputs (Instant Live Re-composition)
  brandNameInput.addEventListener('input', updateBrandTypography);
  taglineInput.addEventListener('input', updateBrandTypography);
  brandFontSelect.addEventListener('change', updateBrandTypography);
  brandLayoutSelect.addEventListener('change', updateBrandTypography);
  letterSpacingSlider.addEventListener('input', () => {
    letterSpacingVal.textContent = `${letterSpacingSlider.value} px`;
    updateBrandTypography();
  });

  // Recolor Swatches (Instant SVG Recoloring)
  swatchesContainer.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.swatch-btn') as HTMLElement;
    if (btn && btn.dataset.color) {
      document.querySelectorAll('.swatch-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      setColor(btn.dataset.color);
    }
  });

  customColorPicker.addEventListener('input', (e) => {
    const color = (e.target as HTMLInputElement).value;
    setColor(color);
  });

  customColorHex.addEventListener('change', (e) => {
    const hex = (e.target as HTMLInputElement).value;
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      setColor(hex);
    }
  });

  // View Mode Tabs
  viewModeGroup.addEventListener('click', (e) => {
    const tab = (e.target as HTMLElement).closest('.view-tab') as HTMLElement;
    if (tab && tab.dataset.mode) {
      document.querySelectorAll('.view-tab').forEach((t) => t.classList.remove('active'));
      tab.classList.add('active');
      canvasController.setViewMode(tab.dataset.mode as ViewMode);
    }
  });

  // Backdrop Switcher
  backdropControls.forEach((btn) => {
    btn.addEventListener('click', () => {
      backdropControls.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      const theme = (btn as HTMLElement).dataset.bg as BackdropTheme;
      canvasController.setBackdrop(theme);
    });
  });

  // Zoom Controls
  document.getElementById('zoomInBtn')!.addEventListener('click', () => canvasController.zoomIn());
  document.getElementById('zoomOutBtn')!.addEventListener('click', () => canvasController.zoomOut());
  document.getElementById('zoomResetBtn')!.addEventListener('click', () => canvasController.resetZoom());

  // Export Buttons
  copySvgBtn.addEventListener('click', async () => {
    const svgToExport = getActiveSvg();
    const success = await copySvgToClipboard(svgToExport);
    if (success) showToast('SVG code copied to clipboard!', 'success');
  });

  downloadSvgBtn.addEventListener('click', () => {
    const svgToExport = getActiveSvg();
    const name = sanitizeFilename(brandNameInput.value || 'vectorforge-logo');
    downloadSvgFile(svgToExport, `${name}.svg`);
    showToast('Downloaded SVG vector', 'info');
  });

  downloadPngBtn.addEventListener('click', async () => {
    const svgToExport = getActiveSvg();
    const name = sanitizeFilename(brandNameInput.value || 'vectorforge-logo');
    await downloadPngFromSvg(svgToExport, 512, 512, `${name}-512px.png`);
    showToast('Downloaded 512px transparent PNG', 'info');
  });

  downloadPng1024Btn.addEventListener('click', async () => {
    const svgToExport = getActiveSvg();
    const name = sanitizeFilename(brandNameInput.value || 'vectorforge-logo');
    await downloadPngFromSvg(svgToExport, 1024, 1024, `${name}-1024px.png`);
    showToast('Downloaded 1024px transparent PNG', 'info');
  });

  downloadIcoBtn.addEventListener('click', async () => {
    const name = sanitizeFilename(brandNameInput.value || 'vectorforge');
    await downloadFaviconIco(currentVectorSvg, `${name}-favicon.ico`);
    showToast('Downloaded multi-resolution Favicon (.ICO)', 'info');
  });

  // Modals Open/Close
  hardwareStatusBtn.addEventListener('click', () => openModal(hardwareModal));
  storageStatusBtn.addEventListener('click', () => openModal(storageModal));
  sampleGalleryBtn.addEventListener('click', () => openModal(galleryModal));
  helpModalBtn.addEventListener('click', () => openModal(guideModal));
  benchmarkBtn.addEventListener('click', () => openModal(benchmarkModal));

  startBenchmarkBtn.addEventListener('click', runBenchmarkSuite);

  document.querySelectorAll('[data-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const modalId = (btn as HTMLElement).dataset.close!;
      closeModal(document.getElementById(modalId)!);
    });
  });

  // Modal Backdrop click to close
  [hardwareModal, storageModal, galleryModal, guideModal, benchmarkModal].forEach((modal) => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // Storage Modal Actions
  streamWeightsBtn.addEventListener('click', () => {
    worker.postMessage({ type: 'STREAM_WEIGHTS' } as WorkerRequest);
  });

  clearWeightsBtn.addEventListener('click', () => {
    worker.postMessage({ type: 'CLEAR_CACHE' } as WorkerRequest);
  });
}

async function runBenchmarkSuite() {
  startBenchmarkBtn.disabled = true;
  benchStatusLabel.textContent = 'Running benchmark suite...';
  benchProgressFill.style.width = '10%';
  benchmarkResultsPanel.style.display = 'none';

  try {
    const metrics = await runHardwareBenchmark((stage, percent) => {
      benchStatusLabel.textContent = stage;
      benchProgressFill.style.width = `${percent}%`;
    });

    renderBenchmarkResults(metrics);
    showToast(`Benchmark complete: ${metrics.tierName}`, 'success');
  } catch (err) {
    benchStatusLabel.textContent = `Benchmark failed: ${(err as Error).message}`;
    showToast('Benchmark encountered an error', 'error');
  } finally {
    startBenchmarkBtn.disabled = false;
  }
}

function renderBenchmarkResults(m: BenchmarkMetrics) {
  benchmarkResultsPanel.style.display = 'flex';
  benchStatusLabel.textContent = `Completed in Tier: ${m.tierName}`;
  benchProgressFill.style.width = '100%';

  tierBadge.textContent = m.tierName.toUpperCase();
  tierScore.textContent = `Score: ${m.totalScore.toLocaleString()} / 10,000`;
  tierDesc.textContent = m.tierDescription;
  tierRecPill.textContent = `Recommended Engine: ${m.recommendedMode === 'webgpu-onnx' ? '🧠 SD-Turbo ONNX WebGPU' : '⚡ Turbo Vector Synth'}`;

  metricGpuScore.textContent = `${m.gpuComputeScore.toLocaleString()}`;
  metricGflops.textContent = `${m.gpuShaderGflopsEstimate} GFLOPS`;
  metricBufferLimit.textContent = `${m.maxStorageBufferMB} MB`;
  metricTraceLatency.textContent = `${m.vectorizerLatencyMs} ms`;
  metricKnockoutSpeed.textContent = `${m.alphaKnockoutThroughputMPps} MP/s`;
  metricOpfsSpeed.textContent = `${m.opfsSpeedMBps} MB/s`;

  if (m.bottlenecks.length > 0) {
    benchBottlenecksBox.style.display = 'flex';
    benchBottleneckList.innerHTML = m.bottlenecks.map((b) => `<li>${b}</li>`).join('');
  } else {
    benchBottlenecksBox.style.display = 'none';
  }
}

function setColor(hex: string) {
  currentColorHex = hex;
  customColorPicker.value = hex;
  customColorHex.value = hex.toUpperCase();

  // Instant real-time recolor
  if (currentVectorSvg) {
    currentVectorSvg = recolorSvg(currentVectorSvg, hex);
    canvasController.setSvg(currentVectorSvg);
    updateBrandTypography();
  }
}

function getActiveSvg(): string {
  // If in Brand Mockup view mode, export composite brand mockup; otherwise export pure mark
  const activeTab = document.querySelector('.view-tab.active') as HTMLElement;
  if (activeTab && activeTab.dataset.mode === 'brand' && currentBrandSvg) {
    return currentBrandSvg;
  }
  return currentVectorSvg;
}

function sanitizeFilename(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9_-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || 'vectorforge';
}

function openModal(modal: HTMLElement) {
  modal.classList.add('active');
}

function closeModal(modal: HTMLElement) {
  modal.classList.remove('active');
}

function loadConcept(concept: typeof SAMPLE_CONCEPTS[0]) {
  promptInput.value = concept.keyword;
  seedInput.value = `${concept.seed}`;
  brandNameInput.value = concept.brandName;
  taglineInput.value = concept.tagline;

  // Set style
  currentStyle = concept.style;
  document.querySelectorAll('.preset-card').forEach((c) => {
    c.classList.toggle('active', (c as HTMLElement).dataset.preset === concept.style);
  });

  // Set color
  setColor(concept.color);

  closeModal(galleryModal);
  runGeneration();
}

function populateSampleGallery() {
  sampleGalleryGrid.innerHTML = '';
  SAMPLE_CONCEPTS.forEach((concept) => {
    const card = document.createElement('div');
    card.className = 'gallery-card';
    card.innerHTML = `
      <div class="gallery-preview-mini">
        <span style="font-size: 34px;">${STYLE_PRESETS[concept.style]?.icon || '✨'}</span>
      </div>
      <div class="gallery-card-title">${concept.title}</div>
      <div class="gallery-card-preset">${STYLE_PRESETS[concept.style]?.name || concept.style} • ${concept.brandName}</div>
    `;
    card.addEventListener('click', () => loadConcept(concept));
    sampleGalleryGrid.appendChild(card);
  });
}

function showToast(message: string, type: 'info' | 'success' | 'error' = 'info') {
  const toast = document.createElement('div');
  toast.className = 'toast';
  const icon = type === 'success' ? '✨' : type === 'error' ? '⚠️' : 'ℹ️';
  toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(12px)';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

// Start Application
init();
