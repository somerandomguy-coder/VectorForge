import os from 'node:os';
import { generateMcpLogo } from './engine.js';
import { SoftwareRasterizer } from './rasterizer.js';
import { traceBitmap } from '../postprocess/potrace/index.js';

async function runCliBenchmark() {
  console.log('\n======================================================');
  console.log('   ⚡ VectorForge Hardware Benchmark & System Profiler');
  console.log('======================================================\n');

  // System Specs
  const cpus = os.cpus();
  const totalMemGB = (os.totalmem() / (1024 ** 3)).toFixed(1);
  const freeMemGB = (os.freemem() / (1024 ** 3)).toFixed(1);
  const cpuModel = cpus.length > 0 ? cpus[0].model : 'Unknown CPU';
  const cpuCores = cpus.length;

  console.log('🖥️ Host System Profile:');
  console.log(`   - CPU: ${cpuModel} (${cpuCores} cores)`);
  console.log(`   - RAM: ${totalMemGB} GB total (${freeMemGB} GB available)`);
  console.log(`   - Platform: ${os.platform()} ${os.arch()} (Node.js ${process.version})\n`);

  console.log('⏳ Running Benchmark Suite (50 iterations)...');
  const startTime = performance.now();

  // Test 1: Rasterizer Throughput
  const rasterStart = performance.now();
  const rasterIterations = 100;
  for (let i = 0; i < rasterIterations; i++) {
    const raster = new SoftwareRasterizer(512, 512);
    raster.fillRect(100, 100, 312, 312, 1);
    raster.fillCircle(256, 256, 120, 0);
  }
  const rasterTime = performance.now() - rasterStart;
  const rasterOpsPerSec = Math.round((rasterIterations / (rasterTime / 1000)));

  // Test 2: Full VectorForge Logo Pipeline
  const logoStart = performance.now();
  const logoIterations = 25;
  let totalPaths = 0;
  for (let i = 0; i < logoIterations; i++) {
    const res = generateMcpLogo({
      prompt: 'vectorforge emblem, geometric anvil and vector nodes',
      style: 'geometric-badge',
      brandName: 'VECTORFORGE',
      tagline: 'STUDIO & LABS',
    });
    totalPaths += res.pathCount;
  }
  const logoTime = performance.now() - logoStart;
  const avgLogoLatencyMs = parseFloat((logoTime / logoIterations).toFixed(2));
  const totalTime = Math.round(performance.now() - startTime);

  console.log('\n📊 Benchmark Results:');
  console.log(`   - Geometric Rasterization: ${rasterOpsPerSec.toLocaleString()} frames/sec`);
  console.log(`   - Average Logo Generation & Tracing Latency: ${avgLogoLatencyMs} ms`);
  console.log(`   - Vector Paths per Mark: ~${Math.round(totalPaths / logoIterations)} paths`);
  console.log(`   - Total Benchmark Duration: ${totalTime} ms\n`);

  // Spec Tier Evaluation
  console.log('------------------------------------------------------');
  console.log('📋 VectorForge System Requirements Matrix:');
  console.log('------------------------------------------------------');
  console.log('1. TURBO VECTOR SYNTH & TRACING (Zero-Cloud Instant Engine):');
  console.log('   - Minimum Spec:  Dual-core CPU, 2 GB RAM, Any browser (Works on 100% of devices)');
  console.log('   - Expected Latency: 10 - 45 ms per vector mark');
  console.log('\n2. WEBGPU ONNX DIFFUSION (SD-Turbo Distilled 1-Step Model):');
  console.log('   - Minimum Spec:  Quad-core CPU, 8 GB RAM, Integrated GPU (Intel Iris Xe / AMD Radeon 680M / Apple M1)');
  console.log('                    WebGPU support, Max Storage Buffer >= 1024 MB');
  console.log('                    Expected Latency: 3.5s - 7.5s');
  console.log('   - Desired Spec:  8-Core modern CPU, 16 GB RAM, Dedicated GPU (NVIDIA RTX 3060/4060+ / Apple M2/M3 Pro)');
  console.log('                    Native FP16 shader support (shader-f16), Max Storage Buffer >= 2048 MB');
  console.log('                    Expected Latency: 0.8s - 1.8s');
  console.log('======================================================\n');
}

runCliBenchmark().catch(console.error);
