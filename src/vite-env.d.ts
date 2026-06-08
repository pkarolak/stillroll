/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface LaunchParams {
  files: FileSystemFileHandle[]
}

interface LaunchQueue {
  setConsumer: (consumer: (params: LaunchParams) => void) => void
}

interface Window {
  launchQueue: LaunchQueue
}
