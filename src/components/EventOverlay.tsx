import type { CSSProperties } from 'react'
import {
  CUSTOM_EVENT_OVERLAY_META,
  getEventOverlayTemplate,
} from '../data/eventOverlayTemplates'
import type { EventOverlaySettings } from '../types'
import { hasEventOverlayContent } from '../utils/eventOverlayUtils'

type EventOverlayProps = {
  settings?: EventOverlaySettings
  enabled: boolean
  customImageUrl?: string | null
  /** Editor preview: show template art even before text is entered */
  preview?: boolean
}

export function EventOverlay({
  settings,
  enabled,
  customImageUrl,
  preview = false,
}: EventOverlayProps) {
  if (!enabled || !settings) return null
  if (!preview && !hasEventOverlayContent(settings)) return null

  const template =
    settings?.templateId === 'custom'
      ? CUSTOM_EVENT_OVERLAY_META
      : getEventOverlayTemplate(settings!.templateId)

  if (!template) return null

  const imageUrl =
    settings?.templateId === 'custom' ? customImageUrl : template.imageUrl

  if (!imageUrl) return null

  const frameStyle = {
    '--event-overlay-aspect': String(template.imageAspectRatio),
  } as CSSProperties

  const textStyle: CSSProperties = {
    top: `${template.textTop}%`,
    left: `${template.textLeft}%`,
    right: `${template.textRight}%`,
    height: `${template.textHeight}%`,
    fontFamily: template.fontFamily,
    fontSize: template.fontSize,
    fontWeight: template.fontWeight,
    color: template.textColor,
    textShadow: template.textShadow,
  }

  return (
    <div
      className="event-overlay"
      style={
        {
          '--event-overlay-max-vh': `${template.overlapVh}vh`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <div className="event-overlay__frame" style={frameStyle}>
        <img className="event-overlay__image" src={imageUrl} alt="" draggable={false} />
        {settings?.text?.trim() && (
          <p className="event-overlay__text" style={textStyle}>
            {settings.text}
          </p>
        )}
      </div>
    </div>
  )
}
