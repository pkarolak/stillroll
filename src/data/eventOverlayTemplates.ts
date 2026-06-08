import type { EventOverlayTemplateId } from '../types'

export type EventOverlayTemplateMeta = {
  id: Exclude<EventOverlayTemplateId, 'custom'>
  nameKey:
    | 'eventOverlayBirthday'
    | 'eventOverlayWedding'
    | 'eventOverlayReunion'
    | 'eventOverlayAnniversary'
    | 'eventOverlayGraduation'
  imageUrl: string
  anchor: 'top'
  overlapVh: number
  safeZone: { centerWidthPercent: number }
  /** Text zone as % of the overlay image (viewBox), not the viewport */
  textTop: number
  textLeft: number
  textRight: number
  textHeight: number
  imageAspectRatio: number
  fontFamily: string
  fontSize: string
  fontWeight: number
  textColor: string
  textShadow?: string
}

export const EVENT_OVERLAY_TEMPLATES: EventOverlayTemplateMeta[] = [
  {
    id: 'birthday',
    nameKey: 'eventOverlayBirthday',
    imageUrl: '/overlays/birthday.png',
    anchor: 'top',
    overlapVh: 14,
    safeZone: { centerWidthPercent: 55 },
    textTop: 4.5,
    textLeft: 40,
    textRight: 40,
    textHeight: 13,
    imageAspectRatio: 1024 / 512,
    fontFamily: "'Fredoka', cursive",
    fontSize: 'clamp(0.95rem, 2.4vw, 1.75rem)',
    fontWeight: 600,
    textColor: '#fffef8',
    textShadow: '0 1px 3px rgba(0,0,0,0.35)',
  },
  {
    id: 'wedding',
    nameKey: 'eventOverlayWedding',
    imageUrl: '/overlays/wedding.svg',
    anchor: 'top',
    overlapVh: 11,
    safeZone: { centerWidthPercent: 55 },
    textTop: 13,
    textLeft: 26,
    textRight: 26,
    textHeight: 20,
    imageAspectRatio: 1920 / 520,
    fontFamily: "'Caveat', cursive",
    fontSize: 'clamp(1.3rem, 3.2vw, 2.4rem)',
    fontWeight: 700,
    textColor: '#6b2d4a',
    textShadow: '0 1px 3px rgba(255,255,255,0.5)',
  },
  {
    id: 'reunion',
    nameKey: 'eventOverlayReunion',
    imageUrl: '/overlays/reunion.svg',
    anchor: 'top',
    overlapVh: 10,
    safeZone: { centerWidthPercent: 55 },
    textTop: 16,
    textLeft: 33,
    textRight: 33,
    textHeight: 17,
    imageAspectRatio: 1920 / 520,
    fontFamily: "'Patrick Hand', cursive",
    fontSize: 'clamp(1.1rem, 2.6vw, 1.9rem)',
    fontWeight: 400,
    textColor: '#3d4a2e',
    textShadow: '0 1px 2px rgba(255,255,255,0.4)',
  },
  {
    id: 'anniversary',
    nameKey: 'eventOverlayAnniversary',
    imageUrl: '/overlays/anniversary.svg',
    anchor: 'top',
    overlapVh: 12,
    safeZone: { centerWidthPercent: 55 },
    textTop: 11,
    textLeft: 36,
    textRight: 36,
    textHeight: 26,
    imageAspectRatio: 1920 / 520,
    fontFamily: "'Caveat', cursive",
    fontSize: 'clamp(1.2rem, 3vw, 2.2rem)',
    fontWeight: 700,
    textColor: '#4a2c6b',
    textShadow: '0 1px 2px rgba(255,255,255,0.5)',
  },
  {
    id: 'graduation',
    nameKey: 'eventOverlayGraduation',
    imageUrl: '/overlays/graduation.svg',
    anchor: 'top',
    overlapVh: 11,
    safeZone: { centerWidthPercent: 55 },
    textTop: 30,
    textLeft: 28,
    textRight: 28,
    textHeight: 22,
    imageAspectRatio: 1920 / 520,
    fontFamily: "'Fredoka', cursive",
    fontSize: 'clamp(1rem, 2.5vw, 1.8rem)',
    fontWeight: 500,
    textColor: '#1a3d5c',
    textShadow: '0 1px 2px rgba(255,255,255,0.5)',
  },
]

export function getEventOverlayTemplate(
  id: EventOverlayTemplateId,
): EventOverlayTemplateMeta | undefined {
  if (id === 'custom') return undefined
  return EVENT_OVERLAY_TEMPLATES.find((t) => t.id === id)
}

export const DEFAULT_EVENT_OVERLAY_TEMPLATE_ID: Exclude<
  EventOverlayTemplateId,
  'custom'
> = 'birthday'

export const CUSTOM_EVENT_OVERLAY_META: Omit<
  EventOverlayTemplateMeta,
  'id' | 'nameKey' | 'imageUrl'
> & { imageUrl?: string } = {
  anchor: 'top',
  overlapVh: 12,
  safeZone: { centerWidthPercent: 55 },
  textTop: 12,
  textLeft: 22,
  textRight: 22,
  textHeight: 20,
  imageAspectRatio: 1920 / 520,
  fontFamily: "'Patrick Hand', cursive",
  fontSize: 'clamp(1.1rem, 2.8vw, 2rem)',
  fontWeight: 400,
  textColor: '#ffffff',
  textShadow: '0 1px 4px rgba(0,0,0,0.6)',
}
