import type { SlideCaption } from '../types'
import { CAPTIONS_STORE, openSlideshowDb } from './slideshowDb'

export type StoredCaptions = {
  captionsByPath: Record<string, SlideCaption>
  captionsEnabled: boolean
  updatedAt: string
}

export function folderCaptionKey(folderName: string): string {
  return `folder::${folderName}`
}

export function packageCaptionKey(packageName: string): string {
  return `package::${packageName}`
}

export async function loadCaptions(
  storageKey: string,
): Promise<StoredCaptions | null> {
  try {
    const db = await openSlideshowDb()
    return new Promise((resolve, reject) => {
      const tx = db.transaction(CAPTIONS_STORE, 'readonly')
      const request = tx.objectStore(CAPTIONS_STORE).get(storageKey)
      request.onsuccess = () => {
        const value = request.result as StoredCaptions | undefined
        resolve(value ?? null)
      }
      request.onerror = () => reject(request.error)
    })
  } catch {
    return null
  }
}

export async function saveCaptions(
  storageKey: string,
  data: StoredCaptions,
): Promise<void> {
  const db = await openSlideshowDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(CAPTIONS_STORE, 'readwrite')
    tx.objectStore(CAPTIONS_STORE).put(data, storageKey)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}
