import type {
  EventOverlayRibbonAlign,
  EventOverlayRibbonColorId,
  EventOverlayRibbonFontId,
  EventOverlayRibbonSizeId,
  EventOverlayRibbonStyle,
} from '../types'

export type RibbonColorOption = {
  id: EventOverlayRibbonColorId
  labelKey:
    | 'eventOverlayRibbonColorPink'
    | 'eventOverlayRibbonColorGold'
    | 'eventOverlayRibbonColorBlue'
    | 'eventOverlayRibbonColorRed'
    | 'eventOverlayRibbonColorPurple'
  background: string
  swatch: string
}

export type RibbonFontOption = {
  id: EventOverlayRibbonFontId
  labelKey:
    | 'eventOverlayRibbonFontNunito'
    | 'eventOverlayRibbonFontOswald'
    | 'eventOverlayRibbonFontLora'
    | 'eventOverlayRibbonFontCaveat'
    | 'eventOverlayRibbonFontDmSerif'
  fontFamily: string
  fontWeight: number
  /** Short hint shown in the font picker */
  hintKey:
    | 'eventOverlayRibbonFontHintNunito'
    | 'eventOverlayRibbonFontHintOswald'
    | 'eventOverlayRibbonFontHintLora'
    | 'eventOverlayRibbonFontHintCaveat'
    | 'eventOverlayRibbonFontHintDmSerif'
}

export type RibbonSizeOption = {
  id: EventOverlayRibbonSizeId
  labelKey:
    | 'eventOverlayRibbonSizeSm'
    | 'eventOverlayRibbonSizeMd'
    | 'eventOverlayRibbonSizeLg'
  fontSize: string
}

export type RibbonAlignOption = {
  id: EventOverlayRibbonAlign
  labelKey:
    | 'eventOverlayRibbonAlignLeft'
    | 'eventOverlayRibbonAlignCenter'
    | 'eventOverlayRibbonAlignRight'
}

export const RIBBON_COLOR_OPTIONS: RibbonColorOption[] = [
  {
    id: 'pink',
    labelKey: 'eventOverlayRibbonColorPink',
    swatch: '#e91e8c',
    background: '#e91e8c',
  },
  {
    id: 'gold',
    labelKey: 'eventOverlayRibbonColorGold',
    swatch: '#d4a017',
    background: '#d4a017',
  },
  {
    id: 'blue',
    labelKey: 'eventOverlayRibbonColorBlue',
    swatch: '#1e88e5',
    background: '#1e88e5',
  },
  {
    id: 'red',
    labelKey: 'eventOverlayRibbonColorRed',
    swatch: '#e53935',
    background: '#e53935',
  },
  {
    id: 'purple',
    labelKey: 'eventOverlayRibbonColorPurple',
    swatch: '#8e24aa',
    background: '#8e24aa',
  },
]

/** Bundled via @fontsource — works offline and with CSP font-src 'self'. */
export const RIBBON_FONT_OPTIONS: RibbonFontOption[] = [
  {
    id: 'nunito',
    labelKey: 'eventOverlayRibbonFontNunito',
    hintKey: 'eventOverlayRibbonFontHintNunito',
    fontFamily: "'Nunito', system-ui, sans-serif",
    fontWeight: 700,
  },
  {
    id: 'oswald',
    labelKey: 'eventOverlayRibbonFontOswald',
    hintKey: 'eventOverlayRibbonFontHintOswald',
    fontFamily: "'Oswald', 'Arial Narrow', sans-serif",
    fontWeight: 600,
  },
  {
    id: 'lora',
    labelKey: 'eventOverlayRibbonFontLora',
    hintKey: 'eventOverlayRibbonFontHintLora',
    fontFamily: "'Lora', Georgia, serif",
    fontWeight: 600,
  },
  {
    id: 'caveat',
    labelKey: 'eventOverlayRibbonFontCaveat',
    hintKey: 'eventOverlayRibbonFontHintCaveat',
    fontFamily: "'Caveat', 'Segoe Script', cursive",
    fontWeight: 700,
  },
  {
    id: 'dm-serif',
    labelKey: 'eventOverlayRibbonFontDmSerif',
    hintKey: 'eventOverlayRibbonFontHintDmSerif',
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontWeight: 400,
  },
]

const LEGACY_RIBBON_FONT_IDS: Record<string, EventOverlayRibbonFontId> = {
  fredoka: 'nunito',
  'patrick-hand': 'caveat',
  playfair: 'dm-serif',
}

export const RIBBON_SIZE_OPTIONS: RibbonSizeOption[] = [
  {
    id: 'sm',
    labelKey: 'eventOverlayRibbonSizeSm',
    fontSize: 'clamp(0.55rem, 1.25vw, 0.95rem)',
  },
  {
    id: 'md',
    labelKey: 'eventOverlayRibbonSizeMd',
    fontSize: 'clamp(0.65rem, 1.5vw, 1.12rem)',
  },
  {
    id: 'lg',
    labelKey: 'eventOverlayRibbonSizeLg',
    fontSize: 'clamp(0.78rem, 1.8vw, 1.35rem)',
  },
]

export const RIBBON_ALIGN_OPTIONS: RibbonAlignOption[] = [
  { id: 'left', labelKey: 'eventOverlayRibbonAlignLeft' },
  { id: 'center', labelKey: 'eventOverlayRibbonAlignCenter' },
  { id: 'right', labelKey: 'eventOverlayRibbonAlignRight' },
]

export const DEFAULT_RIBBON_STYLE: Required<EventOverlayRibbonStyle> = {
  colorId: 'pink',
  fontId: 'nunito',
  align: 'center',
  sizeId: 'md',
}

export function resolveRibbonStyle(
  ribbon?: EventOverlayRibbonStyle,
): Required<EventOverlayRibbonStyle> {
  const colorIds = new Set(RIBBON_COLOR_OPTIONS.map((o) => o.id))
  const fontIds = new Set(RIBBON_FONT_OPTIONS.map((o) => o.id))
  const sizeIds = new Set(RIBBON_SIZE_OPTIONS.map((o) => o.id))
  const alignIds = new Set(RIBBON_ALIGN_OPTIONS.map((o) => o.id))

  const rawFontId = ribbon?.fontId
  const mappedFontId =
    rawFontId && fontIds.has(rawFontId)
      ? rawFontId
      : rawFontId && LEGACY_RIBBON_FONT_IDS[rawFontId]
        ? LEGACY_RIBBON_FONT_IDS[rawFontId]
        : DEFAULT_RIBBON_STYLE.fontId

  return {
    colorId:
      ribbon?.colorId && colorIds.has(ribbon.colorId)
        ? ribbon.colorId
        : DEFAULT_RIBBON_STYLE.colorId,
    fontId: mappedFontId,
    align:
      ribbon?.align && alignIds.has(ribbon.align)
        ? ribbon.align
        : DEFAULT_RIBBON_STYLE.align,
    sizeId:
      ribbon?.sizeId && sizeIds.has(ribbon.sizeId)
        ? ribbon.sizeId
        : DEFAULT_RIBBON_STYLE.sizeId,
  }
}

export function getRibbonPresentation(ribbon?: EventOverlayRibbonStyle) {
  const resolved = resolveRibbonStyle(ribbon)
  const color =
    RIBBON_COLOR_OPTIONS.find((o) => o.id === resolved.colorId) ??
    RIBBON_COLOR_OPTIONS[0]
  const font =
    RIBBON_FONT_OPTIONS.find((o) => o.id === resolved.fontId) ??
    RIBBON_FONT_OPTIONS[0]
  const size =
    RIBBON_SIZE_OPTIONS.find((o) => o.id === resolved.sizeId) ??
    RIBBON_SIZE_OPTIONS[1]

  return {
    resolved,
    background: color.background,
    fontFamily: font.fontFamily,
    fontWeight: font.fontWeight,
    fontSize: size.fontSize,
    textAlign: resolved.align,
  }
}
