import { track } from '@vercel/analytics'

export function photoCountBucket(count: number): string {
  if (count <= 1) return '1'
  if (count <= 10) return '2-10'
  if (count <= 50) return '11-50'
  if (count <= 200) return '51-200'
  return '200+'
}

export function trackFolderSelected(count: number, source: 'picker' | 'restored') {
  track('folder_selected', {
    photo_count: photoCountBucket(count),
    source,
  })
}

export function trackSlideshowStarted(
  count: number,
  config: { duration: number; order: string; correctOrientation: boolean },
) {
  track('slideshow_started', {
    photo_count: photoCountBucket(count),
    duration: String(config.duration),
    order: config.order,
    exif: config.correctOrientation ? 'on' : 'off',
  })
}

export function trackSlideshowEnded(
  count: number,
  loopsCompleted: number,
  duration: number,
) {
  track('slideshow_ended', {
    photo_count: photoCountBucket(count),
    loops: String(loopsCompleted),
    duration: String(duration),
  })
}

export function trackLanguageChanged(language: string) {
  track('language_changed', { language })
}

export function trackSlideshowPause(paused: boolean) {
  track('slideshow_pause', { paused: paused ? 'true' : 'false' })
}

export function trackSlideshowNavigate(direction: 'prev' | 'next') {
  track('slideshow_navigate', { direction })
}
