export const MAX_ARCHIVE_BYTES = 2 * 1024 ** 3
export const MAX_UNCOMPRESSED_BYTES = 2 * 1024 ** 3
export const MAX_UNCOMPRESSED_RATIO = 100
export const MAX_FILES_IN_ARCHIVE = 5000
export const MAX_SINGLE_FILE_BYTES = 50 * 1024 ** 2
export const MAX_MANIFEST_BYTES = 64 * 1024
export const MAX_SLIDES = 2000
export const WARN_SLIDES = 500
export const AUTO_START_MAX_BYTES = 200 * 1024 ** 2
export const AUTO_START_MAX_SLIDES = 500

export const EVENT_MAX_EDGE = 1920
export const EVENT_JPEG_QUALITY = 0.85

export const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
])

export const SLIDE_ARCHIVE_PATH_RE =
  /^slides\/[0-9]{3}-[a-zA-Z0-9._-]+\.(jpe?g|png|webp|gif)$/i

export const MANIFEST_FILENAME = 'manifest.json'
