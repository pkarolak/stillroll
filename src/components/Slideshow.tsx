import { useCallback, useEffect, useRef, useState } from 'react'
import type { Slide, SlideshowConfig } from '../types'
import { useFullscreen } from '../hooks/useFullscreen'
import { useKenBurns } from '../hooks/useKenBurns'
import { useSlideshow } from '../hooks/useSlideshow'
import { useWakeLock } from '../hooks/useWakeLock'
import { transformToCss } from '../utils/parseOrientation'
import { SlideControls } from './SlideControls'

type SlideshowProps = {
  slides: Slide[]
  config: SlideshowConfig
  onExit: () => void
}

const CONTROLS_HIDE_DELAY = 2500

export function Slideshow({ slides, config, onExit }: SlideshowProps) {
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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      showControls()

      if (e.key === ' ') {
        e.preventDefault()
        togglePause()
      } else if (e.key === 'ArrowRight') {
        next()
      } else if (e.key === 'ArrowLeft') {
        prev()
      } else if (e.key === 'Escape') {
        onExit()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [togglePause, next, prev, onExit, showControls])

  const handleExit = () => {
    void exit()
    slidesState.forEach((s) => {
      if (s.url) URL.revokeObjectURL(s.url)
    })
    onExit()
  }

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

      <SlideControls
        visible={controlsVisible}
        isPaused={isPaused}
        currentIndex={currentIndex}
        total={slidesState.length}
        loopCount={loopCount}
        onTogglePause={togglePause}
        onPrev={prev}
        onNext={next}
        onExit={handleExit}
      />
    </div>
  )
}
