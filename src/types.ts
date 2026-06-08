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

export type EventOverlayRibbonAlign = 'left' | 'center' | 'right'

export type EventOverlayRibbonFontId =
  | 'nunito'
  | 'oswald'
  | 'lora'
  | 'caveat'
  | 'dm-serif'

export type EventOverlayRibbonColorId =
  | 'pink'
  | 'gold'
  | 'blue'
  | 'red'
  | 'purple'

export type EventOverlayRibbonSizeId = 'sm' | 'md' | 'lg'

export type EventOverlayRibbonStyle = {
  colorId?: EventOverlayRibbonColorId
  fontId?: EventOverlayRibbonFontId
  align?: EventOverlayRibbonAlign
  sizeId?: EventOverlayRibbonSizeId
}

export type EventOverlaySettings = {
  templateId: EventOverlayTemplateId
  text: string
  ribbon?: EventOverlayRibbonStyle
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
