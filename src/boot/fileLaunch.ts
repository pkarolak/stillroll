type LaunchListener = (file: File) => void

let pendingFile: File | null = null
const listeners = new Set<LaunchListener>()

export function initFileLaunch(): void {
  if (!('launchQueue' in window)) return

  window.launchQueue.setConsumer(async (launchParams) => {
    if (!launchParams.files.length) return
    const file = await launchParams.files[0].getFile()
    pendingFile = file
    for (const listener of listeners) {
      listener(file)
    }
  })
}

export function onLaunchFile(listener: LaunchListener): () => void {
  listeners.add(listener)
  if (pendingFile) {
    const file = pendingFile
    pendingFile = null
    listener(file)
  }
  return () => listeners.delete(listener)
}
