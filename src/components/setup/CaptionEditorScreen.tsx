import { Loader2 } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ImageEntry, SlideCaption } from '../../types'
import { useLanguage } from '../../i18n/useLanguage'
import { batchExtractCaptionHints } from '../../utils/extractCaptionHints'
import { naturalCompare } from '../../utils/naturalSort'
import { resolveSlideFile } from '../../utils/slideSource'
import { hasCaptionContent } from '../../utils/captionUtils'
import { Button } from '../ui/Button'
import { CaptionPreviewModal } from './CaptionPreviewModal'
import { CaptionTile } from './CaptionTile'

type CaptionEditorScreenProps = {
  entries: ImageEntry[]
  captionsByPath: Record<string, SlideCaption>
  onCaptionChange: (path: string, field: keyof SlideCaption, value: string) => void
  onBack: () => void
}

export function CaptionEditorScreen({
  entries,
  captionsByPath,
  onCaptionChange,
  onBack,
}: CaptionEditorScreenProps) {
  const { t, language, captionsProgress } = useLanguage()
  const [thumbUrls, setThumbUrls] = useState<Record<string, string>>({})
  const [exifLoading, setExifLoading] = useState(false)
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const exifStartedRef = useRef(false)

  const sortedEntries = useMemo(
    () => [...entries].sort((a, b) => naturalCompare(a.path, b.path)),
    [entries],
  )

  const captionFilledCount = useMemo(
    () =>
      sortedEntries.filter((entry) =>
        hasCaptionContent(captionsByPath[entry.path]),
      ).length,
    [sortedEntries, captionsByPath],
  )

  useEffect(() => {
    let cancelled = false
    const urls: Record<string, string> = {}

    void (async () => {
      for (const entry of sortedEntries) {
        if (cancelled) return
        try {
          const file = await resolveSlideFile({
            path: entry.path,
            url: '',
            file: entry.file,
            handle: entry.handle,
          })
          if (cancelled) return
          urls[entry.path] = URL.createObjectURL(file)
          setThumbUrls((prev) => ({ ...prev, [entry.path]: urls[entry.path] }))
        } catch {
          // skip broken thumb
        }
      }
    })()

    return () => {
      cancelled = true
      Object.values(urls).forEach((url) => URL.revokeObjectURL(url))
    }
  }, [sortedEntries])

  const runExifPrefill = useCallback(async () => {
    setExifLoading(true)
    try {
      const pending: Array<{ path: string; file: File }> = []
      for (const entry of sortedEntries) {
        const existing = captionsByPath[entry.path]
        if (existing?.date?.trim() && existing?.place?.trim()) continue
        try {
          const file = await resolveSlideFile({
            path: entry.path,
            url: '',
            file: entry.file,
            handle: entry.handle,
          })
          pending.push({ path: entry.path, file })
        } catch {
          // skip
        }
      }

      await batchExtractCaptionHints(pending, language, (path, hints) => {
        const existing = captionsByPath[path]
        if (hints.date && !existing?.date?.trim()) {
          onCaptionChange(path, 'date', hints.date)
        }
        if (hints.place && !existing?.place?.trim()) {
          onCaptionChange(path, 'place', hints.place)
        }
      })
    } finally {
      setExifLoading(false)
    }
  }, [sortedEntries, captionsByPath, language, onCaptionChange])

  useEffect(() => {
    if (exifStartedRef.current) return
    exifStartedRef.current = true
    void runExifPrefill()
  }, [runExifPrefill])

  return (
    <div className="caption-editor">
      <header className="caption-editor__bar">
        <div className="caption-editor__bar-head">
          <h2 className="caption-editor__title">{t.captionsEditorTitle}</h2>
          <Button variant="primary" small className="caption-editor__done" onClick={onBack}>
            {t.captionsDone}
          </Button>
        </div>
        <span
          className={`caption-editor__progress ${captionFilledCount === sortedEntries.length && sortedEntries.length > 0 ? 'caption-editor__progress--complete' : ''}`}
        >
          {captionsProgress(captionFilledCount, sortedEntries.length)}
        </span>
        {exifLoading && (
          <span className="caption-editor__exif-status">
            <Loader2 size={13} className="spin" aria-hidden="true" />
            {t.captionsExifLoading}
          </span>
        )}
      </header>

      <div className="caption-editor__grid">
        {sortedEntries.map((entry, index) => (
          <CaptionTile
            key={entry.path}
            entry={entry}
            index={index}
            caption={captionsByPath[entry.path] ?? {}}
            thumbUrl={thumbUrls[entry.path]}
            onOpen={() => setPreviewIndex(index)}
            onCaptionChange={onCaptionChange}
          />
        ))}
      </div>

      {previewIndex !== null && (
        <CaptionPreviewModal
          entries={sortedEntries}
          index={previewIndex}
          captionsByPath={captionsByPath}
          thumbUrls={thumbUrls}
          onClose={() => setPreviewIndex(null)}
          onNavigate={setPreviewIndex}
          onCaptionChange={onCaptionChange}
        />
      )}
    </div>
  )
}
