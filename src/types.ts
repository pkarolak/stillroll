export type OrientationTransform = {
  rotate: number
  scaleX?: number
  scaleY?: number
}

export type Slide = {
  path: string
  url: string
  file?: File
  handle?: FileSystemFileHandle
  orientation?: OrientationTransform
}

export type SlideOrder = 'folder' | 'random'

export type SlideshowConfig = {
  duration: number
  order: SlideOrder
  correctOrientation: boolean
}

export type ImageEntry = {
  path: string
  file?: File
  handle?: FileSystemFileHandle
}
