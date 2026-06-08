import type { MouseEvent, PointerEvent } from 'react'
import { Maximize2 } from 'lucide-react'
import type { ImageEntry, SlideCaption } from '../../types'
import { CaptionFields } from './CaptionFields'

type CaptionTileProps = {
  entry: ImageEntry
  index: number
  caption: SlideCaption
  thumbUrl?: string
  onOpen: () => void
  onCaptionChange: (path: string, field: keyof SlideCaption, value: string) => void
}

function basename(path: string): string {
  const parts = path.split(/[/\\]/)
  return parts[parts.length - 1] || path
}

export function CaptionTile({
  entry,
  index,
  caption,
  thumbUrl,
  onOpen,
  onCaptionChange,
}: CaptionTileProps) {
  const stopFieldsBubble = (event: MouseEvent | PointerEvent) => {
    event.stopPropagation()
  }

  return (
    <article className="caption-editor__tile" onClick={onOpen}>
      <div className="caption-editor__tile-media">
        {thumbUrl ? (
          <img
            src={thumbUrl}
            alt=""
            className="caption-editor__tile-thumb"
            draggable={false}
          />
        ) : (
          <div className="caption-editor__tile-thumb caption-editor__tile-thumb--placeholder" />
        )}
        <span className="caption-editor__tile-index" aria-hidden="true">
          {index + 1}
        </span>
        <span className="caption-editor__tile-expand" aria-hidden="true">
          <Maximize2 size={14} strokeWidth={2} />
        </span>
      </div>

      <div className="caption-editor__tile-body">
        <div
          className="caption-editor__tile-fields"
          onClick={stopFieldsBubble}
          onMouseDown={stopFieldsBubble}
          onPointerDown={stopFieldsBubble}
        >
          <CaptionFields
            path={entry.path}
            caption={caption}
            compact
            onCaptionChange={onCaptionChange}
          />
        </div>
        <span className="caption-editor__tile-filename" title={basename(entry.path)}>
          {basename(entry.path)}
        </span>
      </div>
    </article>
  )
}
