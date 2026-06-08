import { describe, expect, it } from 'vitest'
import { hasCaptionContent, normalizeCaption } from './captionUtils'

describe('captionUtils', () => {
  it('detects non-empty captions', () => {
    expect(hasCaptionContent({ text: 'Hello' })).toBe(true)
    expect(hasCaptionContent({ date: ' ', place: 'Kraków' })).toBe(true)
    expect(hasCaptionContent({})).toBe(false)
    expect(hasCaptionContent(undefined)).toBe(false)
  })

  it('normalizes and trims caption fields', () => {
    expect(
      normalizeCaption({ date: '  Marzec 2025  ', text: '' }),
    ).toEqual({ date: 'Marzec 2025' })
    expect(normalizeCaption({ text: '   ' })).toBeUndefined()
  })
})
