import { useRef, useState } from 'react'
import type { EventOverlaySettings, EventOverlayTemplateId } from '../../types'
import {
  DEFAULT_EVENT_OVERLAY_TEMPLATE_ID,
  getEventOverlayTemplate,
  getVisibleEventOverlayTemplates,
} from '../../data/eventOverlayTemplates'
import {
  RIBBON_ALIGN_OPTIONS,
  RIBBON_COLOR_OPTIONS,
  RIBBON_FONT_OPTIONS,
  RIBBON_SIZE_OPTIONS,
  resolveRibbonStyle,
} from '../../data/eventOverlayRibbonOptions'
import { useLanguage } from '../../i18n/useLanguage'
import type { EventOverlayRibbonStyle } from '../../types'
import { EventOverlay } from '../EventOverlay'
import { Button } from '../ui/Button'
import {
  clampEventOverlayText,
  isAllowedCustomOverlayFile,
  MAX_CUSTOM_OVERLAY_BYTES,
} from '../../utils/eventOverlayUtils'

type EventOverlayEditorScreenProps = {
  settings: EventOverlaySettings
  customImageUrl: string | null
  onSettingsChange: (settings: EventOverlaySettings) => void
  onCustomImageChange: (blob: Blob | null) => void
  onBack: () => void
}

export function EventOverlayEditorScreen({
  settings,
  customImageUrl,
  onSettingsChange,
  onCustomImageChange,
  onBack,
}: EventOverlayEditorScreenProps) {
  const { t } = useLanguage()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const activeId =
    settings.templateId === 'custom'
      ? 'custom'
      : settings.templateId || DEFAULT_EVENT_OVERLAY_TEMPLATE_ID

  const activeTemplate =
    activeId !== 'custom' ? getEventOverlayTemplate(activeId) : undefined
  const showRibbonOptions = activeTemplate?.textPlacement === 'ribbon-corner'
  const ribbon = resolveRibbonStyle(settings.ribbon)

  const patchRibbon = (patch: Partial<EventOverlayRibbonStyle>) => {
    onSettingsChange({
      ...settings,
      ribbon: { ...ribbon, ...patch },
    })
  }

  const selectTemplate = (id: EventOverlayTemplateId) => {
    if (id === 'custom') {
      fileInputRef.current?.click()
      return
    }
    onSettingsChange({ ...settings, templateId: id })
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (!isAllowedCustomOverlayFile(file)) {
      setUploadError(t.eventOverlayUploadNotPng)
      return
    }
    if (file.size > MAX_CUSTOM_OVERLAY_BYTES) {
      setUploadError(t.eventOverlayUploadTooLarge)
      return
    }
    setUploadError(null)
    onCustomImageChange(file)
    onSettingsChange({ ...settings, templateId: 'custom' })
  }

  return (
    <div className="event-overlay-editor">
      <header className="event-overlay-editor__bar">
        <div className="event-overlay-editor__bar-head">
          <h2 className="event-overlay-editor__title">{t.eventOverlayEditorTitle}</h2>
          <Button
            variant="primary"
            small
            className="event-overlay-editor__done"
            onClick={onBack}
          >
            {t.eventOverlayDone}
          </Button>
        </div>
      </header>

      <div className="event-overlay-editor__body">
        <div className="event-overlay-editor__controls">
          <div className="event-overlay-editor__templates" role="listbox" aria-label={t.eventOverlayEditorTitle}>
            {getVisibleEventOverlayTemplates().map((template) => (
              <button
                key={template.id}
                type="button"
                role="option"
                aria-selected={activeId === template.id}
                className={`event-overlay-editor__template ${activeId === template.id ? 'event-overlay-editor__template--active' : ''}`}
                onClick={() => selectTemplate(template.id)}
              >
                <div className="event-overlay-editor__template-preview">
                  <img src={template.imageUrl} alt="" draggable={false} />
                </div>
                <span className="event-overlay-editor__template-name">{t[template.nameKey]}</span>
              </button>
            ))}
            <button
              type="button"
              role="option"
              aria-selected={activeId === 'custom'}
              className={`event-overlay-editor__template event-overlay-editor__template--custom ${activeId === 'custom' ? 'event-overlay-editor__template--active' : ''}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="event-overlay-editor__template-preview event-overlay-editor__template-preview--custom">
                {customImageUrl ? (
                  <img src={customImageUrl} alt="" draggable={false} />
                ) : (
                  <span className="event-overlay-editor__upload-icon">+</span>
                )}
              </div>
              <span className="event-overlay-editor__template-name">{t.eventOverlayCustom}</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/svg+xml,.png,.svg"
              className="event-overlay-editor__file-input"
              onChange={(e) => {
                void handleFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </div>

          {uploadError && (
            <p className="text-error event-overlay-editor__upload-error">{uploadError}</p>
          )}
          {activeId === 'custom' && (
            <p className="hint event-overlay-editor__upload-hint">{t.eventOverlayUploadHint}</p>
          )}

          <label className="event-overlay-editor__text-field">
            <span className="event-overlay-editor__text-label">{t.eventOverlayText}</span>
            <input
              type="text"
              className="event-overlay-editor__text-input"
              value={settings.text}
              maxLength={80}
              placeholder={t.eventOverlayTextPlaceholder}
              onChange={(e) =>
                onSettingsChange({
                  ...settings,
                  text: clampEventOverlayText(e.target.value),
                })
              }
            />
          </label>

          {showRibbonOptions && (
            <div className="event-overlay-editor__ribbon-options">
              <p className="event-overlay-editor__ribbon-heading">
                {t.eventOverlayRibbonHeading}
              </p>

              <div className="event-overlay-editor__ribbon-field">
                <span className="event-overlay-editor__text-label">
                  {t.eventOverlayRibbonColor}
                </span>
                <div
                  className="event-overlay-editor__ribbon-colors"
                  role="radiogroup"
                  aria-label={t.eventOverlayRibbonColor}
                >
                  {RIBBON_COLOR_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={ribbon.colorId === option.id}
                      aria-label={t[option.labelKey]}
                      title={t[option.labelKey]}
                      className={`event-overlay-editor__ribbon-swatch ${ribbon.colorId === option.id ? 'event-overlay-editor__ribbon-swatch--active' : ''}`}
                      style={{ background: option.swatch }}
                      onClick={() => patchRibbon({ colorId: option.id })}
                    />
                  ))}
                </div>
              </div>

              <label className="event-overlay-editor__ribbon-field">
                <span className="event-overlay-editor__text-label">
                  {t.eventOverlayRibbonFont}
                </span>
                <select
                  className="event-overlay-editor__ribbon-select"
                  value={ribbon.fontId}
                  style={{
                    fontFamily:
                      RIBBON_FONT_OPTIONS.find((o) => o.id === ribbon.fontId)
                        ?.fontFamily,
                  }}
                  onChange={(e) =>
                    patchRibbon({
                      fontId: e.target.value as EventOverlayRibbonStyle['fontId'],
                    })
                  }
                >
                  {RIBBON_FONT_OPTIONS.map((option) => (
                    <option
                      key={option.id}
                      value={option.id}
                      style={{ fontFamily: option.fontFamily }}
                    >
                      {t[option.labelKey]} — {t[option.hintKey]}
                    </option>
                  ))}
                </select>
              </label>

              <div className="event-overlay-editor__ribbon-field">
                <span className="event-overlay-editor__text-label">
                  {t.eventOverlayRibbonAlign}
                </span>
                <div
                  className="event-overlay-editor__ribbon-segmented"
                  role="radiogroup"
                  aria-label={t.eventOverlayRibbonAlign}
                >
                  {RIBBON_ALIGN_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={ribbon.align === option.id}
                      className={`event-overlay-editor__ribbon-segment ${ribbon.align === option.id ? 'event-overlay-editor__ribbon-segment--active' : ''}`}
                      onClick={() => patchRibbon({ align: option.id })}
                    >
                      {t[option.labelKey]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="event-overlay-editor__ribbon-field">
                <span className="event-overlay-editor__text-label">
                  {t.eventOverlayRibbonSize}
                </span>
                <div
                  className="event-overlay-editor__ribbon-segmented"
                  role="radiogroup"
                  aria-label={t.eventOverlayRibbonSize}
                >
                  {RIBBON_SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={ribbon.sizeId === option.id}
                      className={`event-overlay-editor__ribbon-segment ${ribbon.sizeId === option.id ? 'event-overlay-editor__ribbon-segment--active' : ''}`}
                      onClick={() => patchRibbon({ sizeId: option.id })}
                    >
                      {t[option.labelKey]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <aside className="event-overlay-editor__preview-wrap">
          <p className="event-overlay-editor__preview-label">{t.eventOverlayPreviewLabel}</p>
          <div className="event-overlay-editor__preview">
            <div className="event-overlay-editor__preview-photo" aria-hidden="true" />
            <EventOverlay
              settings={settings}
              enabled
              customImageUrl={customImageUrl}
              preview
            />
          </div>
        </aside>
      </div>
    </div>
  )
}
