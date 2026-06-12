const IMAGE_EXTENSIONS = new Set([
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.avif',
  '.bmp',
  '.svg',
  '.heic',
  '.heif',
  '.tif',
  '.tiff',
])

/** Nikon RAW — shown via embedded JPEG preview scanned from file bytes. */
const RAW_IMAGE_EXTENSIONS = new Set(['.nef', '.nrw'])

export function getExtension(filename: string): string {
  const dot = filename.lastIndexOf('.')
  if (dot === -1) return ''
  return filename.slice(dot).toLowerCase()
}

export function isRawImageFile(filename: string): boolean {
  return RAW_IMAGE_EXTENSIONS.has(getExtension(filename))
}

export function isImageFile(filename: string): boolean {
  return IMAGE_EXTENSIONS.has(getExtension(filename)) || isRawImageFile(filename)
}

export const IMAGE_EXTENSIONS_LIST = [...IMAGE_EXTENSIONS, ...RAW_IMAGE_EXTENSIONS]
