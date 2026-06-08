import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { useCallback, useEffect } from 'react'
import type { ImageEntry, SlideCaption } from '../../types'
import { useLanguage } from '../../i18n/useLanguage'
import { CaptionFields } from './CaptionFields'

type CaptionPreviewModalProps = {
  entries: ImageEntry[]
  index: number
  captionsByPath: Record<string, SlideCaption>
  thumbUrls: Record<string, string>
  onClose: () => void
  onNavigate: (index: number) => void
  onCaptionChange: (path: string, field: keyof SlideCaption, value: string) => void
}

function basename(path: string): string {
  const parts = path.split(/[/\\]/)
  return parts[parts.length - 1] || path
}

export function CaptionPreviewModal({
  entries,
  index,
  captionsByPath,
  thumbUrls,
  onClose,
  onNavigate,
  onCaptionChange,
}: CaptionPreviewModalProps) {
  const { t } = useLanguage()
  const entry = entries[index]
  const caption = captionsByPath[entry.path] ?? {}
  const thumbUrl = thumbUrls[entry.path]
  const hasPrev = index > 0
  const hasNext = index < entries.length - 1

  const goPrev = useCallback(() => {
    if (hasPrev) onNavigate(index - 1)
  }, [hasPrev, index, onNavigate])

  const goNext = useCallback(() => {
    if (hasNext) onNavigate(index + 1)
  }, [hasNext, index, onNavigate])

  useEffect(() => {
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose()
        return
      }

      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        goPrev()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        goNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [goNext, goPrev, onClose])

  return (
    <div
      className="caption-modal"
      role="dialog"
      aria-modal="true"
      aria-label={t.captionsEditorTitle}
    >
      <button
        type="button"
        className="caption-modal__backdrop"
        onClick={onClose}
        aria-label={t.captionsClose}
      />

      <div className="caption-modal__panel">
        <header className="caption-modal__header">
          <div className="caption-modal__header-main">
            <span className="caption-modal__badge">
              {index + 1}
              <span className="caption-modal__badge-sep">/</span>
              {entries.length}
            </span>
            <p className="caption-modal__filename" title={basename(entry.path)}>
              {basename(entry.path)}
            </p>
          </div>
          <button
            type="button"
            className="caption-modal__close"
            onClick={onClose}
            aria-label={t.captionsClose}
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        <div className="caption-modal__body">
          <div className="caption-modal__stage">
            <button
              type="button"
              className="caption-modal__nav caption-modal__nav--prev"
              onClick={goPrev}
              disabled={!hasPrev}
              aria-label={t.prevSlide}
            >
              <ChevronLeft size={22} strokeWidth={1.75} />
            </button>

            <div className="caption-modal__preview">
              {thumbUrl ? (
                <img
                  src={thumbUrl}
                  alt=""
                  className="caption-modal__image"
                  draggable={false}
                />
              ) : (
                <div className="caption-modal__image caption-modal__image--placeholder" />
              )}
            </div>

            <button
              type="button"
              className="caption-modal__nav caption-modal__nav--next"
              onClick={goNext}
              disabled={!hasNext}
              aria-label={t.nextSlide}
            >
              <ChevronRight size={22} strokeWidth={1.75} />
            </button>
          </div>

          <aside className="caption-modal__form">
            <CaptionFields
              path={entry.path}
              caption={caption}
              onCaptionChange={onCaptionChange}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}
