import { useEffect } from 'react'

export function useWakeLock(enabled: boolean) {
  useEffect(() => {
    if (!enabled || !('wakeLock' in navigator)) return

    let lock: WakeLockSentinel | null = null

    const request = async () => {
      try {
        if (document.visibilityState === 'visible') {
          lock = await navigator.wakeLock.request('screen')
        }
      } catch {
        // Wake Lock niedostępny lub odrzucony — pokaz działa dalej
      }
    }

    void request()

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void request()
      }
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      void lock?.release()
    }
  }, [enabled])
}
