import type { Slide, SlideshowConfig } from '../../types'
import { validateArchiveFileSize } from './validatePackage'
import { runImportInWorker } from './packageClient'
import type { StillrollManifest } from './manifest'

export type ImportedPackage = {
  manifest: StillrollManifest
  slides: Slide[]
  archiveSize: number
  customOverlayBuffer?: ArrayBuffer
}

export async function importStillrollPackage(file: File): Promise<ImportedPackage> {
  validateArchiveFileSize(file.size)

  const { manifest, slides: rawSlides, overlayBuffer } =
    await runImportInWorker(file)

  const byFilename = new Map(rawSlides.map((s) => [s.filename, s]))

  const slides: Slide[] = manifest.slides.map((manifestSlide) => {
    const slide = byFilename.get(manifestSlide.filename)
    if (!slide) throw new Error('MANIFEST_MISSING_FILES')
    const blob = new Blob([slide.buffer], { type: slide.mime })
    const fileObj = new File([blob], manifestSlide.filename, { type: slide.mime })
    return {
      path: manifestSlide.filename,
      url: '',
      file: fileObj,
      ...(manifestSlide.caption ? { caption: manifestSlide.caption } : {}),
    }
  })

  return {
    manifest,
    slides,
    archiveSize: file.size,
    ...(overlayBuffer ? { customOverlayBuffer: overlayBuffer } : {}),
  }
}

export function configFromManifest(manifest: StillrollManifest): SlideshowConfig {
  return { ...manifest.config }
}
