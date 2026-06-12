import { describe, expect, it } from 'vitest'
import { extractLargestEmbeddedJpeg } from './extractEmbeddedJpeg'

const TINY_JPEG = Uint8Array.from(
  atob(
    '/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCwAA8A/9k=',
  ),
  (c) => c.charCodeAt(0),
)

function pad(size: number, fill = 0x00): Uint8Array {
  return new Uint8Array(size).fill(fill)
}

function makeFakeJpeg(totalSize: number): Uint8Array {
  const buf = new Uint8Array(totalSize)
  buf[0] = 0xff
  buf[1] = 0xd8
  buf[totalSize - 2] = 0xff
  buf[totalSize - 1] = 0xd9
  return buf
}

describe('extractLargestEmbeddedJpeg', () => {
  it('returns null when no JPEG markers are present', () => {
    expect(extractLargestEmbeddedJpeg(pad(100))).toBeNull()
  })

  it('prefers the largest embedded JPEG over a tiny EXIF thumbnail', () => {
    const small = makeFakeJpeg(512)
    const large = makeFakeJpeg(12_000)
    const raw = new Uint8Array([...pad(128), ...small, ...pad(256), ...large, ...pad(64)])

    const extracted = extractLargestEmbeddedJpeg(raw)
    expect(extracted).not.toBeNull()
    expect(extracted!.length).toBe(large.length)
    expect(extracted![0]).toBe(0xff)
    expect(extracted![1]).toBe(0xd8)
  })

  it('falls back to a small thumbnail when no large preview exists', () => {
    const raw = new Uint8Array([...pad(32), ...TINY_JPEG, ...pad(16)])
    const extracted = extractLargestEmbeddedJpeg(raw)
    expect(extracted).toEqual(TINY_JPEG)
  })
})
