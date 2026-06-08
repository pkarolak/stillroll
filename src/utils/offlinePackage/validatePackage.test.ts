import { describe, expect, it } from 'vitest'
import { parseManifestJson } from './manifest'
import {
  canAutoStartPackage,
  validateArchiveFileSize,
  validateExtractedEntry,
  validateManifestAgainstArchive,
  validateUnzipBudget,
  validateZipEntryPath,
} from './validatePackage'
import { MAX_ARCHIVE_BYTES } from './limits'

describe('validateArchiveFileSize', () => {
  it('rejects empty archives', () => {
    expect(() => validateArchiveFileSize(0)).toThrow('ARCHIVE_EMPTY')
  })

  it('rejects oversized archives', () => {
    expect(() => validateArchiveFileSize(MAX_ARCHIVE_BYTES + 1)).toThrow(
      'ARCHIVE_TOO_LARGE',
    )
  })
})

describe('validateZipEntryPath', () => {
  it('allows manifest and slide paths', () => {
    expect(() => validateZipEntryPath('manifest.json')).not.toThrow()
    expect(() => validateZipEntryPath('slides/001-photo.jpg')).not.toThrow()
  })

  it('blocks path traversal', () => {
    expect(() => validateZipEntryPath('../secret.txt')).toThrow('ZIP_PATH_TRAVERSAL')
    expect(() => validateZipEntryPath('slides/../../etc/passwd')).toThrow(
      'ZIP_PATH_TRAVERSAL',
    )
    expect(() => validateZipEntryPath('/etc/passwd')).toThrow('ZIP_PATH_TRAVERSAL')
  })
})

describe('validateUnzipBudget', () => {
  it('detects zip bomb ratio', () => {
    expect(() => validateUnzipBudget(1_000, 200_000, 2)).toThrow('ZIP_BOMB_RATIO')
  })

  it('allows healthy archives', () => {
    expect(() => validateUnzipBudget(1_000_000, 2_000_000, 10)).not.toThrow()
  })
})

describe('validateExtractedEntry', () => {
  it('rejects unexpected paths', () => {
    expect(() => validateExtractedEntry('evil.exe', 100)).toThrow('ZIP_UNEXPECTED_PATH')
  })
})

describe('parseManifestJson', () => {
  it('parses valid manifest', () => {
    const manifest = parseManifestJson(
      JSON.stringify({
        stillrollPackage: 1,
        name: 'Test',
        createdAt: '2026-01-01T00:00:00.000Z',
        config: { duration: 6, order: 'folder', correctOrientation: true },
        slides: [{ id: '1', filename: 'slides/001-a.jpg' }],
      }),
    )
    expect(manifest.name).toBe('Test')
  })

  it('rejects unsupported version', () => {
    expect(() =>
      parseManifestJson(
        JSON.stringify({
          stillrollPackage: 99,
          name: 'X',
          createdAt: 'x',
          config: { duration: 6, order: 'folder', correctOrientation: true },
          slides: [],
        }),
      ),
    ).toThrow('MANIFEST_UNSUPPORTED_VERSION')
  })
})

describe('validateManifestAgainstArchive', () => {
  it('reports missing slides', () => {
    const manifest = parseManifestJson(
      JSON.stringify({
        stillrollPackage: 1,
        name: 'Test',
        createdAt: '2026-01-01T00:00:00.000Z',
        config: { duration: 6, order: 'folder', correctOrientation: true },
        slides: [
          { id: '1', filename: 'slides/001-a.jpg' },
          { id: '2', filename: 'slides/002-b.jpg' },
        ],
      }),
    )
    const missing = validateManifestAgainstArchive(
      manifest,
      new Set(['slides/001-a.jpg']),
    )
    expect(missing).toEqual(['slides/002-b.jpg'])
  })
})

describe('canAutoStartPackage', () => {
  it('allows small packages', () => {
    expect(canAutoStartPackage(10_000_000, 100)).toBe(true)
  })

  it('blocks large packages', () => {
    expect(canAutoStartPackage(300 * 1024 ** 2, 100)).toBe(false)
  })
})
