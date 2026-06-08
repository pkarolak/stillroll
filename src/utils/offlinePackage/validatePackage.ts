import {
  ALLOWED_MIME_TYPES,
  AUTO_START_MAX_BYTES,
  AUTO_START_MAX_SLIDES,
  MANIFEST_FILENAME,
  OVERLAY_FILENAME,
  MAX_ARCHIVE_BYTES,
  MAX_FILES_IN_ARCHIVE,
  MAX_SINGLE_FILE_BYTES,
  MAX_SLIDES,
  MAX_UNCOMPRESSED_BYTES,
  MAX_UNCOMPRESSED_RATIO,
  SLIDE_ARCHIVE_PATH_RE,
  WARN_SLIDES,
} from './limits'
import type { StillrollManifest } from './manifest'

export function validateArchiveFileSize(size: number): void {
  if (!Number.isFinite(size) || size <= 0) {
    throw new Error('ARCHIVE_EMPTY')
  }
  if (size > MAX_ARCHIVE_BYTES) {
    throw new Error('ARCHIVE_TOO_LARGE')
  }
}

export function validateZipEntryPath(path: string): void {
  if (!path || path.startsWith('/') || path.includes('\\')) {
    throw new Error('ZIP_PATH_TRAVERSAL')
  }
  if (path.includes('..') || path.includes('\0')) {
    throw new Error('ZIP_PATH_TRAVERSAL')
  }
}

export function validateUnzipBudget(
  archiveSize: number,
  totalUncompressed: number,
  fileCount: number,
): void {
  if (fileCount > MAX_FILES_IN_ARCHIVE) {
    throw new Error('ZIP_TOO_MANY_FILES')
  }
  if (totalUncompressed > MAX_UNCOMPRESSED_BYTES) {
    throw new Error('ZIP_BOMB_UNCOMPRESSED')
  }
  if (archiveSize > 0 && totalUncompressed / archiveSize > MAX_UNCOMPRESSED_RATIO) {
    throw new Error('ZIP_BOMB_RATIO')
  }
}

export function validateExtractedEntry(path: string, size: number): void {
  validateZipEntryPath(path)

  if (path === MANIFEST_FILENAME || path === OVERLAY_FILENAME) {
    return
  }

  if (!SLIDE_ARCHIVE_PATH_RE.test(path)) {
    throw new Error('ZIP_UNEXPECTED_PATH')
  }
  if (size > MAX_SINGLE_FILE_BYTES) {
    throw new Error('ZIP_FILE_TOO_LARGE')
  }
}

export function validateManifestAgainstArchive(
  manifest: StillrollManifest,
  archivePaths: Set<string>,
): string[] {
  const missing: string[] = []

  for (const slide of manifest.slides) {
    validateZipEntryPath(slide.filename)
    if (!SLIDE_ARCHIVE_PATH_RE.test(slide.filename)) {
      throw new Error('MANIFEST_INVALID_FILENAME')
    }
    if (!archivePaths.has(slide.filename)) {
      missing.push(slide.filename)
    }
  }

  return missing
}

export function validateSlideMime(mime: string): void {
  if (!ALLOWED_MIME_TYPES.has(mime)) {
    throw new Error('SLIDE_MIME_REJECTED')
  }
}

export function canAutoStartPackage(
  archiveSize: number,
  slideCount: number,
): boolean {
  return (
    archiveSize <= AUTO_START_MAX_BYTES &&
    slideCount <= AUTO_START_MAX_SLIDES
  )
}

export { MAX_SLIDES, WARN_SLIDES }
