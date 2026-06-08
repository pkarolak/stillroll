import type { ImageEntry, SlideshowConfig } from '../../types'
import { naturalCompare } from '../naturalSort'
import { resolveSlideFile } from '../slideSource'
import { shuffle } from '../shuffle'
import type { ExportQuality } from '../../workers/packageWorker'
import {
  buildManifest,
  slideArchiveName,
  type PackageSlideEntry,
} from './manifest'
import { runExportInWorker } from './packageClient'
import { MAX_SLIDES } from './limits'

export type ExportPackageOptions = {
  name: string
  entries: ImageEntry[]
  config: SlideshowConfig
  quality: ExportQuality
  onProgress: (done: number, total: number) => void
}

function basename(path: string): string {
  const parts = path.split(/[/\\]/)
  return parts[parts.length - 1] || 'slide'
}

export async function exportStillrollPackage(
  options: ExportPackageOptions,
): Promise<Blob> {
  let sorted = [...options.entries]
  if (options.config.order === 'folder') {
    sorted.sort((a, b) => naturalCompare(a.path, b.path))
  } else {
    sorted = shuffle(sorted)
  }

  if (sorted.length > MAX_SLIDES) {
    throw new Error('TOO_MANY_SLIDES')
  }

  const slideEntries: PackageSlideEntry[] = []
  const workerSlides: Array<{
    archiveName: string
    mime: string
    quality: ExportQuality
    buffer: ArrayBuffer
  }> = []

  for (let i = 0; i < sorted.length; i++) {
    const entry = sorted[i]
    const file = await resolveSlideFile({
      path: entry.path,
      url: '',
      file: entry.file,
      handle: entry.handle,
    })

    const mime = file.type || 'image/jpeg'
    let archiveName = slideArchiveName(i, basename(entry.path))
    if (
      options.quality === 'event' &&
      !archiveName.toLowerCase().endsWith('.gif')
    ) {
      archiveName = archiveName.replace(/\.[^.]+$/, '.jpg')
    }
    const id = String(i + 1).padStart(3, '0')

    slideEntries.push({ id, filename: archiveName })
    workerSlides.push({
      archiveName,
      mime,
      quality: options.quality,
      buffer: await file.arrayBuffer(),
    })
  }

  const manifest = buildManifest(options.name, options.config, slideEntries)

  return runExportInWorker(manifest, workerSlides, options.onProgress)
}

export function downloadStillrollPackage(blob: Blob, filename: string): void {
  const safeName = filename.replace(/[^a-zA-Z0-9._-]+/g, '_').replace(/\.stillroll$/i, '')
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `${safeName}.stillroll`
  anchor.click()
  URL.revokeObjectURL(url)
}
