import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import { useLanguage } from '../../i18n/useLanguage'
import { WARN_SLIDES } from '../../utils/offlinePackage/limits'
import { Button } from '../ui/Button'
import { InfoTooltip } from '../ui/InfoTooltip'

type AdvancedSettingsProps = {
  photoCount: number
  captionsEnabled: boolean
  onCaptionsEnabledChange: (value: boolean) => void
  onOpenCaptions: () => void
  eventOverlayEnabled: boolean
  onEventOverlayEnabledChange: (value: boolean) => void
  onOpenEventOverlay: () => void
}

export function AdvancedSettings({
  photoCount,
  captionsEnabled,
  onCaptionsEnabledChange,
  onOpenCaptions,
  eventOverlayEnabled,
  onEventOverlayEnabledChange,
  onOpenEventOverlay,
}: AdvancedSettingsProps) {
  const { t } = useLanguage()
  const captionsAvailable = photoCount > 0 && photoCount <= WARN_SLIDES

  return (
    <details className="advanced-settings">
      <summary className="advanced-settings__summary">
        <span className="advanced-settings__summary-label">
          <SlidersHorizontal size={16} strokeWidth={2} aria-hidden="true" />
          {t.advancedSettings}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={2}
          className="advanced-settings__chevron"
          aria-hidden="true"
        />
      </summary>
      <div className="advanced-settings__body">
        <div className="advanced-settings__captions-row">
          <button
            type="button"
            role="switch"
            aria-checked={captionsEnabled}
            aria-label={t.captionsShowInSlideshow}
            className={`toggle ${captionsEnabled ? 'toggle--on' : ''}`}
            disabled={!captionsAvailable}
            onClick={() => onCaptionsEnabledChange(!captionsEnabled)}
          >
            <span className="toggle__thumb" />
          </button>

          <span className="advanced-settings__captions-label">
            {t.captionsLabel}
            <InfoTooltip text={t.captionsShowHint} />
          </span>

          <Button
            variant="secondary"
            small
            disabled={!captionsAvailable || !captionsEnabled}
            onClick={onOpenCaptions}
          >
            {t.captionsEdit}
          </Button>
        </div>

        <div className="advanced-settings__captions-row">
          <button
            type="button"
            role="switch"
            aria-checked={eventOverlayEnabled}
            aria-label={t.eventOverlayShowHint}
            className={`toggle ${eventOverlayEnabled ? 'toggle--on' : ''}`}
            disabled={photoCount === 0}
            onClick={() => onEventOverlayEnabledChange(!eventOverlayEnabled)}
          >
            <span className="toggle__thumb" />
          </button>

          <span className="advanced-settings__captions-label">
            {t.eventOverlayLabel}
            <InfoTooltip text={t.eventOverlayShowHint} />
          </span>

          <Button
            variant="secondary"
            small
            disabled={photoCount === 0 || !eventOverlayEnabled}
            onClick={onOpenEventOverlay}
          >
            {t.eventOverlayEdit}
          </Button>
        </div>

        {photoCount === 0 && (
          <p className="hint advanced-settings__hint">{t.captionsNoPhotos}</p>
        )}
        {!captionsAvailable && photoCount > WARN_SLIDES && (
          <p className="hint advanced-settings__hint">{t.captionsTooManyPhotos}</p>
        )}
      </div>
    </details>
  )
}
