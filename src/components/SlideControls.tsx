import {
  ChevronLeft,
  ChevronRight,
  Infinity as InfinityIcon,
  LogOut,
  Pause,
  Play,
} from 'lucide-react'
import { useLanguage } from '../i18n/useLanguage'

type SlideControlsProps = {
  visible: boolean
  isPaused: boolean
  currentIndex: number
  total: number
  loopCount: number
  onTogglePause: () => void
  onPrev: () => void
  onNext: () => void
  onExit: () => void
}

export function SlideControls({
  visible,
  isPaused,
  currentIndex,
  total,
  loopCount,
  onTogglePause,
  onPrev,
  onNext,
  onExit,
}: SlideControlsProps) {
  const { t } = useLanguage()

  return (
    <div
      className={`slide-controls ${visible ? 'slide-controls--visible' : ''}`}
    >
      <div className="slide-controls__bar">
        <button
          type="button"
          className="optical-chevron-prev"
          onClick={onPrev}
          aria-label={t.prevSlide}
        >
          <ChevronLeft size={20} strokeWidth={1.5} />
        </button>

        <button
          type="button"
          className="slide-controls__play"
          onClick={onTogglePause}
          aria-label={isPaused ? t.resume : t.pause}
        >
          {isPaused ? (
            <Play size={18} fill="currentColor" />
          ) : (
            <Pause size={18} />
          )}
        </button>

        <button
          type="button"
          className="optical-chevron-next"
          onClick={onNext}
          aria-label={t.nextSlide}
        >
          <ChevronRight size={20} strokeWidth={1.5} />
        </button>

        <div className="slide-controls__info">
          <span className="slide-controls__counter">
            {currentIndex + 1}
            <span className="slide-controls__sep">/</span>
            {total}
          </span>
          <span className="slide-controls__loop" title={t.infiniteMode}>
            <InfinityIcon size={11} strokeWidth={2} />
            {loopCount}
          </span>
        </div>

        <button
          type="button"
          className="slide-controls__exit"
          onClick={onExit}
        >
          <LogOut size={15} />
          {t.exit}
        </button>
      </div>
    </div>
  )
}
