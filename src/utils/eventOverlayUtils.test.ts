import { describe, expect, it } from 'vitest'
import {
  clampEventOverlayText,
  hasEventOverlayContent,
  normalizeEventOverlay,
  trimEventOverlayText,
} from './eventOverlayUtils'

describe('eventOverlayUtils', () => {
  it('clamps and trims text', () => {
    const long = 'a'.repeat(100)
    expect(clampEventOverlayText(long).length).toBe(80)
    expect(trimEventOverlayText(`  ${long}  `).length).toBe(80)
  })

  it('detects overlay content', () => {
    expect(hasEventOverlayContent(undefined)).toBe(false)
    expect(
      hasEventOverlayContent({ templateId: 'birthday', text: '' }),
    ).toBe(true)
    expect(
      hasEventOverlayContent({ templateId: 'birthday', text: 'Sto lat!' }),
    ).toBe(true)
    expect(hasEventOverlayContent({ templateId: 'custom', text: '' })).toBe(
      true,
    )
  })

  it('normalizes overlay settings', () => {
    expect(
      normalizeEventOverlay({ templateId: 'wedding', text: '  Asi i Piotr  ' }),
    ).toEqual({ templateId: 'wedding', text: 'Asi i Piotr' })
    expect(
      normalizeEventOverlay({ templateId: 'custom', text: '  ' }),
    ).toEqual({ templateId: 'custom', text: '' })
  })
})
