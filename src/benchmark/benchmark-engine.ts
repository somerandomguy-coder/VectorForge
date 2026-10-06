import { traceBitmap, getSVG } from '../postprocess/potrace/index.js';
import Bitmap from '../postprocess/potrace/Bitmap.js';

export type DeviceTier = 'tier-1-elite' | 'tier-2-recommended' | 'tier-3-entry' | 'tier-4-fallback';

export interface BenchmarkMetrics {
  hasWebGPU: boolean;
  hasFp16: boolean;
  maxStorageBufferMB: number;
  gpuComputeScore: number; // 0 - 10000
  gpuShaderGflopsEstimate: number;
  vectorizerLatencyMs: number;
  alphaKnockoutThroughputMPps: number; // Megapixels per second
  opfsSpeedMBps: number;
  totalScore: number;
  tier: DeviceTier;
  tierName: string;
  tierDescription: string;
  recommendedMode: 'webgpu-onnx' | 'turbo-synth';
  bottlenecks: string[];
}

export type BenchmarkProgressCallback = (stage: string, percent: number) => void;

/**
 * Runs comprehensive client-side hardware and pipeline benchmark
 */
export async function runHardwareBenchmark(
  onProgress?: BenchmarkProgressCallback
): Promise<BenchmarkMetrics> {
  const bottlenecks: string[] = [];

  // --- Step 1: WebGPU Capabilities & Memory Allocation (30%) ---
  onProgress?.('Inspecting WebGPU compute and buffer allocation...', 15);
  await yieldTick();

  let hasWebGPU = false;
  let hasFp16 = false;
  let maxStorageBufferMB = 0;
  let gpuComputeScore = 0;
  let gpuShaderGflopsEstimate = 0;

  if (typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu) {
    try {
      hasWebGPU = true;
      const gpu = (navigator as any).gpu;
      const adapter = await gpu.requestAdapter({ powerPreference: 'high-performance' });

      if (adapter) {
        hasFp16 = adapter.features.has('shader-f16');
        maxStorageBufferMB = Math.round(adapter.limits.maxStorageBufferBindingSize / (1024 * 1024));

        if (!hasFp16) {
          bottlenecks.push('No shader-f16 support: 16-bit float shaders will run via FP32 emulation.');
        }

        if (maxStorageBufferMB < 1024) {
          bottlenecks.push(`Max buffer size (${maxStorageBufferMB} MB) is below 1 GB; large UNet layers may encounter allocation limits.`);
        }

        // Test GPU Compute with WGSL shader dispatch
        const device = await adapter.requestDevice({
          requiredFeatures: hasFp16 ? ['shader-f16'] : [],
        });

        if (device) {
          const computeStart = performance.now();
          const workSize = 65536;

          // Simple WGSL matrix compute kernel
          const shaderCode = `
            @group(0) @binding(0) var<storage, read_write> data: array<f32>;
            @compute @workgroup_size(64)
            fn main(@builtin(global_invocation_id) id: vec3<u32>) {
              let idx = id.x;
              var val = data[idx];
              for (var i = 0u; i < 200u; i = i + 1u) {
                val = val * 1.0001 + 0.0005;
              }
              data[idx] = val;
            }
          `;

          const GPU_BUFFER_STORAGE = 0x0080;
          const GPU_BUFFER_COPY_SRC = 0x0004;
          const GPU_BUFFER_COPY_DST = 0x0008;
          const GPU_SHADER_COMPUTE = 0x4;

          const shaderModule = device.createShaderModule({ code: shaderCode });
          const buffer = device.createBuffer({
            size: workSize * 4,
            usage: GPU_BUFFER_STORAGE | GPU_BUFFER_COPY_SRC | GPU_BUFFER_COPY_DST,
          });

          const bindGroupLayout = device.createBindGroupLayout({
            entries: [{ binding: 0, visibility: GPU_SHADER_COMPUTE, buffer: { type: 'storage' } }],
          });

          const pipeline = device.createComputePipeline({
            layout: device.createPipelineLayout({ bindGroupLayouts: [bindGroupLayout] }),
            compute: { module: shaderModule, entryPoint: 'main' },
          });

          const bindGroup = device.createBindGroup({
            layout: bindGroupLayout,
            entries: [{ binding: 0, resource: { buffer } }],
          });

          const commandEncoder = device.createCommandEncoder();
          const pass = commandEncoder.beginComputePass();
          pass.setPipeline(pipeline);
          pass.setBindGroup(0, bindGroup);
          pass.dispatchWorkgroups(workSize / 64);
          pass.end();

          device.queue.submit([commandEncoder.finish()]);
          await device.queue.onSubmittedWorkDone();

          const computeElapsed = Math.max(1, performance.now() - computeStart);
          // Estimate GFLOPS: workSize * 200 ops * 2 flops / elapsed_seconds / 1e9
          const totalFlops = workSize * 200 * 2;
          gpuShaderGflopsEstimate = parseFloat(((totalFlops / (computeElapsed / 1000)) / 1e9).toFixed(2));
          gpuComputeScore = Math.min(10000, Math.round(gpuShaderGflopsEstimate * 150 + (hasFp16 ? 2000 : 500)));

          buffer.destroy();
          device.destroy();
        }
      } else {
        bottlenecks.push('No suitable WebGPU adapter acquired.');
      }
    } catch (e) {
      bottlenecks.push(`WebGPU test warning: ${(e as Error).message}`);
    }
  } else {
    bottlenecks.push('WebGPU API unavailable in this browser environment.');
  }

  // --- Step 2: Alpha Knockout & Luminance Binarization (55%) ---
  onProgress?.('Benchmarking Alpha Knockout pixel throughput...', 50);
  await yieldTick();

  const testSize = 512;
  const pixelCount = testSize * testSize;
  const rawBytes = new Uint8ClampedArray(pixelCount * 4);
  for (let i = 0; i < rawBytes.length; i += 4) {
    rawBytes[i] = (i % 255);
    rawBytes[i + 1] = ((i * 3) % 255);
    rawBytes[i + 2] = ((i * 7) % 255);
    rawBytes[i + 3] = 255;
  }

  const knockoutStart = performance.now();
  const iterations = 8;
  for (let iter = 0; iter < iterations; iter++) {
    for (let i = 0; i < rawBytes.length; i += 4) {
      const lum = 0.299 * rawBytes[i] + 0.587 * rawBytes[i + 1] + 0.114 * rawBytes[i + 2];
      rawBytes[i + 3] = lum > 200 ? 0 : 255;
    }
  }
  const knockoutElapsed = Math.max(1, performance.now() - knockoutStart);
  const totalPixelsProcessed = (pixelCount * iterations) / 1e6;
  const alphaKnockoutThroughputMPps = parseFloat((totalPixelsProcessed / (knockoutElapsed / 1000)).toFixed(1));

  // --- Step 3: Potrace Vector Tracing Latency (80%) ---
  onProgress?.('Benchmarking Potrace vector tracing speed...', 75);
  await yieldTick();

  const testBitmap = new Bitmap(testSize, testSize);
  // Generate multi-polygon test pattern
  for (let y = 100; y < 400; y++) {
    for (let x = 100; x < 400; x++) {
      if ((x - 256) ** 2 + (y - 256) ** 2 < 120 ** 2) {
        testBitmap.data[y * testSize + x] = 1;
      }
    }
  }

  const traceStart = performance.now();
  const paths = traceBitmap(testBitmap, { turdsize: 3, optcurve: true, opttolerance: 0.2 });
  const rawSvg = getSVG(paths, 1);
  const vectorizerLatencyMs = Math.round(performance.now() - traceStart);

  if (vectorizerLatencyMs > 60) {
    bottlenecks.push(`Vector tracing latency (${vectorizerLatencyMs} ms) is slower than expected.`);
  }

  // --- Step 4: OPFS Storage Bandwidth (95%) ---
  onProgress?.('Testing OPFS local storage I/O bandwidth...', 90);
  await yieldTick();

  let opfsSpeedMBps = 120; // Default simulated/baseline
  if (typeof navigator !== 'undefined' && navigator.storage && typeof navigator.storage.getDirectory === 'function') {
    try {
      const root = await navigator.storage.getDirectory();
      const testHandle = await root.getFileHandle('benchmark-temp.bin', { create: true });
      const writable = await testHandle.createWritable();

      const testChunkSize = 4 * 1024 * 1024; // 4 MB chunk
      const testData = new Uint8Array(testChunkSize);
      const ioStart = performance.now();

      await writable.write(testData);
      await writable.close();

      const ioElapsed = Math.max(1, performance.now() - ioStart);
      opfsSpeedMBps = parseFloat(((testChunkSize / (1024 * 1024)) / (ioElapsed / 1000)).toFixed(1));

      // Cleanup
      await root.removeEntry('benchmark-temp.bin');
    } catch {
      opfsSpeedMBps = 45; // Sandbox fallback
    }
  }

  // --- Step 5: Score Computation & Tier Classification (100%) ---
  onProgress?.('Calculating hardware tier profile...', 100);
  await yieldTick();

  let totalScore = 0;
  // GPU compute contribution (0 - 5500)
  totalScore += Math.min(5500, gpuComputeScore * 0.7);
  // Vectorizer latency contribution (0 - 2500): faster latency = higher score
  totalScore += Math.min(2500, Math.max(0, 2500 - vectorizerLatencyMs * 40));
  // Pixel throughput contribution (0 - 1500)
  totalScore += Math.min(1500, alphaKnockoutThroughputMPps * 15);
  // OPFS I/O contribution (0 - 500)
  totalScore += Math.min(500, opfsSpeedMBps * 4);

  totalScore = Math.min(10000, Math.round(totalScore));

  // Determine Tier
  let tier: DeviceTier;
  let tierName: string;
  let tierDescription: string;
  let recommendedMode: 'webgpu-onnx' | 'turbo-synth';

  if (hasWebGPU && hasFp16 && maxStorageBufferMB >= 1024 && totalScore >= 6000) {
    tier = 'tier-1-elite';
    tierName = 'Tier 1: Elite Dedicated GPU';
    tierDescription = 'Optimal for 1-Step SD-Turbo WebGPU Diffusion. High VRAM headroom and native FP16 shader execution.';
    recommendedMode = 'webgpu-onnx';
  } else if (hasWebGPU && maxStorageBufferMB >= 512 && totalScore >= 3500) {
    tier = 'tier-2-recommended';
    tierName = 'Tier 2: Capable Integrated / Entry GPU';
    tierDescription = 'Well-suited for WebGPU Diffusion and sub-second vector tracing. Supports 1-2 step generation cleanly.';
    recommendedMode = 'webgpu-onnx';
  } else if (hasWebGPU) {
    tier = 'tier-3-entry';
    tierName = 'Tier 3: Resource-Constrained GPU';
    tierDescription = 'WebGPU is available but constrained by buffer limits or lack of FP16. Turbo Vector Synth recommended for instant latency.';
    recommendedMode = 'turbo-synth';
  } else {
    tier = 'tier-4-fallback';
    tierName = 'Tier 4: Software / CPU Fallback';
    tierDescription = 'Runs at lightning speed (<30ms) using VectorForge’s built-in Turbo Vector Synth & Potrace engine without needing WebGPU.';
    recommendedMode = 'turbo-synth';
  }

  return {
    hasWebGPU,
    hasFp16,
    maxStorageBufferMB,
    gpuComputeScore,
    gpuShaderGflopsEstimate,
    vectorizerLatencyMs,
    alphaKnockoutThroughputMPps,
    opfsSpeedMBps,
    totalScore,
    tier,
    tierName,
    tierDescription,
    recommendedMode,
    bottlenecks,
  };
}

function yieldTick(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 20));
}
