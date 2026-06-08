import { describe, expect, it } from 'vitest'
import {
  clampEventOverlayText,
  hasEventOverlayContent,
  isAllowedCustomOverlayFile,
  normalizeEventOverlay,
  overlayMimeFromBuffer,
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

  it('accepts custom overlay png and svg uploads', () => {
    expect(
      isAllowedCustomOverlayFile(
        new File([''], 'overlay.png', { type: 'image/png' }),
      ),
    ).toBe(true)
    expect(
      isAllowedCustomOverlayFile(
        new File([''], 'overlay.svg', { type: 'image/svg+xml' }),
      ),
    ).toBe(true)
    expect(
      isAllowedCustomOverlayFile(
        new File([''], 'overlay.jpg', { type: 'image/jpeg' }),
      ),
    ).toBe(false)
    expect(
      isAllowedCustomOverlayFile(
        new File([''], 'overlay.svg', { type: 'application/octet-stream' }),
      ),
    ).toBe(true)
  })

  it('detects overlay mime from buffer', () => {
    const svg = new TextEncoder().encode('<svg xmlns="http://www.w3.org/2000/svg"></svg>')
    const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47])
    expect(overlayMimeFromBuffer(svg.buffer)).toBe('image/svg+xml')
    expect(overlayMimeFromBuffer(png.buffer)).toBe('image/png')
  })

  it('maps legacy ribbon font ids to current bundled fonts', async () => {
    const { resolveRibbonStyle } = await import('../data/eventOverlayRibbonOptions')
    expect(
      resolveRibbonStyle({ fontId: 'fredoka' as never }).fontId,
    ).toBe('nunito')
    expect(
      resolveRibbonStyle({ fontId: 'playfair' as never }).fontId,
    ).toBe('dm-serif')
    expect(
      resolveRibbonStyle({ fontId: 'patrick-hand' as never }).fontId,
    ).toBe('caveat')
  })

  it('normalizes overlay settings', () => {
    expect(
      normalizeEventOverlay({ templateId: 'wedding', text: '  Asi i Piotr  ' }),
    ).toEqual({ templateId: 'wedding', text: 'Asi i Piotr' })
    expect(
      normalizeEventOverlay({ templateId: 'custom', text: '  ' }),
    ).toEqual({ templateId: 'custom', text: '' })
    expect(
      normalizeEventOverlay({ templateId: 'birthday', text: '  Sto lat  ' }),
    ).toEqual({
      templateId: 'birthday',
      text: 'Sto lat',
      ribbon: {
        colorId: 'pink',
        fontId: 'nunito',
        align: 'center',
        sizeId: 'md',
      },
    })
    expect(
      normalizeEventOverlay({
        templateId: 'birthday',
        text: 'Jubilat',
        ribbon: {
          colorId: 'gold',
          fontId: 'lora',
          align: 'left',
          sizeId: 'lg',
        },
      }),
    ).toEqual({
      templateId: 'birthday',
      text: 'Jubilat',
      ribbon: {
        colorId: 'gold',
        fontId: 'lora',
        align: 'left',
        sizeId: 'lg',
      },
    })
  })
})
