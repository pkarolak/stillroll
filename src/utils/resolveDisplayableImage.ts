import exifr from 'exifr'
import { isRawImageFile } from './imageFormats'

export class RawPreviewUnavailableError extends Error {
  filename: string

  constructor(filename: string) {
    super('RAW_NO_PREVIEW')
    this.name = 'RawPreviewUnavailableError'
    this.filename = filename
  }
}

/** Returns a blob the browser can render in `<img>` (JPEG preview for Nikon RAW). */
export async function resolveDisplayableBlob(file: File): Promise<Blob> {
  if (!isRawImageFile(file.name)) return file

  const thumb = await exifr.thumbnail(file)
  if (!thumb || thumb.byteLength === 0) {
    throw new RawPreviewUnavailableError(file.name)
  }

  const bytes = thumb instanceof Uint8Array ? thumb : new Uint8Array(thumb)
  return new Blob([Uint8Array.from(bytes)], { type: 'image/jpeg' })
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
