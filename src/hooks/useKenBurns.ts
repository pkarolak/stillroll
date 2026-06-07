import { useCallback, useEffect, useRef, useState } from 'react'

const ZOOM_AMOUNT = 0.04
const CROSSFADE_SEC = 1.2

function computeScale(elapsedMs: number, durationSec: number): number {
  const crossfadeMs = CROSSFADE_SEC * 1000
  const totalMs = durationSec * 1000

  if (elapsedMs < crossfadeMs) {
    return 1
  }

  const kbElapsed = elapsedMs - crossfadeMs
  const kbDuration = Math.max(totalMs - crossfadeMs, 1)
  const progress = Math.min(kbElapsed / kbDuration, 1)
  return 1 + ZOOM_AMOUNT * progress
}

export function useKenBurns(isPaused: boolean, durationSec: number) {
  const [layerScales, setLayerScales] = useState<[number, number]>([1, 1])
  const slideStartRef = useRef(0)
  const activeLayerRef = useRef<0 | 1>(0)

  const setActiveLayer = useCallback((layer: 0 | 1) => {
    activeLayerRef.current = layer
  }, [])

  const beginTransition = useCallback(
    (outgoingScale: number, incomingLayer: 0 | 1, outgoingLayer: 0 | 1) => {
      slideStartRef.current = performance.now()
      activeLayerRef.current = incomingLayer

      setLayerScales((prev) => {
        const next = [...prev] as [number, number]
        next[outgoingLayer] = outgoingScale
        next[incomingLayer] = 1
        return next
      })
    },
    [],
  )

  useEffect(() => {
    slideStartRef.current = performance.now()
  }, [])

  useEffect(() => {
    if (isPaused) return

    let raf = 0

    const animate = (now: number) => {
      const elapsed = now - slideStartRef.current
      const scale = computeScale(elapsed, durationSec)
      const active = activeLayerRef.current

      setLayerScales((prev) => {
        if (prev[active] === scale) return prev
        const next = [...prev] as [number, number]
        next[active] = scale
        return next
      })

      raf = requestAnimationFrame(animate)
    }

    raf = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf)
  }, [isPaused, durationSec])

  return { layerScales, beginTransition, setActiveLayer }
}
