const DB_NAME = 'slideshow'
export const DB_VERSION = 3
export const SETTINGS_STORE = 'settings'
export const CAPTIONS_STORE = 'captions'
export const EVENT_OVERLAY_STORE = 'eventOverlay'

export function openSlideshowDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains(SETTINGS_STORE)) {
        db.createObjectStore(SETTINGS_STORE)
      }
      if (!db.objectStoreNames.contains(CAPTIONS_STORE)) {
        db.createObjectStore(CAPTIONS_STORE)
      }
      if (!db.objectStoreNames.contains(EVENT_OVERLAY_STORE)) {
        db.createObjectStore(EVENT_OVERLAY_STORE)
      }
    }
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}
