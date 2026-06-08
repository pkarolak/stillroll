import { ListOrdered, RotateCw, Shuffle, Timer } from 'lucide-react'
import type { CSSProperties } from 'react'
import type { SlideOrder } from '../../types'
import { useLanguage } from '../../i18n/useLanguage'

type SlideshowSettingsProps = {
  duration: number
  order: SlideOrder
  correctOrientation: boolean
  onDurationChange: (value: number) => void
  onOrderChange: (value: SlideOrder) => void
  onCorrectOrientationChange: (value: boolean) => void
}

export function SlideshowSettings({
  duration,
  order,
  correctOrientation,
  onDurationChange,
  onOrderChange,
  onCorrectOrientationChange,
}: SlideshowSettingsProps) {
  const { t } = useLanguage()

  return (
    <>
      <div className="settings__row">
        <label className="settings__label" htmlFor="duration">
          <Timer size={16} strokeWidth={2} />
          {t.slideDuration}
        </label>
        <div className="settings__duration">
          <div className="settings__slider-wrap">
            <input
              id="duration"
              type="range"
              min={2}
              max={60}
              value={duration}
              onChange={(e) => onDurationChange(Number(e.target.value))}
              className="settings__slider"
              aria-valuetext={`${duration} ${t.seconds}`}
              style={
                { '--val': `${((duration - 2) / 58) * 100}%` } as CSSProperties
              }
            />
          </div>
          <span className="settings__badge" aria-hidden="true">
            {duration} {t.seconds}
          </span>
        </div>
      </div>

      <div className="settings__row">
        <span className="settings__label">
          <Shuffle size={16} strokeWidth={2} />
          {t.order}
        </span>
        <div className="segmented settings__segmented" role="group">
          <button
            type="button"
            className={`segmented__item ${order === 'folder' ? 'segmented__item--active' : ''}`}
            onClick={() => onOrderChange('folder')}
          >
            <ListOrdered size={18} strokeWidth={2} />
            {t.orderFolder}
          </button>
          <button
            type="button"
            className={`segmented__item ${order === 'random' ? 'segmented__item--active' : ''}`}
            onClick={() => onOrderChange('random')}
          >
            <Shuffle size={18} strokeWidth={2} />
            {t.orderRandom}
          </button>
        </div>
      </div>

      <div className="settings__row">
        <span className="settings__label">
          <RotateCw size={16} strokeWidth={2} />
          {t.exifLabel}
        </span>
        <div className="settings__switch">
          <p className="settings__switch-text">{t.exifHint}</p>
          <button
            type="button"
            role="switch"
            aria-checked={correctOrientation}
            aria-label={t.exifLabel}
            className={`toggle ${correctOrientation ? 'toggle--on' : ''}`}
            onClick={() => onCorrectOrientationChange(!correctOrientation)}
          >
            <span className="toggle__thumb" />
          </button>
        </div>
      </div>
    </>
  )
}
