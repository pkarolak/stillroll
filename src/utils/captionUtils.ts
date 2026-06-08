import type { SlideCaption } from '../types'

export const MAX_CAPTION_FIELD_LENGTH = 120

export function hasCaptionContent(caption?: SlideCaption): boolean {
  if (!caption) return false
  return Boolean(
    caption.date?.trim() || caption.place?.trim() || caption.text?.trim(),
  )
}

export function clampCaptionField(value: string): string {
  return value.slice(0, MAX_CAPTION_FIELD_LENGTH)
}

export function trimCaptionField(value: string): string {
  return value.trim().slice(0, MAX_CAPTION_FIELD_LENGTH)
}

export function normalizeCaption(caption?: SlideCaption): SlideCaption | undefined {
  if (!caption) return undefined
  const date = caption.date ? trimCaptionField(caption.date) : ''
  const place = caption.place ? trimCaptionField(caption.place) : ''
  const text = caption.text ? trimCaptionField(caption.text) : ''
  if (!date && !place && !text) return undefined
  return {
    ...(date ? { date } : {}),
    ...(place ? { place } : {}),
    ...(text ? { text } : {}),
  }
}
