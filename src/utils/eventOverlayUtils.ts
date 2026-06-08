import type { EventOverlaySettings } from '../types'

export const MAX_EVENT_OVERLAY_TEXT_LENGTH = 80
export const MAX_CUSTOM_OVERLAY_BYTES = 2 * 1024 * 1024

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

export function normalizeEventOverlay(
  settings?: EventOverlaySettings,
): EventOverlaySettings | undefined {
  if (!settings) return undefined
  const text = settings.text ? trimEventOverlayText(settings.text) : ''
  const templateId = settings.templateId
  if (templateId === 'custom') {
    return { templateId: 'custom', text }
  }
  if (!text && templateId) {
    return { templateId, text: '' }
  }
  if (!templateId) return undefined
  return { templateId, text }
}
