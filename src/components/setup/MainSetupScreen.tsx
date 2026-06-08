import { Loader2, Play } from 'lucide-react'
import { Button } from '../ui/Button'
import type { ImageEntry, SlideOrder } from '../../types'
import type { ImportedPackage } from '../../utils/offlinePackage/importPackage'
import { useLanguage } from '../../i18n/useLanguage'
import { FolderSection } from './FolderSection'
import { PackageSection } from './PackageSection'
import { SlideshowSettings } from './SlideshowSettings'
import { SourcePicker, type SetupSource } from './SourcePicker'

type MainSetupScreenProps = {
  source: SetupSource
  folderName: string | null
  entries: ImageEntry[]
  loading: boolean
  restoring: boolean
  duration: number
  order: SlideOrder
  correctOrientation: boolean
  starting: boolean
  importing: boolean
  imported: ImportedPackage | null
  autoStarting: boolean
  error: string | null
  onSourceChange: (source: SetupSource) => void
  onPickFolder: () => void
  onDurationChange: (value: number) => void
  onOrderChange: (value: SlideOrder) => void
  onCorrectOrientationChange: (value: boolean) => void
  onStart: () => void
  onSaveForLater: () => void
  onOpenPackage: (file: File) => void
  onPackageStart: () => void
  onPackageCancel: () => void
}

export function MainSetupScreen({
  source,
  folderName,
  entries,
  loading,
  restoring,
  duration,
  order,
  correctOrientation,
  starting,
  importing,
  imported,
  autoStarting,
  error,
  onSourceChange,
  onPickFolder,
  onDurationChange,
  onOrderChange,
  onCorrectOrientationChange,
  onStart,
  onSaveForLater,
  onOpenPackage,
  onPackageStart,
  onPackageCancel,
}: MainSetupScreenProps) {
  const { t } = useLanguage()

  const canStartFolder = entries.length > 0 && !starting
  const canSaveForLater = entries.length > 0

  return (
    <div className="setup-flow main-setup">
      <SourcePicker source={source} onSourceChange={onSourceChange} />

      {source === 'folder' && (
        <>
          <div className="settings">
            <FolderSection
              folderName={folderName}
              entries={entries}
              loading={loading}
              restoring={restoring}
              onPickFolder={onPickFolder}
            />

            <SlideshowSettings
              duration={duration}
              order={order}
              correctOrientation={correctOrientation}
              onDurationChange={onDurationChange}
              onOrderChange={onOrderChange}
              onCorrectOrientationChange={onCorrectOrientationChange}
            />
          </div>

          <div className="actions">
            <Button
              variant="primary"
              block
              onClick={onStart}
              disabled={!canStartFolder}
            >
              {starting ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <Play size={18} fill="currentColor" />
              )}
              {starting ? t.loading : t.startShow}
            </Button>
            <Button
              variant="secondary"
              block
              className="btn--stacked"
              onClick={onSaveForLater}
              disabled={!canSaveForLater}
            >
              <span>{t.saveForLater}</span>
              <span className="btn__sublabel">{t.saveForLaterHint}</span>
            </Button>
          </div>
        </>
      )}

      {source === 'package' && (
        <div className="settings">
          <PackageSection
            imported={imported}
            importing={importing}
            autoStarting={autoStarting}
            starting={starting}
            onOpenPackage={onOpenPackage}
            onStart={onPackageStart}
            onCancel={onPackageCancel}
          />
        </div>
      )}

      {error && <p className="text-error">{error}</p>}
    </div>
  )
}
