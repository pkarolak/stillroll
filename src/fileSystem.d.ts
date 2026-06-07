interface FileSystemHandle {
  readonly kind: 'file' | 'directory'
  readonly name: string
}

interface FileSystemFileHandle extends FileSystemHandle {
  readonly kind: 'file'
  getFile(): Promise<File>
}

type FileSystemPermissionMode = 'read' | 'readwrite'

interface FileSystemDirectoryHandle extends FileSystemHandle {
  readonly kind: 'directory'
  entries(): AsyncIterableIterator<[string, FileSystemHandle]>
  queryPermission(descriptor: { mode: FileSystemPermissionMode }): Promise<PermissionState>
  requestPermission(descriptor: { mode: FileSystemPermissionMode }): Promise<PermissionState>
}

interface WakeLockSentinel extends EventTarget {
  readonly released: boolean
  readonly type: 'screen'
  release(): Promise<void>
}

interface WakeLock {
  request(type: 'screen'): Promise<WakeLockSentinel>
}

interface Window {
  showDirectoryPicker(options?: { mode?: 'read' | 'readwrite' }): Promise<FileSystemDirectoryHandle>
}

interface Navigator {
  readonly wakeLock: WakeLock
}
