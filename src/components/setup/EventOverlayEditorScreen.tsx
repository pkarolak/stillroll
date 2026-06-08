import { useRef, useState } from 'react'
import type { EventOverlaySettings, EventOverlayTemplateId } from '../../types'
import {
  DEFAULT_EVENT_OVERLAY_TEMPLATE_ID,
  EVENT_OVERLAY_TEMPLATES,
} from '../../data/eventOverlayTemplates'
import { useLanguage } from '../../i18n/useLanguage'
import { EventOverlay } from '../EventOverlay'
import { Button } from '../ui/Button'
import {
  clampEventOverlayText,
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

  const selectTemplate = (id: EventOverlayTemplateId) => {
    if (id === 'custom') {
      fileInputRef.current?.click()
      return
    }
    onSettingsChange({ ...settings, templateId: id })
  }

  const handleFile = async (file: File | undefined) => {
    if (!file) return
    if (file.type !== 'image/png') {
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

      <div className="event-overlay-editor__templates">
        {EVENT_OVERLAY_TEMPLATES.map((template) => (
          <button
            key={template.id}
            type="button"
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
          accept="image/png"
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
      <p className="hint event-overlay-editor__upload-hint">{t.eventOverlayUploadHint}</p>

      <label className="event-overlay-editor__text-field field">
        <span className="field-label">{t.eventOverlayText}</span>
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

      <div className="event-overlay-editor__preview-wrap">
        <p className="event-overlay-editor__preview-label">{t.eventOverlayPreviewLabel}</p>
        <div className="event-overlay-editor__preview">
          <div className="event-overlay-editor__preview-photo" aria-hidden="true" />
          <div className="event-overlay-editor__preview-safe" aria-hidden="true" />
          <EventOverlay
            settings={settings}
            enabled
            customImageUrl={customImageUrl}
            preview
          />
        </div>
      </div>
    </div>
  )
}
