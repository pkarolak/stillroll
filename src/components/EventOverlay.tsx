import type { CSSProperties } from 'react'
import {
  CUSTOM_EVENT_OVERLAY_META,
  getEventOverlayTemplate,
} from '../data/eventOverlayTemplates'
import { getRibbonPresentation } from '../data/eventOverlayRibbonOptions'
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

  const textPlacement = template.textPlacement ?? 'banner'
  const celebrationText = settings?.text?.trim()
  const ribbonPresentation =
    textPlacement === 'ribbon-corner'
      ? getRibbonPresentation(settings.ribbon)
      : null

  const textStyle: CSSProperties = {
    fontFamily: ribbonPresentation?.fontFamily ?? template.fontFamily,
    fontSize: ribbonPresentation?.fontSize ?? template.fontSize,
    fontWeight: ribbonPresentation?.fontWeight ?? template.fontWeight,
    color: template.textColor,
    textShadow: template.textShadow,
  }

  return (
    <div className="event-overlay" aria-hidden="true">
      <div className="event-overlay__frame">
        <img className="event-overlay__image" src={imageUrl} alt="" draggable={false} />
        {celebrationText && textPlacement !== 'ribbon-corner' && (
          <p
            className="event-overlay__text"
            style={{
              ...textStyle,
              top: `${template.textTop}%`,
              left: `${template.textLeft}%`,
              right: `${template.textRight}%`,
              height: `${template.textHeight}%`,
            }}
          >
            {celebrationText}
          </p>
        )}
      </div>
      {celebrationText && textPlacement === 'ribbon-corner' && ribbonPresentation && (
        <div className="event-overlay__ribbon" style={textStyle}>
          <span
            className="event-overlay__ribbon-label"
            style={{
              background: ribbonPresentation.background,
              textAlign: ribbonPresentation.textAlign,
            }}
          >
            {celebrationText}
          </span>
        </div>
      )}
    </div>
  )
}
