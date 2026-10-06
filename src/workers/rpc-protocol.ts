// Typed Worker RPC Protocol between Main Thread and WebGPU Worker

export type LogoStyle = 'minimal-vector' | 'app-icon' | 'monogram' | 'geometric-badge';

export interface HardwareInspectionResult {
  hasWebGPU: boolean;
  hasFp16: boolean;
  maxStorageBufferBindingSize: number; // in bytes
  isStorageBufferSufficient: boolean; // >= 1GB (1073741824)
  vendor?: string;
  architecture?: string;
  description?: string;
  storageQuotaBytes: number;
  storageUsageBytes: number;
  opfsSupported: boolean;
  notes: string[];
}

export interface GenerationParams {
  prompt: string;
  style: LogoStyle;
  seed: number;
  steps: number;
  guidanceScale?: number;
  width?: number;
  height?: number;
  engineMode: 'turbo-synth' | 'webgpu-onnx';
}

export type WorkerRequest =
  | { type: 'CHECK_HARDWARE' }
  | { type: 'CHECK_STORAGE' }
  | { type: 'STREAM_WEIGHTS'; modelUrl?: string }
  | { type: 'CLEAR_CACHE' }
  | { type: 'INIT_ENGINE'; modelUrl?: string }
  | { type: 'GENERATE'; params: GenerationParams }
  | { type: 'ABORT' };

export type WorkerResponse =
  | { type: 'HARDWARE_STATUS'; result: HardwareInspectionResult }
  | { type: 'STORAGE_STATUS'; isCached: boolean; cacheSizeBytes: number; quotaBytes: number; usageBytes: number }
  | { type: 'DOWNLOAD_PROGRESS'; stage: string; loadedBytes: number; totalBytes: number; speedMBps: number; percent: number }
  | { type: 'DOWNLOAD_COMPLETE'; success: boolean; message: string }
  | { type: 'CACHE_CLEARED'; success: boolean }
  | { type: 'ENGINE_READY'; mode: string }
  | { type: 'PROGRESS_UPDATE'; stage: string; step: number; totalSteps: number; percent: number }
  | { type: 'PREVIEW_FRAME'; bitmap: ImageBitmap; step: number }
  | { 
      type: 'GENERATE_COMPLETE'; 
      bitmap: ImageBitmap; 
      inferenceTimeMs: number; 
      engineUsed: string; 
      seedUsed: number;
    }
  | { type: 'ERROR'; message: string; fatal: boolean };
