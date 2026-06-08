export type OrientationTransform = {
  rotate: number
  scaleX?: number
  scaleY?: number
}

export type SlideCaption = {
  date?: string
  place?: string
  text?: string
}

export type Slide = {
  path: string
  url: string
  file?: File
  handle?: FileSystemFileHandle
  orientation?: OrientationTransform
  caption?: SlideCaption
}

export type SlideOrder = 'folder' | 'random'

export type EventOverlayTemplateId =
  | 'birthday'
  | 'wedding'
  | 'reunion'
  | 'anniversary'
  | 'graduation'
  | 'custom'

export type EventOverlaySettings = {
  templateId: EventOverlayTemplateId
  text: string
}

export type SlideshowConfig = {
  duration: number
  order: SlideOrder
  correctOrientation: boolean
  captionsEnabled: boolean
  eventOverlayEnabled: boolean
  eventOverlay?: EventOverlaySettings
}

export const DEFAULT_SLIDESHOW_CONFIG: SlideshowConfig = {
  duration: 6,
  order: 'folder',
  correctOrientation: true,
  captionsEnabled: false,
  eventOverlayEnabled: false,
}

export type ImageEntry = {
  path: string
  file?: File
  handle?: FileSystemFileHandle
}
