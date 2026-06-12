import { isRawImageFile } from './imageFormats'
import { extractRawPreviewJpeg, findTiffEmbeddedJpegRange } from './extractEmbeddedJpeg'

export class RawPreviewUnavailableError extends Error {
  filename: string

  constructor(filename: string) {
    super('RAW_NO_PREVIEW')
    this.name = 'RawPreviewUnavailableError'
    this.filename = filename
  }
}

const TIFF_HEADER_BYTES = 512 * 1024

/** Returns a blob the browser can render in `<img>` (embedded JPEG preview for Nikon RAW). */
export async function resolveDisplayableBlob(file: File): Promise<Blob> {
  if (!isRawImageFile(file.name)) return file

  const header = new Uint8Array(await file.slice(0, TIFF_HEADER_BYTES).arrayBuffer())
  const range = findTiffEmbeddedJpegRange(header, file.size)

  if (range) {
    const previewBytes = new Uint8Array(
      await file.slice(range.offset, range.offset + range.length).arrayBuffer(),
    )
    if (previewBytes.byteLength > 0 && previewBytes[0] === 0xff && previewBytes[1] === 0xd8) {
      return new Blob([Uint8Array.from(previewBytes)], { type: 'image/jpeg' })
    }
  }

  const data = new Uint8Array(await file.arrayBuffer())
  const preview = extractRawPreviewJpeg(data, file.size)
  if (!preview || preview.byteLength === 0) {
    throw new RawPreviewUnavailableError(file.name)
  }

  return new Blob([Uint8Array.from(preview)], { type: 'image/jpeg' })
}

export async function resolveDisplayableFile(file: File): Promise<File> {
  if (!isRawImageFile(file.name)) return file

  const blob = await resolveDisplayableBlob(file)
  const jpgName = file.name.replace(/\.[^.]+$/i, '.jpg')
  return new File([blob], jpgName, {
    type: 'image/jpeg',
    lastModified: file.lastModified,
  })
}
