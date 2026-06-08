import { useCallback, useEffect, useRef, useState } from 'react'
import type { Slide, SlideshowConfig } from '../types'
import { getOrientation } from '../utils/parseOrientation'
import { resolveSlideFile } from '../utils/slideSource'
import { shuffle } from '../utils/shuffle'

/** Tylko bieżący slajd + 1 w każdą stronę mają aktywny blob URL */
const URL_KEEP_WINDOW = 1
const ORIENTATION_WINDOW = 1

function wrapIndex(index: number, length: number): number {
  if (length === 0) return 0
  return ((index % length) + length) % length
}

function revokeSlideUrls(slides: Slide[]) {
  slides.forEach((s) => {
    if (s.url) URL.revokeObjectURL(s.url)
  })
}

export function useSlideshow(slides: Slide[], config: SlideshowConfig) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [slidesState, setSlidesState] = useState(slides)
  const [loopCount, setLoopCount] = useState(1)
  const prevIndexRef = useRef(0)
  const slidesRef = useRef(slidesState)
  const loadingRef = useRef(new Set<number>())

  useEffect(() => {
    slidesRef.current = slidesState
  }, [slidesState])

  const slidePathsKey = slidesState.map((s) => s.path).join('\0')

  const goTo = useCallback(
    (index: number) => {
      setCurrentIndex(wrapIndex(index, slidesState.length))
    },
    [slidesState.length],
  )

  const next = useCallback(() => {
    setCurrentIndex((i) => wrapIndex(i + 1, slidesState.length))
  }, [slidesState.length])

  const prev = useCallback(() => {
    setCurrentIndex((i) => wrapIndex(i - 1, slidesState.length))
  }, [slidesState.length])

  const pause = useCallback(() => setIsPaused(true), [])
  const resume = useCallback(() => setIsPaused(false), [])
  const togglePause = useCallback(() => setIsPaused((p) => !p), [])

  useEffect(() => {
    const len = slidesState.length
    if (len === 0) return

    const prev = prevIndexRef.current
    const completedLap = len > 1 && prev === len - 1 && currentIndex === 0

    if (completedLap) {
      setLoopCount((c) => c + 1)

      if (config.order === 'random') {
        requestAnimationFrame(() => {
          setSlidesState((prevSlides) => {
            revokeSlideUrls(prevSlides)
            loadingRef.current.clear()
            return shuffle(
              prevSlides.map((s) => ({
                ...s,
                url: '',
                orientation: undefined,
                caption: s.caption,
              })),
            )
          })
        })
      }
    }

    prevIndexRef.current = currentIndex
  }, [currentIndex, slidesState.length, config.order])

  useEffect(() => {
    if (isPaused || slidesState.length === 0) return
    if (!slidesState[currentIndex]?.url) return

    const timer = window.setTimeout(() => {
      setCurrentIndex((i) => wrapIndex(i + 1, slidesState.length))
    }, config.duration * 1000)

    return () => window.clearTimeout(timer)
  }, [isPaused, config.duration, slidesState, currentIndex])

  useEffect(() => {
    const len = slidesRef.current.length
    if (len === 0) return

    let cancelled = false

    const indicesToKeep = new Set<number>()
    for (let offset = -URL_KEEP_WINDOW; offset <= URL_KEEP_WINDOW; offset++) {
      indicesToKeep.add(wrapIndex(currentIndex + offset, len))
    }

    setSlidesState((prev) => {
      let changed = false
      const nextSlides = prev.map((slide, i) => {
        if (indicesToKeep.has(i)) return slide

        if (slide.url) {
          URL.revokeObjectURL(slide.url)
          changed = true
          return { ...slide, url: '', orientation: undefined }
        }
        if (slide.orientation !== undefined) {
          changed = true
          return { ...slide, orientation: undefined }
        }
        return slide
      })
      return changed ? nextSlides : prev
    })

    indicesToKeep.forEach((i) => {
      const slide = slidesRef.current[i]
      if (!slide || slide.url || loadingRef.current.has(i)) return

      loadingRef.current.add(i)

      void resolveSlideFile(slide)
        .then((file) => {
          if (cancelled) return
          const url = URL.createObjectURL(file)
          setSlidesState((prev) => {
            if (prev[i]?.url) {
              URL.revokeObjectURL(url)
              return prev
            }
            const updated = [...prev]
            updated[i] = { ...updated[i], url }
            return updated
          })
        })
        .catch(() => {})
        .finally(() => {
          loadingRef.current.delete(i)
        })
    })

    return () => {
      cancelled = true
    }
  }, [currentIndex, slidesState.length, slidePathsKey])

  useEffect(() => {
    if (!config.correctOrientation || slidesState.length === 0) return

    const indicesToParse = new Set<number>()
    for (let offset = -ORIENTATION_WINDOW; offset <= ORIENTATION_WINDOW; offset++) {
      indicesToParse.add(wrapIndex(currentIndex + offset, slidesState.length))
    }

    let cancelled = false

    indicesToParse.forEach((i) => {
      const slide = slidesRef.current[i]
      if (!slide || slide.orientation !== undefined) return

      void resolveSlideFile(slide)
        .then((file) => getOrientation(file))
        .then((orientation) => {
          if (cancelled) return
          setSlidesState((prev) => {
            if (prev[i]?.orientation !== undefined) return prev
            const updated = [...prev]
            updated[i] = { ...updated[i], orientation }
            return updated
          })
        })
        .catch(() => {})
    })

    return () => {
      cancelled = true
    }
  }, [currentIndex, config.correctOrientation, slidesState.length, slidePathsKey])

  const currentSlide = slidesState[currentIndex]
  const currentUrl = currentSlide?.url ?? ''

  return {
    slides: slidesState,
    currentIndex,
    currentSlide,
    currentUrl,
    isPaused,
    loopCount,
    next,
    prev,
    pause,
    resume,
    togglePause,
    goTo,
  }
}
