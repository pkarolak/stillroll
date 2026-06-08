import type { ExportQuality } from '../../workers/packageWorker'
import type { StillrollManifest } from './manifest'

type WorkerOut =
  | { type: 'export-slide-done'; index: number }
  | { type: 'export-done'; buffer: ArrayBuffer }
  | {
      type: 'import-done'
      manifest: StillrollManifest
      slides: Array<{ filename: string; buffer: ArrayBuffer; mime: string }>
      overlayBuffer?: ArrayBuffer
    }
  | { type: 'error'; code: string }

function createWorker(): Worker {
  return new Worker(new URL('../../workers/packageWorker.ts', import.meta.url), {
    type: 'module',
  })
}

function waitForMessage<T extends WorkerOut['type']>(
  worker: Worker,
  expected: T,
): Promise<Extract<WorkerOut, { type: T }>> {
  return new Promise((resolve, reject) => {
    const onMessage = (event: MessageEvent<WorkerOut>) => {
      const data = event.data
      if (data.type === 'error') {
        cleanup()
        reject(new Error(data.code))
        return
      }
      if (data.type === expected) {
        cleanup()
        resolve(data as Extract<WorkerOut, { type: T }>)
      }
    }
    const onError = () => {
      cleanup()
      reject(new Error('WORKER_CRASHED'))
    }
    const cleanup = () => {
      worker.removeEventListener('message', onMessage)
      worker.removeEventListener('error', onError)
    }
    worker.addEventListener('message', onMessage)
    worker.addEventListener('error', onError)
  })
}

export async function runExportInWorker(
  manifest: StillrollManifest,
  slides: Array<{
    archiveName: string
    mime: string
    quality: ExportQuality
    buffer: ArrayBuffer
  }>,
  onProgress: (done: number, total: number) => void,
  overlayBuffer?: ArrayBuffer,
): Promise<Blob> {
  const worker = createWorker()
  try {
    worker.postMessage({ type: 'export-init' })

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]
      const pending = waitForMessage(worker, 'export-slide-done')
      worker.postMessage(
        {
          type: 'export-slide',
          index: i,
          total: slides.length,
          archiveName: slide.archiveName,
          mime: slide.mime,
          quality: slide.quality,
          buffer: slide.buffer,
        },
        [slide.buffer],
      )
      await pending
      onProgress(i + 1, slides.length)
    }

    const pending = waitForMessage(worker, 'export-done')
    const finalizeMsg = {
      type: 'export-finalize' as const,
      manifest,
      ...(overlayBuffer ? { overlayBuffer } : {}),
    }
    if (overlayBuffer) {
      worker.postMessage(finalizeMsg, [overlayBuffer])
    } else {
      worker.postMessage(finalizeMsg)
    }
    const result = await pending
    return new Blob([result.buffer], { type: 'application/zip' })
  } finally {
    worker.terminate()
  }
}

export async function runImportInWorker(
  file: File,
): Promise<{
  manifest: StillrollManifest
  slides: Array<{ filename: string; buffer: ArrayBuffer; mime: string }>
  overlayBuffer?: ArrayBuffer
}> {
  const worker = createWorker()
  try {
    const buffer = await file.arrayBuffer()
    const pending = waitForMessage(worker, 'import-done')
    worker.postMessage(
      { type: 'import', archiveSize: file.size, buffer },
      [buffer],
    )
    const result = await pending
    return {
      manifest: result.manifest,
      slides: result.slides,
      ...(result.overlayBuffer ? { overlayBuffer: result.overlayBuffer } : {}),
    }
  } finally {
    worker.terminate()
  }
}
