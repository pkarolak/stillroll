import { isRawImageFile } from './imageFormats'
import { extractLargestEmbeddedJpeg } from './extractEmbeddedJpeg'

export class RawPreviewUnavailableError extends Error {
  filename: string

  constructor(filename: string) {
    super('RAW_NO_PREVIEW')
    this.name = 'RawPreviewUnavailableError'
    this.filename = filename
  }
}

/** Returns a blob the browser can render in `<img>` (embedded JPEG preview for Nikon RAW). */
export async function resolveDisplayableBlob(file: File): Promise<Blob> {
  if (!isRawImageFile(file.name)) return file

  const data = new Uint8Array(await file.arrayBuffer())
  const preview = extractLargestEmbeddedJpeg(data)
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
