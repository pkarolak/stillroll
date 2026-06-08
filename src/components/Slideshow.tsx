import { useCallback, useEffect, useRef, useState } from 'react'
import type { Slide, SlideshowConfig } from '../types'
import { useFullscreen } from '../hooks/useFullscreen'
import { useKenBurns } from '../hooks/useKenBurns'
import { useSlideshow } from '../hooks/useSlideshow'
import { useWakeLock } from '../hooks/useWakeLock'
import {
  trackSlideshowEnded,
  trackSlideshowNavigate,
  trackSlideshowPause,
} from '../utils/analytics'
import { transformToCss } from '../utils/parseOrientation'
import { SlideControls } from './SlideControls'
import { SlideCaptionOverlay } from './SlideCaptionOverlay'
import { EventOverlay } from './EventOverlay'

type SlideshowProps = {
  slides: Slide[]
  config: SlideshowConfig
  customEventOverlayUrl?: string | null
  onExit: () => void
}

const CONTROLS_HIDE_DELAY = 2500

export function Slideshow({
  slides,
  config,
  customEventOverlayUrl,
  onExit,
}: SlideshowProps) {
  const { enter, exit } = useFullscreen()
  const {
    slides: slidesState,
    currentIndex,
    currentSlide,
    currentUrl,
    isPaused,
    loopCount,
    next,
    prev,
    togglePause,
  } = useSlideshow(slides, config)

  useWakeLock(!isPaused)

  const [activeLayer, setActiveLayer] = useState<0 | 1>(0)
  const [layerUrls, setLayerUrls] = useState<[string, string]>(['', ''])
  const [layerTransforms, setLayerTransforms] = useState<[string, string]>([
    'none',
    'none',
  ])
  const [controlsVisible, setControlsVisible] = useState(false)
  const prevIndexRef = useRef(-1)
  const hideControlsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const layerScalesRef = useRef<[number, number]>([1, 1])

  const { layerScales, beginTransition, setActiveLayer: setKenBurnsLayer } =
    useKenBurns(isPaused, config.duration)

  useEffect(() => {
    layerScalesRef.current = layerScales
  }, [layerScales])

  const showControls = useCallback(() => {
    setControlsVisible(true)
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current)
    }
    hideControlsTimerRef.current = setTimeout(() => {
      setControlsVisible(false)
    }, CONTROLS_HIDE_DELAY)
  }, [])

  useEffect(() => {
    return () => {
      if (hideControlsTimerRef.current) {
        clearTimeout(hideControlsTimerRef.current)
      }
    }
  }, [])

  useEffect(() => {
    void enter()
    return () => {
      void exit()
    }
  }, [enter, exit])

  useEffect(() => {
    if (!currentUrl || !currentSlide) return

    const transform = currentSlide.orientation
      ? transformToCss(currentSlide.orientation)
      : 'none'

    if (prevIndexRef.current === -1) {
      setLayerUrls((prev) => {
        const nextUrls = [...prev] as [string, string]
        nextUrls[0] = currentUrl
        return nextUrls
      })
      setLayerTransforms((prev) => {
        const nextTransforms = [...prev] as [string, string]
        nextTransforms[0] = transform
        return nextTransforms
      })
      prevIndexRef.current = currentIndex
      return
    }

    if (prevIndexRef.current === currentIndex) {
      setLayerTransforms((prev) => {
        const nextTransforms = [...prev] as [string, string]
        nextTransforms[activeLayer] = transform
        return nextTransforms
      })
      return
    }

    const outgoingLayer = activeLayer
    const incomingLayer = (1 - activeLayer) as 0 | 1
    beginTransition(
      layerScalesRef.current[outgoingLayer],
      incomingLayer,
      outgoingLayer,
    )
    setKenBurnsLayer(incomingLayer)

    setLayerUrls((prev) => {
      const nextUrls = [...prev] as [string, string]
      nextUrls[incomingLayer] = currentUrl
      return nextUrls
    })
    setLayerTransforms((prev) => {
      const nextTransforms = [...prev] as [string, string]
      nextTransforms[incomingLayer] = transform
      return nextTransforms
    })

    requestAnimationFrame(() => {
      setActiveLayer(incomingLayer)
      prevIndexRef.current = currentIndex
    })
  }, [currentIndex, currentUrl, currentSlide, activeLayer, beginTransition, setKenBurnsLayer])

  const handleTogglePause = useCallback(() => {
    trackSlideshowPause(!isPaused)
    togglePause()
  }, [isPaused, togglePause])

  const handleNext = useCallback(() => {
    trackSlideshowNavigate('next')
    next()
  }, [next])

  const handlePrev = useCallback(() => {
    trackSlideshowNavigate('prev')
    prev()
  }, [prev])

  const handleExit = useCallback(() => {
    trackSlideshowEnded(slidesState.length, loopCount, config.duration)
    void exit()
    slidesState.forEach((s) => {
      if (s.url) URL.revokeObjectURL(s.url)
    })
    onExit()
  }, [config.duration, exit, loopCount, onExit, slidesState])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      showControls()

      if (e.key === ' ') {
        e.preventDefault()
        handleTogglePause()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'Escape') {
        handleExit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleTogglePause, handleNext, handlePrev, handleExit, showControls])

  return (
    <div className="slideshow" onMouseMove={showControls}>
      <div className="slideshow__stage">
        {[0, 1].map((layer) => (
          <div
            key={layer}
            className={`slideshow__layer ${activeLayer === layer ? 'slideshow__layer--active' : ''}`}
          >
            {layerUrls[layer] && (
              <div
                className="slideshow__kenburns"
                style={{ transform: `scale(${layerScales[layer]})` }}
              >
                <img
                  src={layerUrls[layer]}
                  alt=""
                  className="slideshow__image"
                  style={{ transform: layerTransforms[layer] }}
                  draggable={false}
                  onError={() => next()}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <EventOverlay
        settings={config.eventOverlay}
        enabled={config.eventOverlayEnabled}
        customImageUrl={customEventOverlayUrl}
      />

      <SlideCaptionOverlay
        caption={currentSlide?.caption}
        visible={config.captionsEnabled}
      />

      <SlideControls
        visible={controlsVisible}
        isPaused={isPaused}
        currentIndex={currentIndex}
        total={slidesState.length}
        loopCount={loopCount}
        onTogglePause={handleTogglePause}
        onPrev={handlePrev}
        onNext={handleNext}
        onExit={handleExit}
      />
    </div>
  )
}
