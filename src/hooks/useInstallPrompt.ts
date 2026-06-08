import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import {
  clearDeferredInstallPrompt,
  getDeferredInstallPrompt,
  subscribeInstallPrompt,
} from '../boot/installPromptCapture'

function isDesktop(): boolean {
  return window.matchMedia('(pointer: fine) and (min-width: 768px)').matches
}

function isInstalledPwa(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  )
}

function subscribeInstalled(callback: () => void) {
  const onInstalled = () => callback()
  const onDisplayMode = () => callback()
  window.addEventListener('appinstalled', onInstalled)
  window
    .matchMedia('(display-mode: standalone)')
    .addEventListener('change', onDisplayMode)
  return () => {
    window.removeEventListener('appinstalled', onInstalled)
    window
      .matchMedia('(display-mode: standalone)')
      .removeEventListener('change', onDisplayMode)
  }
}

export function useInstallPrompt() {
  const deferredPrompt = useSyncExternalStore(
    subscribeInstallPrompt,
    getDeferredInstallPrompt,
    () => null,
  )
  const [isInstalled, setIsInstalled] = useState(isInstalledPwa)
  const [isDesktopDevice, setIsDesktopDevice] = useState(isDesktop)

  useEffect(() => {
    const onResize = () => setIsDesktopDevice(isDesktop())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    return subscribeInstalled(() => setIsInstalled(isInstalledPwa()))
  }, [])

  const install = useCallback(async (): Promise<boolean> => {
    const prompt = getDeferredInstallPrompt()
    if (!prompt) return false
    await prompt.prompt()
    const choice = await prompt.userChoice
    clearDeferredInstallPrompt()
    if (choice.outcome === 'accepted') {
      setIsInstalled(true)
      return true
    }
    return false
  }, [])

  return {
    canInstall: !!deferredPrompt && isDesktopDevice && !isInstalled,
    isInstalled,
    isDesktopDevice,
    install,
  }
}
