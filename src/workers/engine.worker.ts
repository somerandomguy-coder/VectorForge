import { inspectHardware } from './hardware-check';
import { 
  inspectStorageCache, 
  streamWeightsToStorage, 
  clearCachedWeights 
} from './storage-manager';
import { generateProceduralLogo } from './procedural-engine';
import { runDiffusionInference } from './onnx-pipeline';
import type { WorkerRequest, WorkerResponse } from './rpc-protocol';

let activeAbortController: AbortController | null = null;

// Handle messages from Main UI Thread
self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;

  try {
    switch (request.type) {
      case 'CHECK_HARDWARE': {
        const result = await inspectHardware();
        postResponse({ type: 'HARDWARE_STATUS', result });
        break;
      }

      case 'CHECK_STORAGE': {
        const status = await inspectStorageCache();
        postResponse({
          type: 'STORAGE_STATUS',
          isCached: status.isCached,
          cacheSizeBytes: status.cacheSizeBytes,
          quotaBytes: status.quotaBytes,
          usageBytes: status.usageBytes,
        });
        break;
      }

      case 'STREAM_WEIGHTS': {
        activeAbortController = new AbortController();
        const success = await streamWeightsToStorage(
          request.modelUrl || '',
          (progress) => {
            postResponse({
              type: 'DOWNLOAD_PROGRESS',
              stage: progress.stage,
              loadedBytes: progress.loadedBytes,
              totalBytes: progress.totalBytes,
              speedMBps: progress.speedMBps,
              percent: progress.percent,
            });
          },
          activeAbortController.signal
        );

        postResponse({
          type: 'DOWNLOAD_COMPLETE',
          success,
          message: success ? 'Weights saved to OPFS successfully' : 'Download stopped',
        });
        break;
      }

      case 'CLEAR_CACHE': {
        const success = await clearCachedWeights();
        postResponse({ type: 'CACHE_CLEARED', success });
        break;
      }

      case 'GENERATE': {
        const startTime = performance.now();
        const { params } = request;

        postResponse({
          type: 'PROGRESS_UPDATE',
          stage: 'Initializing generation...',
          step: 1,
          totalSteps: 4,
          percent: 25,
        });

        let bitmap: ImageBitmap;
        let engineUsed: string = params.engineMode;

        if (params.engineMode === 'webgpu-onnx') {
          try {
            bitmap = await runDiffusionInference(params, (step, total, msg) => {
              postResponse({
                type: 'PROGRESS_UPDATE',
                stage: msg,
                step,
                totalSteps: total,
                percent: Math.round((step / total) * 100),
              });
            });
          } catch (err) {
            console.warn('WebGPU ONNX run error, fallback to procedural synth:', err);
            engineUsed = 'turbo-synth (fallback)';
            bitmap = await generateProceduralLogo(params);
          }
        } else {
          // Instant procedural synth
          postResponse({
            type: 'PROGRESS_UPDATE',
            stage: 'Synthesizing vector mark silhouette...',
            step: 3,
            totalSteps: 4,
            percent: 75,
          });
          bitmap = await generateProceduralLogo(params);
        }

        const elapsed = Math.round(performance.now() - startTime);

        // Transfer ImageBitmap without copying memory
        (self as any).postMessage(
          {
            type: 'GENERATE_COMPLETE',
            bitmap,
            inferenceTimeMs: elapsed,
            engineUsed,
            seedUsed: params.seed,
          } as WorkerResponse,
          [bitmap]
        );
        break;
      }

      case 'ABORT': {
        if (activeAbortController) {
          activeAbortController.abort();
          activeAbortController = null;
        }
        break;
      }

      default:
        console.warn('Unknown worker request:', request);
    }
  } catch (error) {
    const err = error as Error;
    postResponse({
      type: 'ERROR',
      message: err.message || 'Unknown worker error occurred',
      fatal: false,
    });
  }
};

function postResponse(response: WorkerResponse) {
  self.postMessage(response);
}
