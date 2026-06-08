import { openSlideshowDb, SETTINGS_STORE } from './slideshowDb'

const HANDLE_KEY = 'lastFolderHandle'

export async function saveFolderHandle(
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  const db = await openSlideshowDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readwrite')
    tx.objectStore(SETTINGS_STORE).put(handle, HANDLE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openSlideshowDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readonly')
    const request = tx.objectStore(SETTINGS_STORE).get(HANDLE_KEY)
    request.onsuccess = () => {
      const handle = request.result
      if (handle?.kind === 'directory') {
        resolve(handle as FileSystemDirectoryHandle)
      } else {
        resolve(null)
      }
    }
    request.onerror = () => reject(request.error)
  })
}

async function ensureReadPermission(
  handle: FileSystemDirectoryHandle,
): Promise<boolean> {
  const current = await handle.queryPermission({ mode: 'read' })
  if (current === 'granted') return true
  if (current === 'denied') return false
  const requested = await handle.requestPermission({ mode: 'read' })
  return requested === 'granted'
}

export async function clearFolderHandle(): Promise<void> {
  const db = await openSlideshowDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SETTINGS_STORE, 'readwrite')
    tx.objectStore(SETTINGS_STORE).delete(HANDLE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadSavedFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
  try {
    const handle = await loadFolderHandle()
    if (!handle) return null
    const allowed = await ensureReadPermission(handle)
    return allowed ? handle : null
  } catch {
    return null
  }
}
