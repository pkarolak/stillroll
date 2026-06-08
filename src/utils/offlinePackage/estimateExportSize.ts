import type { ImageEntry } from '../../types'
import { resolveSlideFile } from '../slideSource'

const MANIFEST_OVERHEAD_BYTES = 2048
const ZIP_OVERHEAD_RATIO = 1.02

function isGif(path: string): boolean {
  return path.toLowerCase().endsWith('.gif')
}

function estimateEventFileSize(originalBytes: number, path: string): number {
  if (isGif(path)) return originalBytes
  if (originalBytes <= 150_000) return Math.round(originalBytes * 0.95)
  if (originalBytes <= 800_000) return Math.round(originalBytes * 0.55)
  return Math.round(originalBytes * 0.28 + 80_000)
}

export type ExportSizeEstimate = {
  originalBytes: number
  eventBytes: number
}

export async function estimateExportSizes(
  entries: ImageEntry[],
): Promise<ExportSizeEstimate> {
  let original = MANIFEST_OVERHEAD_BYTES
  let event = MANIFEST_OVERHEAD_BYTES

  for (const entry of entries) {
    const file = await resolveSlideFile({
      path: entry.path,
      url: '',
      file: entry.file,
      handle: entry.handle,
    })
    original += file.size
    event += estimateEventFileSize(file.size, entry.path)
  }

  return {
    originalBytes: Math.round(original * ZIP_OVERHEAD_RATIO),
    eventBytes: Math.round(event * ZIP_OVERHEAD_RATIO),
  }
}
