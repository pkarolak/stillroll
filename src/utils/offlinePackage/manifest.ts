import type { SlideshowConfig } from '../../types'
import { MAX_MANIFEST_BYTES, MAX_SLIDES } from './limits'

export const STILLROLL_PACKAGE_VERSION = 1 as const

export type PackageSlideEntry = {
  id: string
  filename: string
}

export type StillrollManifest = {
  stillrollPackage: typeof STILLROLL_PACKAGE_VERSION
  name: string
  createdAt: string
  config: SlideshowConfig
  slides: PackageSlideEntry[]
}

export function buildManifest(
  name: string,
  config: SlideshowConfig,
  slides: PackageSlideEntry[],
): StillrollManifest {
  return {
    stillrollPackage: STILLROLL_PACKAGE_VERSION,
    name,
    createdAt: new Date().toISOString(),
    config,
    slides,
  }
}

export function serializeManifest(manifest: StillrollManifest): string {
  return JSON.stringify(manifest)
}

export function parseManifestJson(text: string): StillrollManifest {
  if (text.length > MAX_MANIFEST_BYTES) {
    throw new Error('MANIFEST_TOO_LARGE')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('MANIFEST_INVALID_JSON')
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('MANIFEST_INVALID')
  }

  const m = parsed as Record<string, unknown>

  if (m.stillrollPackage !== STILLROLL_PACKAGE_VERSION) {
    throw new Error('MANIFEST_UNSUPPORTED_VERSION')
  }
  if (typeof m.name !== 'string' || !m.name.trim()) {
    throw new Error('MANIFEST_INVALID')
  }
  if (typeof m.createdAt !== 'string') {
    throw new Error('MANIFEST_INVALID')
  }
  if (!m.config || typeof m.config !== 'object') {
    throw new Error('MANIFEST_INVALID')
  }

  const config = m.config as Record<string, unknown>
  if (
    typeof config.duration !== 'number' ||
    (config.order !== 'folder' && config.order !== 'random') ||
    typeof config.correctOrientation !== 'boolean'
  ) {
    throw new Error('MANIFEST_INVALID')
  }

  if (!Array.isArray(m.slides) || m.slides.length === 0) {
    throw new Error('MANIFEST_NO_SLIDES')
  }
  if (m.slides.length > MAX_SLIDES) {
    throw new Error('MANIFEST_TOO_MANY_SLIDES')
  }

  const slides: PackageSlideEntry[] = []
  for (const entry of m.slides) {
    if (!entry || typeof entry !== 'object') {
      throw new Error('MANIFEST_INVALID')
    }
    const s = entry as Record<string, unknown>
    if (typeof s.id !== 'string' || typeof s.filename !== 'string') {
      throw new Error('MANIFEST_INVALID')
    }
    slides.push({ id: s.id, filename: s.filename })
  }

  return {
    stillrollPackage: STILLROLL_PACKAGE_VERSION,
    name: m.name,
    createdAt: m.createdAt,
    config: {
      duration: config.duration,
      order: config.order,
      correctOrientation: config.correctOrientation,
    },
    slides,
  }
}

export function slideArchiveName(index: number, baseName: string): string {
  const dot = baseName.lastIndexOf('.')
  const stem = dot === -1 ? baseName : baseName.slice(0, dot)
  const ext = dot === -1 ? '.jpg' : baseName.slice(dot).toLowerCase()
  const safeStem = stem.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 80) || 'slide'
  const pad = String(index + 1).padStart(3, '0')
  return `slides/${pad}-${safeStem}${ext}`
}
