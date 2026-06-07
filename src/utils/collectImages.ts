import type { ImageEntry } from '../types'
import { isImageFile } from './imageFormats'
import { loadSavedFolderHandle, saveFolderHandle } from './folderStorage'

export async function collectFromDirectoryHandle(
  handle: FileSystemDirectoryHandle,
  basePath = '',
): Promise<ImageEntry[]> {
  const entries: ImageEntry[] = []

  for await (const [name, entry] of handle.entries()) {
    const path = basePath ? `${basePath}/${name}` : name

    if (entry.kind === 'file' && isImageFile(name)) {
      entries.push({ path, handle: entry as FileSystemFileHandle })
    } else if (entry.kind === 'directory') {
      const nested = await collectFromDirectoryHandle(
        entry as FileSystemDirectoryHandle,
        path,
      )
      entries.push(...nested)
    }
  }

  return entries
}

export function supportsDirectoryPicker(): boolean {
  return 'showDirectoryPicker' in window
}

export async function scanDirectoryHandle(
  handle: FileSystemDirectoryHandle,
): Promise<{ entries: ImageEntry[]; folderName: string }> {
  const entries = await collectFromDirectoryHandle(handle)
  return { entries, folderName: handle.name }
}

export async function loadSavedFolder(): Promise<{
  entries: ImageEntry[]
  folderName: string
} | null> {
  const handle = await loadSavedFolderHandle()
  if (!handle) return null
  return scanDirectoryHandle(handle)
}

export async function pickFolderWithFSAPI(): Promise<{
  entries: ImageEntry[]
  folderName: string
}> {
  const handle = await window.showDirectoryPicker({ mode: 'read' })
  await saveFolderHandle(handle)
  return scanDirectoryHandle(handle)
}

export function pickFolderWithInput(): Promise<{
  entries: ImageEntry[]
  folderName: string
}> {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.multiple = true
    input.setAttribute('webkitdirectory', '')
    input.style.display = 'none'

    input.addEventListener('change', () => {
      const files = input.files
      document.body.removeChild(input)

      if (!files || files.length === 0) {
        reject(new DOMException('Anulowano wybór folderu', 'AbortError'))
        return
      }

      const entries: ImageEntry[] = []
      let folderName = ''

      for (const file of files) {
        const relativePath = file.webkitRelativePath || file.name
        if (!folderName && relativePath.includes('/')) {
          folderName = relativePath.split('/')[0]
        }
        if (isImageFile(file.name)) {
          entries.push({ file, path: relativePath })
        }
      }

      if (!folderName) {
        folderName = 'Wybrany folder'
      }

      resolve({ entries, folderName })
    })

    input.addEventListener('cancel', () => {
      document.body.removeChild(input)
      reject(new DOMException('Anulowano wybór folderu', 'AbortError'))
    })

    document.body.appendChild(input)
    input.click()
  })
}

export async function pickFolder(): Promise<{
  entries: ImageEntry[]
  folderName: string
}> {
  if (supportsDirectoryPicker()) {
    try {
      return await pickFolderWithFSAPI()
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err
      }
    }
  }
  return pickFolderWithInput()
}
