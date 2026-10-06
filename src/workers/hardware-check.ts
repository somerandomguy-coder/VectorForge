import type { HardwareInspectionResult } from './rpc-protocol';

/**
 * Checks client WebGPU support, shader-f16 features, buffer limits, and storage quota.
 */
export async function inspectHardware(): Promise<HardwareInspectionResult> {
  const notes: string[] = [];
  let hasWebGPU = false;
  let hasFp16 = false;
  let maxStorageBufferBindingSize = 0;
  let isStorageBufferSufficient = false;
  let vendor = 'Unknown';
  let architecture = 'Unknown';
  let description = 'Unknown GPU Device';
  let storageQuotaBytes = 0;
  let storageUsageBytes = 0;
  let opfsSupported = false;

  // 1. Inspect Storage & OPFS
  try {
    if (typeof navigator !== 'undefined' && navigator.storage) {
      if (typeof navigator.storage.getDirectory === 'function') {
        opfsSupported = true;
      }
      const estimate = await navigator.storage.estimate();
      storageQuotaBytes = estimate.quota || 0;
      storageUsageBytes = estimate.usage || 0;
    }
  } catch (err) {
    notes.push(`Storage check warning: ${(err as Error).message}`);
  }

  // 2. Inspect WebGPU
  if (typeof navigator === 'undefined' || !('gpu' in navigator) || !navigator.gpu) {
    notes.push('WebGPU is not supported in this browser. Running with Turbo Vector Engine fallback.');
    return {
      hasWebGPU: false,
      hasFp16: false,
      maxStorageBufferBindingSize: 0,
      isStorageBufferSufficient: false,
      vendor: 'Unavailable',
      architecture: 'N/A',
      description: 'WebGPU Unsupported',
      storageQuotaBytes,
      storageUsageBytes,
      opfsSupported,
      notes,
    };
  }

  try {
    hasWebGPU = true;
    const gpu = (navigator as any).gpu;
    const adapter = await gpu.requestAdapter({
      powerPreference: 'high-performance',
    });

    if (!adapter) {
      notes.push('WebGPU is supported, but no compatible graphics adapter could be acquired.');
      return {
        hasWebGPU: true,
        hasFp16: false,
        maxStorageBufferBindingSize: 0,
        isStorageBufferSufficient: false,
        vendor: 'No Adapter Found',
        architecture: 'N/A',
        description: 'Unable to acquire WebGPU adapter',
        storageQuotaBytes,
        storageUsageBytes,
        opfsSupported,
        notes,
      };
    }

    // Inspect Adapter Info
    try {
      // Modern WebGPU provides adapter.info or adapter.requestAdapterInfo()
      if ('info' in adapter && adapter.info) {
        vendor = adapter.info.vendor || 'Unknown';
        architecture = adapter.info.architecture || 'Unknown';
        description = adapter.info.description || `${vendor} GPU`;
      } else if ('requestAdapterInfo' in adapter && typeof (adapter as any).requestAdapterInfo === 'function') {
        const info = await (adapter as any).requestAdapterInfo();
        vendor = info.vendor || 'Unknown';
        architecture = info.architecture || 'Unknown';
        description = info.description || `${vendor} GPU`;
      }
    } catch {
      vendor = 'Detected WebGPU Adapter';
    }

    // Check Features: shader-f16
    hasFp16 = adapter.features.has('shader-f16');
    if (hasFp16) {
      notes.push('FP16 Half-Precision Shaders (shader-f16) are supported for high performance.');
    } else {
      notes.push('FP16 Shaders not available. Fallback to FP32 emulation enabled.');
    }

    // Check Limits: maxStorageBufferBindingSize
    maxStorageBufferBindingSize = adapter.limits.maxStorageBufferBindingSize;
    // 1 GB threshold = 1073741824 bytes
    const ONE_GB = 1073741824;
    isStorageBufferSufficient = maxStorageBufferBindingSize >= ONE_GB;

    if (isStorageBufferSufficient) {
      notes.push(`Storage buffer binding size (${(maxStorageBufferBindingSize / (1024 * 1024)).toFixed(0)} MB) is sufficient for large UNet layers.`);
    } else {
      notes.push(`Storage buffer limit (${(maxStorageBufferBindingSize / (1024 * 1024)).toFixed(0)} MB) is below 1GB recommendation.`);
    }

  } catch (err) {
    notes.push(`WebGPU inspection error: ${(err as Error).message}`);
  }

  return {
    hasWebGPU,
    hasFp16,
    maxStorageBufferBindingSize,
    isStorageBufferSufficient,
    vendor,
    architecture,
    description,
    storageQuotaBytes,
    storageUsageBytes,
    opfsSupported,
    notes,
  };
}
