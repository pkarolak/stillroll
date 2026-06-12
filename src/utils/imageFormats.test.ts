import { describe, expect, it } from 'vitest'
import { isImageFile, isRawImageFile } from './imageFormats'

describe('imageFormats', () => {
  it('recognizes Nikon RAW extensions', () => {
    expect(isRawImageFile('DSC_0001.NEF')).toBe(true)
    expect(isRawImageFile('photo.nrw')).toBe(true)
    expect(isRawImageFile('photo.jpg')).toBe(false)
  })

  it('includes RAW in image file filter', () => {
    expect(isImageFile('party.nef')).toBe(true)
    expect(isImageFile('party.cr2')).toBe(false)
  })
})
