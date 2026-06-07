import { useEffect, useState, type CSSProperties } from 'react'
import {
  FolderOpen,
  Loader2,
  Play,
  RotateCw,
  Shuffle,
  Timer,
  ListOrdered,
} from 'lucide-react'
import type { ImageEntry, Slide, SlideOrder, SlideshowConfig } from '../types'
import { useLanguage } from '../i18n/useLanguage'
import { loadSavedFolder, pickFolder } from '../utils/collectImages'
import { naturalCompare } from '../utils/naturalSort'
import { resolveSlideFile } from '../utils/slideSource'
import { shuffle } from '../utils/shuffle'
import {
  trackFolderSelected,
  trackSlideshowStarted,
} from '../utils/analytics'
import { LanguageSwitcher } from './LanguageSwitcher'

type SetupPanelProps = {
  onStart: (slides: Slide[], config: SlideshowConfig) => void
}

export function SetupPanel({ onStart }: SetupPanelProps) {
  const { t, photos } = useLanguage()
  const [folderName, setFolderName] = useState<string | null>(null)
  const [entries, setEntries] = useState<ImageEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(6)
  const [order, setOrder] = useState<SlideOrder>('folder')
  const [correctOrientation, setCorrectOrientation] = useState(true)
  const [starting, setStarting] = useState(false)
  const [restoring, setRestoring] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const saved = await loadSavedFolder()
        if (saved && saved.entries.length > 0) {
          setEntries(saved.entries)
          setFolderName(saved.folderName)
          trackFolderSelected(saved.entries.length, 'restored')
        }
      } catch {
        // Brak zapisanego folderu lub odmowa dostępu
      } finally {
        setRestoring(false)
      }
    })()
  }, [])

  const handlePickFolder = async () => {
    setError(null)
    setLoading(true)
    try {
      const result = await pickFolder()
      setEntries(result.entries)
      setFolderName(result.folderName)
      trackFolderSelected(result.entries.length, 'picker')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(t.errorFolder)
    } finally {
      setLoading(false)
    }
  }

  const handleStart = async () => {
    if (entries.length === 0 || starting) return

    let sorted = [...entries]
    if (order === 'folder') {
      sorted.sort((a, b) => naturalCompare(a.path, b.path))
    } else {
      sorted = shuffle(sorted)
    }

    const slides: Slide[] = sorted.map((entry) => ({
      path: entry.path,
      url: '',
      file: entry.file,
      handle: entry.handle,
    }))

    setStarting(true)
    try {
      const file = await resolveSlideFile(slides[0])
      slides[0].url = URL.createObjectURL(file)
      const slideshowConfig = { duration, order, correctOrientation }
      trackSlideshowStarted(slides.length, slideshowConfig)
      onStart(slides, slideshowConfig)
    } catch {
      setError(t.errorFirstPhoto)
    } finally {
      setStarting(false)
    }
  }

  const folderBtnLabel = restoring
    ? t.restoringFolder
    : loading
      ? t.scanning
      : folderName
        ? t.changeFolder
        : t.pickFolder

  return (
    <div className="setup">
      <div className="setup__card">
        <div className="setup__top">
          <LanguageSwitcher />
        </div>

        <header className="setup__header">
          <img
            src="/icon.png"
            alt=""
            className="setup__logo"
            width={72}
            height={72}
            draggable={false}
          />
          <div>
            <h1 className="setup__brand">
              Still<span className="setup__brand-accent">Roll</span>
            </h1>
            <p className="setup__subtitle">{t.tagline}</p>
          </div>
        </header>

        <section className="setup__section">
          <div className="setup__label">
            <FolderOpen size={14} />
            {t.folderLabel}
          </div>

          <button
            type="button"
            className="setup__folder-btn"
            onClick={handlePickFolder}
            disabled={loading || restoring}
          >
            {loading || restoring ? (
              <Loader2 size={18} className="setup__spin" />
            ) : (
              <FolderOpen size={18} />
            )}
            <span>{folderBtnLabel}</span>
          </button>

          {folderName && (
            <div className="setup__folder-badge">
              <span className="setup__folder-name">{folderName}</span>
              <span className="setup__folder-count">
                {entries.length} {photos(entries.length)}
              </span>
            </div>
          )}
          {error && <p className="setup__error">{error}</p>}
        </section>

        <section className="setup__section">
          <div className="setup__label">
            <Timer size={14} />
            {t.slideDuration}
          </div>
          <div className="setup__duration">
            <input
              id="duration"
              type="range"
              min={2}
              max={60}
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="setup__slider"
              style={{ '--val': `${((duration - 2) / 58) * 100}%` } as CSSProperties}
            />
            <div className="setup__duration-value">
              <input
                type="number"
                min={2}
                max={60}
                value={duration}
                onChange={(e) => {
                  const v = Math.min(60, Math.max(2, Number(e.target.value) || 2))
                  setDuration(v)
                }}
                className="setup__number"
                aria-label={t.slideDurationAria}
              />
              <span className="setup__unit">{t.seconds}</span>
            </div>
          </div>
        </section>

        <section className="setup__section">
          <div className="setup__label">
            <Shuffle size={14} />
            {t.order}
          </div>
          <div className="setup__segmented">
            <button
              type="button"
              className={`setup__segment ${order === 'folder' ? 'setup__segment--active' : ''}`}
              onClick={() => setOrder('folder')}
            >
              <ListOrdered size={15} />
              {t.orderFolder}
            </button>
            <button
              type="button"
              className={`setup__segment ${order === 'random' ? 'setup__segment--active' : ''}`}
              onClick={() => setOrder('random')}
            >
              <Shuffle size={15} />
              {t.orderRandom}
            </button>
          </div>
        </section>

        <section className="setup__section setup__section--row">
          <div className="setup__toggle-info">
            <div className="setup__label setup__label--inline">
              <RotateCw size={14} />
              {t.exifLabel}
            </div>
            <p className="setup__hint">{t.exifHint}</p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={correctOrientation}
            className={`setup__toggle ${correctOrientation ? 'setup__toggle--on' : ''}`}
            onClick={() => setCorrectOrientation((v) => !v)}
          >
            <span className="setup__toggle-thumb" />
          </button>
        </section>

        <button
          type="button"
          className="setup__start"
          onClick={handleStart}
          disabled={entries.length === 0 || starting}
        >
          {starting ? (
            <Loader2 size={18} className="setup__spin" />
          ) : (
            <Play size={18} fill="currentColor" />
          )}
          {starting ? t.loading : t.startShow}
        </button>

        <p className="setup__footer">{t.privacyFooter}</p>
      </div>
    </div>
  )
}
