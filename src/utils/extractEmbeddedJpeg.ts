const JPEG_SOI = 0xd8
const JPEG_EOI = 0xd9
/** Skip tiny EXIF thumbnails; prefer the camera's LCD preview. */
const MIN_PREVIEW_BYTES = 10_000

const TIFF_LE = 0x4949
const TIFF_BE = 0x4d4d
const TAG_SUB_IFDS = 0x014a
const TAG_JPEG_OFFSET = 0x0201
const TAG_JPEG_LENGTH = 0x0202
const TAG_COMPRESSION = 0x0103
const TAG_IMAGE_WIDTH = 0x0100
const TAG_IMAGE_HEIGHT = 0x0101
const COMPRESSION_JPEG = 6

export type JpegByteRange = { offset: number; length: number }

type ScoredJpegRange = JpegByteRange & { score: number }

function isJpegStart(data: Uint8Array, offset: number): boolean {
  return data[offset] === 0xff && data[offset + 1] === JPEG_SOI
}

function isJpegEnd(data: Uint8Array, offset: number): boolean {
  return data[offset] === 0xff && data[offset + 1] === JPEG_EOI
}

function readU16(view: DataView, offset: number, le: boolean): number {
  return view.getUint16(offset, le)
}

function readU32(view: DataView, offset: number, le: boolean): number {
  return view.getUint32(offset, le)
}

function readTagU32(view: DataView, entry: number, le: boolean): number | undefined {
  const type = readU16(view, entry + 2, le)
  const count = readU32(view, entry + 4, le)
  if (type !== 4 || count < 1) return undefined
  if (count === 1) return readU32(view, entry + 8, le)
  const valueOffset = readU32(view, entry + 8, le)
  if (valueOffset + 4 > view.byteLength) return undefined
  return readU32(view, valueOffset, le)
}

function readTagU32Array(view: DataView, entry: number, le: boolean): number[] {
  const type = readU16(view, entry + 2, le)
  const count = readU32(view, entry + 4, le)
  if (type !== 4 || count < 1) return []
  if (count === 1) return [readU32(view, entry + 8, le)]
  const valueOffset = readU32(view, entry + 8, le)
  const values: number[] = []
  for (let i = 0; i < count; i++) {
    const at = valueOffset + i * 4
    if (at + 4 > view.byteLength) break
    values.push(readU32(view, at, le))
  }
  return values
}

function collectTiffJpegCandidates(
  view: DataView,
  ifdOffset: number,
  le: boolean,
  fileSize: number,
  ifdQueue: number[],
): ScoredJpegRange[] {
  if (ifdOffset < 8 || ifdOffset + 2 > view.byteLength) return []

  const candidates: ScoredJpegRange[] = []
  const tagCount = readU16(view, ifdOffset, le)
  const ifdEnd = ifdOffset + 2 + tagCount * 12
  if (ifdEnd + 4 > view.byteLength) return []

  let compression: number | undefined
  let jpegOffset: number | undefined
  let jpegLength: number | undefined
  let width: number | undefined
  let height: number | undefined

  for (let i = 0; i < tagCount; i++) {
    const entry = ifdOffset + 2 + i * 12
    const tag = readU16(view, entry, le)

    if (tag === TAG_COMPRESSION) compression = readTagU32(view, entry, le)
    if (tag === TAG_JPEG_OFFSET) jpegOffset = readTagU32(view, entry, le)
    if (tag === TAG_JPEG_LENGTH) jpegLength = readTagU32(view, entry, le)
    if (tag === TAG_IMAGE_WIDTH) width = readTagU32(view, entry, le)
    if (tag === TAG_IMAGE_HEIGHT) height = readTagU32(view, entry, le)
    if (tag === TAG_SUB_IFDS) {
      for (const subIfd of readTagU32Array(view, entry, le)) {
        if (subIfd > 0) ifdQueue.push(subIfd)
      }
    }
  }

  if (
    jpegOffset !== undefined &&
    jpegLength !== undefined &&
    jpegLength > 0 &&
    jpegOffset + jpegLength <= fileSize &&
    (compression === undefined || compression === COMPRESSION_JPEG)
  ) {
    const score = (width ?? 0) * (height ?? 0) || jpegLength
    candidates.push({ offset: jpegOffset, length: jpegLength, score })
  }

  const nextIfd = readU32(view, ifdEnd, le)
  if (nextIfd > 0) ifdQueue.push(nextIfd)

  return candidates
}

/** Parse Nikon NEF / TIFF SubIFDs for embedded JPEG preview offsets (fast, no full-file scan). */
export function findTiffEmbeddedJpegRange(
  header: Uint8Array,
  fileSize: number,
): JpegByteRange | null {
  if (header.byteLength < 8 || fileSize < 8) return null

  const view = new DataView(header.buffer, header.byteOffset, header.byteLength)
  const byteOrder = readU16(view, 0, true)
  const le = byteOrder === TIFF_LE
  if (byteOrder !== TIFF_LE && byteOrder !== TIFF_BE) return null
  if (readU16(view, 2, le) !== 42) return null

  const ifd0 = readU32(view, 4, le)
  const ifdQueue = [ifd0]
  const visited = new Set<number>()
  const candidates: ScoredJpegRange[] = []

  while (ifdQueue.length > 0) {
    const ifdOffset = ifdQueue.shift()
    if (ifdOffset === undefined || visited.has(ifdOffset)) continue
    visited.add(ifdOffset)

    candidates.push(...collectTiffJpegCandidates(view, ifdOffset, le, fileSize, ifdQueue))
  }

  if (candidates.length === 0) return null

  candidates.sort((a, b) => b.score - a.score || b.length - a.length)
  const best = candidates[0]
  return { offset: best.offset, length: best.length }
}

/**
 * RAW files embed one or more JPEG previews.
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

export function extractRawPreviewJpeg(data: Uint8Array, fileSize = data.byteLength): Uint8Array | null {
  const tiffRange = findTiffEmbeddedJpegRange(data, fileSize)
  if (tiffRange) {
    const { offset, length } = tiffRange
    if (offset + length <= data.byteLength) {
      const slice = data.slice(offset, offset + length)
      if (slice.byteLength > 2 && isJpegStart(slice, 0)) return slice
    }
  }
  return extractLargestEmbeddedJpeg(data)
}
