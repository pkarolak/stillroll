const DB_NAME = 'slideshow'
const STORE_NAME = 'settings'
const HANDLE_KEY = 'lastFolderHandle'

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1)
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME)
    }
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
  })
}

export async function saveFolderHandle(
  handle: FileSystemDirectoryHandle,
): Promise<void> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(handle, HANDLE_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

export async function loadFolderHandle(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDb()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).get(HANDLE_KEY)
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
