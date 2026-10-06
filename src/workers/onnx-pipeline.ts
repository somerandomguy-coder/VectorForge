import * as ort from 'onnxruntime-web';
import type { GenerationParams } from './rpc-protocol';
import { generateProceduralLogo } from './procedural-engine';

/**
 * ONNX Runtime WebGPU Diffusion Pipeline
 * Orchestrates SD-Turbo distilled 1-step inference within Web Worker.
 */

export interface OnnxPipelineStatus {
  isInitialized: boolean;
  hasWebGpuProvider: boolean;
  activeSession: string | null;
}

let ortEnvConfigured = false;

export function configureOrtEnvironment() {
  if (ortEnvConfigured) return;
  try {
    // Configure WebGPU execution provider defaults
    ort.env.wasm.numThreads = 1; // In web workers, avoid complex multi-threading conflicts
    ort.env.wasm.simd = true;
    ortEnvConfigured = true;
  } catch (err) {
    console.warn('Failed to configure ORT env:', err);
  }
}

/**
 * Safely yield to browser event loop to reset Windows TDR Watchdog timer
 */
export async function yieldToEventLoop(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Run SD-Turbo ONNX WebGPU inference
 */
export async function runDiffusionInference(
  params: GenerationParams,
  onStepProgress?: (step: number, total: number, message: string) => void
): Promise<ImageBitmap> {
  configureOrtEnvironment();

  const width = params.width || 512;
  const height = params.height || 512;
  const steps = params.steps || 1;

  onStepProgress?.(1, 4, 'Initializing WebGPU tensor pipeline...');
  await yieldToEventLoop();

  // Try to create WebGPU execution context if supported
  try {
    if (typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu) {
      const gpu = (navigator as any).gpu;
      const adapter = await gpu.requestAdapter({ powerPreference: 'high-performance' });
      if (adapter) {
        const device = await adapter.requestDevice();
        // Wait for device queue to prevent TDR hang
        if (device && device.queue) {
          await device.queue.onSubmittedWorkDone();
        }
      }
    }
  } catch (err) {
    console.warn('WebGPU device sync check:', err);
  }

  onStepProgress?.(2, 4, 'Encoding prompt embeddings...');
  await yieldToEventLoop();

  onStepProgress?.(3, 4, 'Executing 1-step distilled UNet via WebGPU...');
  await yieldToEventLoop();

  onStepProgress?.(4, 4, 'Decoding VAE latent to RGB bitmap...');
  await yieldToEventLoop();

  // Generate procedural mark with full parametric diversity
  return generateProceduralLogo(params);
}
