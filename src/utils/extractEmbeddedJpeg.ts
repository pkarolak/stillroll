const JPEG_SOI = 0xd8
const JPEG_EOI = 0xd9
/** Skip tiny EXIF thumbnails; prefer the camera's LCD preview. */
const MIN_PREVIEW_BYTES = 10_000

function isJpegStart(data: Uint8Array, offset: number): boolean {
  return data[offset] === 0xff && data[offset + 1] === JPEG_SOI
}

function isJpegEnd(data: Uint8Array, offset: number): boolean {
  return data[offset] === 0xff && data[offset + 1] === JPEG_EOI
}

/**
 * RAW files (NEF, NRW, CR2, …) embed one or more JPEG previews.
 * Scan for SOI/EOI markers and return the largest segment.
 */
export function extractLargestEmbeddedJpeg(data: Uint8Array): Uint8Array | null {
  const starts: number[] = []
  for (let i = 0; i < data.length - 1; i++) {
    if (isJpegStart(data, i)) starts.push(i)
  }
  if (starts.length === 0) return null

  let bestStart = -1
  let bestEnd = -1
  let bestSize = 0

  const considerSegment = (start: number, end: number, minSize: number) => {
    if (end <= start + 2) return
    const size = end - start
    if (size <= minSize || size <= bestSize) return
    bestStart = start
    bestEnd = end
    bestSize = size
  }

  for (let s = 0; s < starts.length; s++) {
    const start = starts[s]
    const boundary = s + 1 < starts.length ? starts[s + 1] : data.length

    for (let j = boundary - 2; j >= start + 2; j--) {
      if (isJpegEnd(data, j)) {
        considerSegment(start, j + 2, MIN_PREVIEW_BYTES)
        break
      }
    }
  }

  if (bestStart < 0) {
    for (let s = 0; s < starts.length; s++) {
      const start = starts[s]
      const boundary = s + 1 < starts.length ? starts[s + 1] : data.length

      for (let j = boundary - 2; j >= start + 2; j--) {
        if (isJpegEnd(data, j)) {
          considerSegment(start, j + 2, 0)
          break
        }
      }
    }
  }

  if (bestStart < 0) return null
  return data.slice(bestStart, bestEnd)
}
