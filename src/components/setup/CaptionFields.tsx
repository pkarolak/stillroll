import type { SlideCaption } from '../../types'
import { useLanguage } from '../../i18n/useLanguage'
import { trimCaptionField } from '../../utils/captionUtils'

type CaptionFieldsProps = {
  path: string
  caption: SlideCaption
  compact?: boolean
  onCaptionChange: (path: string, field: keyof SlideCaption, value: string) => void
}

export function CaptionFields({
  path,
  caption,
  compact = false,
  onCaptionChange,
}: CaptionFieldsProps) {
  const { t } = useLanguage()
  const fieldClass = compact
    ? 'caption-editor__field caption-editor__field--compact'
    : 'caption-editor__field'

  return (
    <div
      className={
        compact ? 'caption-editor__fields caption-editor__fields--compact' : 'caption-editor__fields'
      }
    >
      <div
        className={
          compact
            ? 'caption-editor__meta-row caption-editor__meta-row--compact'
            : 'caption-editor__meta-row'
        }
      >
        <label className={fieldClass}>
          {!compact && (
            <span className="field-label field-label--inline">{t.captionDate}</span>
          )}
          <input
            type="text"
            className="caption-editor__input"
            value={caption.date ?? ''}
            placeholder={t.captionDatePlaceholder}
            aria-label={t.captionDate}
            onChange={(e) => onCaptionChange(path, 'date', e.target.value)}
            onBlur={(e) =>
              onCaptionChange(path, 'date', trimCaptionField(e.target.value))
            }
          />
        </label>
        <label className={fieldClass}>
          {!compact && (
            <span className="field-label field-label--inline">{t.captionPlace}</span>
          )}
          <input
            type="text"
            className="caption-editor__input"
            value={caption.place ?? ''}
            placeholder={t.captionPlacePlaceholder}
            aria-label={t.captionPlace}
            onChange={(e) => onCaptionChange(path, 'place', e.target.value)}
            onBlur={(e) =>
              onCaptionChange(path, 'place', trimCaptionField(e.target.value))
            }
          />
        </label>
      </div>
      <label className={fieldClass}>
        {!compact && (
          <span className="field-label field-label--inline">{t.captionText}</span>
        )}
        <input
          type="text"
          className="caption-editor__input"
          value={caption.text ?? ''}
          placeholder={t.captionTextPlaceholder}
          aria-label={t.captionText}
          onChange={(e) => onCaptionChange(path, 'text', e.target.value)}
          onBlur={(e) =>
            onCaptionChange(path, 'text', trimCaptionField(e.target.value))
          }
        />
      </label>
    </div>
  )
}
