import { resolveRibbonStyle } from '../data/eventOverlayRibbonOptions'
import type { EventOverlaySettings, EventOverlayRibbonStyle } from '../types'

export const MAX_EVENT_OVERLAY_TEXT_LENGTH = 80
export const MAX_CUSTOM_OVERLAY_BYTES = 2 * 1024 * 1024

const CUSTOM_OVERLAY_MIME_TYPES = new Set(['image/png', 'image/svg+xml'])

export function isAllowedCustomOverlayFile(file: File): boolean {
  if (CUSTOM_OVERLAY_MIME_TYPES.has(file.type)) return true
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext === 'png' || ext === 'svg'
}

export function overlayMimeFromBuffer(buffer: ArrayBuffer): string {
  const head = new TextDecoder()
    .decode(buffer.slice(0, Math.min(buffer.byteLength, 256)))
    .trimStart()
  if (head.startsWith('<svg') || head.startsWith('<?xml')) {
    return 'image/svg+xml'
  }
  return 'image/png'
}

export function clampEventOverlayText(value: string): string {
  return value.slice(0, MAX_EVENT_OVERLAY_TEXT_LENGTH)
}

export function trimEventOverlayText(value: string): string {
  return value.trim().slice(0, MAX_EVENT_OVERLAY_TEXT_LENGTH)
}

export function hasEventOverlayContent(
  settings?: EventOverlaySettings,
): boolean {
  if (!settings?.templateId) return false
  if (settings.templateId === 'custom') return true
  return true
}

export function normalizeRibbonStyle(
  ribbon?: EventOverlayRibbonStyle,
): EventOverlayRibbonStyle {
  return resolveRibbonStyle(ribbon)
}

export function normalizeEventOverlay(
  settings?: EventOverlaySettings,
): EventOverlaySettings | undefined {
  if (!settings) return undefined
  const text = settings.text ? trimEventOverlayText(settings.text) : ''
  const templateId = settings.templateId
  if (templateId === 'custom') {
    return { templateId: 'custom', text }
  }
  if (!templateId) return undefined

  const base: EventOverlaySettings = { templateId, text }
  if (templateId === 'birthday') {
    base.ribbon = normalizeRibbonStyle(settings.ribbon)
  }
  return base
}
