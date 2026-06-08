import { strToU8, unzip, zip } from 'fflate'
import {
  ALLOWED_MIME_TYPES,
  EVENT_JPEG_QUALITY,
  EVENT_MAX_EDGE,
  MANIFEST_FILENAME,
  OVERLAY_FILENAME,
} from '../utils/offlinePackage/limits'
import {
  parseManifestJson,
  serializeManifest,
  type StillrollManifest,
} from '../utils/offlinePackage/manifest'
import {
  validateExtractedEntry,
  validateManifestAgainstArchive,
  validateUnzipBudget,
  validateZipEntryPath,
} from '../utils/offlinePackage/validatePackage'

export type ExportQuality = 'event' | 'original'

type WorkerIn =
  | { type: 'export-init' }
  | {
      type: 'export-slide'
      index: number
      total: number
      archiveName: string
      mime: string
      quality: ExportQuality
      buffer: ArrayBuffer
    }
  | {
      type: 'export-finalize'
      manifest: StillrollManifest
      overlayBuffer?: ArrayBuffer
    }
  | { type: 'import'; archiveSize: number; buffer: ArrayBuffer }

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

const exportFiles: Record<string, Uint8Array> = {}

async function resizeForEvent(
  buffer: ArrayBuffer,
  mime: string,
): Promise<{ data: Uint8Array; mime: string }> {
  const blob = new Blob([buffer], { type: mime })
  const bitmap = await createImageBitmap(blob)
  const scale = Math.min(1, EVENT_MAX_EDGE / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))

  const canvas = new OffscreenCanvas(width, height)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('CANVAS_UNAVAILABLE')

  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const outBlob = await canvas.convertToBlob({
    type: 'image/jpeg',
    quality: EVENT_JPEG_QUALITY,
  })
  const outBuffer = await outBlob.arrayBuffer()
  return { data: new Uint8Array(outBuffer), mime: 'image/jpeg' }
}

async function processSlide(
  archiveName: string,
  mime: string,
  quality: ExportQuality,
  buffer: ArrayBuffer,
): Promise<void> {
  if (!ALLOWED_MIME_TYPES.has(mime)) {
    throw new Error('SLIDE_MIME_REJECTED')
  }

  if (quality === 'event' && mime !== 'image/gif') {
    const resized = await resizeForEvent(buffer, mime)
    const jpgName = archiveName.replace(/\.[^.]+$/, '.jpg')
    exportFiles[jpgName] = resized.data
    return
  }

  exportFiles[archiveName] = new Uint8Array(buffer)
}

function finalizeExport(
  manifest: StillrollManifest,
  overlayBuffer?: ArrayBuffer,
): Promise<ArrayBuffer> {
  const payload: Record<string, Uint8Array> = {
    [MANIFEST_FILENAME]: strToU8(serializeManifest(manifest)),
  }

  for (const slide of manifest.slides) {
    const data = exportFiles[slide.filename]
    if (!data) throw new Error('EXPORT_MISSING_SLIDE')
    payload[slide.filename] = data
  }

  if (overlayBuffer && overlayBuffer.byteLength > 0) {
    payload[OVERLAY_FILENAME] = new Uint8Array(overlayBuffer)
  }

  return new Promise((resolve, reject) => {
    zip(payload, (err, data) => {
      if (err || !data) {
        reject(err ?? new Error('ZIP_FAILED'))
        return
      }
      resolve(
        data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength),
      )
    })
  })
}

function importArchive(archiveSize: number, buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)

  unzip(bytes, (err, data) => {
    try {
      if (err) throw err
      if (!data) throw new Error('ZIP_EMPTY')

      let totalUncompressed = 0
      let fileCount = 0
      const extracted: Record<string, Uint8Array> = {}

      for (const [path, content] of Object.entries(data)) {
        validateZipEntryPath(path)
        validateExtractedEntry(path, content.byteLength)
        totalUncompressed += content.byteLength
        fileCount += 1
        validateUnzipBudget(archiveSize, totalUncompressed, fileCount)
        extracted[path] = content
      }

      const manifestBytes = extracted[MANIFEST_FILENAME]
      if (!manifestBytes) throw new Error('MANIFEST_MISSING')

      const manifest = parseManifestJson(
        new TextDecoder().decode(manifestBytes),
      )

      const archivePaths = new Set(Object.keys(extracted))
      const missing = validateManifestAgainstArchive(manifest, archivePaths)
      if (missing.length > 0) throw new Error('MANIFEST_MISSING_FILES')

      const slides = manifest.slides.map((slide) => {
        const content = extracted[slide.filename]
        if (!content) throw new Error('MANIFEST_MISSING_FILES')
        const mime = guessMime(slide.filename)
        if (!ALLOWED_MIME_TYPES.has(mime)) throw new Error('SLIDE_MIME_REJECTED')
        const buffer = content.buffer.slice(
          content.byteOffset,
          content.byteOffset + content.byteLength,
        ) as ArrayBuffer
        return {
          filename: slide.filename,
          buffer,
          mime,
        }
      })

      let overlayBuffer: ArrayBuffer | undefined
      const overlayBytes = extracted[OVERLAY_FILENAME]
      if (overlayBytes) {
        overlayBuffer = overlayBytes.buffer.slice(
          overlayBytes.byteOffset,
          overlayBytes.byteOffset + overlayBytes.byteLength,
        ) as ArrayBuffer
      } else if (
        manifest.config.eventOverlayEnabled &&
        manifest.config.eventOverlay?.templateId === 'custom'
      ) {
        throw new Error('MANIFEST_MISSING_FILES')
      }

      postMessage({
        type: 'import-done',
        manifest,
        slides,
        ...(overlayBuffer ? { overlayBuffer } : {}),
      } satisfies WorkerOut)
    } catch (error) {
      const code = error instanceof Error ? error.message : 'IMPORT_FAILED'
      postMessage({ type: 'error', code } satisfies WorkerOut)
    }
  })
}

function guessMime(filename: string): string {
  const lower = filename.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

self.onmessage = async (event: MessageEvent<WorkerIn>) => {
  try {
    const msg = event.data

    if (msg.type === 'export-init') {
      for (const key of Object.keys(exportFiles)) delete exportFiles[key]
      return
    }

    if (msg.type === 'export-slide') {
      await processSlide(
        msg.archiveName,
        msg.mime,
        msg.quality,
        msg.buffer,
      )
      postMessage({ type: 'export-slide-done', index: msg.index } satisfies WorkerOut)
      return
    }

    if (msg.type === 'export-finalize') {
      const zipBuffer = await finalizeExport(msg.manifest, msg.overlayBuffer)
      postMessage({ type: 'export-done', buffer: zipBuffer } satisfies WorkerOut)
      return
    }

    if (msg.type === 'import') {
      importArchive(msg.archiveSize, msg.buffer)
    }
  } catch (error) {
    const code = error instanceof Error ? error.message : 'WORKER_ERROR'
    postMessage({ type: 'error', code } satisfies WorkerOut)
  }
}
