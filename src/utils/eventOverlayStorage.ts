import type { EventOverlaySettings } from '../types'
import { EVENT_OVERLAY_STORE, openSlideshowDb } from './slideshowDb'

export type StoredEventOverlay = {
  settings: EventOverlaySettings
  enabled: boolean
  customImageBlob?: Blob
  updatedAt: string
}

export function folderEventOverlayKey(folderName: string): string {
  return `folder::${folderName}`
}

export function packageEventOverlayKey(packageName: string): string {
  return `package::${packageName}`
}

export async function loadEventOverlay(
  storageKey: string,
): Promise<StoredEventOverlay | null> {
  try {
    const db = await openSlideshowDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(EVENT_OVERLAY_STORE, 'readonly')
      const request = tx.objectStore(EVENT_OVERLAY_STORE).get(storageKey)
      request.onsuccess = () => {
        const value = request.result as StoredEventOverlay | undefined
        resolve(value ?? null)
      }
      request.onerror = () => reject(request.error)
    })
  } catch {
    return null
  }
}

export async function saveEventOverlay(
  storageKey: string,
  data: StoredEventOverlay,
): Promise<void> {
  const db = await openSlideshowDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(EVENT_OVERLAY_STORE, 'readwrite')
    tx.objectStore(EVENT_OVERLAY_STORE).put(data, storageKey)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
