import type { SlideCaption } from '../types'
import { hasCaptionContent } from '../utils/captionUtils'

type SlideCaptionOverlayProps = {
  caption?: SlideCaption
  visible: boolean
}

export function SlideCaptionOverlay({
  caption,
  visible,
}: SlideCaptionOverlayProps) {
  if (!visible) return null

  const showText = hasCaptionContent(caption)
  const metaParts = [caption?.place?.trim(), caption?.date?.trim()].filter(
    Boolean,
  )
  const metaLine = metaParts.join(' · ')
  const textLine = caption?.text?.trim()

  return (
    <div className="slide-caption" aria-live="polite">
      <div
        className={`slide-caption__scrim ${showText ? 'slide-caption__scrim--visible' : ''}`}
        aria-hidden="true"
      />
      <div
        className={`slide-caption__inner ${showText ? 'slide-caption__inner--visible' : ''}`}
      >
        {metaLine && <p className="slide-caption__meta">{metaLine}</p>}
        {textLine && <p className="slide-caption__text">{textLine}</p>}
      </div>
    </div>
  )
}
