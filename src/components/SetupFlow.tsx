import {
  useCallback,
  useEffect,
  useState,
  type DragEvent,
} from 'react'
import type { ImageEntry, Slide, SlideOrder, SlideshowConfig } from '../types'
import { onLaunchFile } from '../boot/fileLaunch'
import { useLanguage } from '../i18n/useLanguage'
import { loadSavedFolder, pickFolder } from '../utils/collectImages'
import { clearFolderHandle } from '../utils/folderStorage'
import { naturalCompare } from '../utils/naturalSort'
import { resolveSlideFile } from '../utils/slideSource'
import { shuffle } from '../utils/shuffle'
import {
  trackFolderSelected,
  trackSlideshowStarted,
} from '../utils/analytics'
import type { ExportQuality } from '../workers/packageWorker'
import { packageErrorMessage } from '../utils/offlinePackage/errors'
import {
  downloadStillrollPackage,
  exportStillrollPackage,
} from '../utils/offlinePackage/exportPackage'
import {
  configFromManifest,
  importStillrollPackage,
  type ImportedPackage,
} from '../utils/offlinePackage/importPackage'
import { canAutoStartPackage } from '../utils/offlinePackage/validatePackage'
import { MainSetupScreen } from './setup/MainSetupScreen'
import { PrepareWizard, type PrepareStep } from './setup/PrepareWizard'
import type { SetupSource } from './setup/SourcePicker'

type SetupScreen = 'setup' | 'prepare'

type SetupFlowProps = {
  onStart: (slides: Slide[], config: SlideshowConfig) => void
}

export function SetupFlow({ onStart }: SetupFlowProps) {
  const { t, language } = useLanguage()

  const [screen, setScreen] = useState<SetupScreen>('setup')
  const [prepareStep, setPrepareStep] = useState<PrepareStep>(2)
  const [source, setSource] = useState<SetupSource>('folder')
  const [folderName, setFolderName] = useState<string | null>(null)
  const [entries, setEntries] = useState<ImageEntry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [duration, setDuration] = useState(6)
  const [order, setOrder] = useState<SlideOrder>('folder')
  const [correctOrientation, setCorrectOrientation] = useState(true)
  const [starting, setStarting] = useState(false)
  const [restoring, setRestoring] = useState(true)
  const [exportQuality, setExportQuality] = useState<ExportQuality>('event')
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState('')
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState<ImportedPackage | null>(null)
  const [autoStarting, setAutoStarting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const startFromSlides = useCallback(
    async (slides: Slide[], config: SlideshowConfig) => {
      if (slides.length === 0) return
      setStarting(true)
      try {
        const file = await resolveSlideFile(slides[0])
        slides[0].url = URL.createObjectURL(file)
        trackSlideshowStarted(slides.length, config)
        onStart(slides, config)
      } catch {
        setError(t.errorFirstPhoto)
      } finally {
        setStarting(false)
      }
    },
    [onStart, t.errorFirstPhoto],
  )

  const openPackageFile = useCallback(
    async (file: File, autoStart = false) => {
      setError(null)
      setImported(null)
      setImporting(true)
      try {
        const result = await importStillrollPackage(file)
        setImported(result)

        const shouldAutoStart =
          autoStart &&
          canAutoStartPackage(result.archiveSize, result.slides.length)

        if (shouldAutoStart) {
          setAutoStarting(true)
          await startFromSlides(
            result.slides,
            configFromManifest(result.manifest),
          )
          setAutoStarting(false)
        }
      } catch (err) {
        const code = err instanceof Error ? err.message : 'IMPORT_FAILED'
        setError(packageErrorMessage(code, language))
      } finally {
        setImporting(false)
      }
    },
    [language, startFromSlides],
  )

  useEffect(() => {
    return onLaunchFile((file) => {
      setScreen('setup')
      setSource('package')
      void openPackageFile(file, true)
    })
  }, [openPackageFile])

  useEffect(() => {
    void (async () => {
      try {
        const saved = await loadSavedFolder()
        if (saved && saved.entries.length > 0) {
          setEntries(saved.entries)
          setFolderName(saved.folderName)
          trackFolderSelected(saved.entries.length, 'restored')
        }
      } catch {
        // Brak zapisanego folderu lub odmowa dostępu
      } finally {
        setRestoring(false)
      }
    })()
  }, [])

  const handleSourceChange = (next: SetupSource) => {
    setSource(next)
    setError(null)
    if (next === 'folder') {
      setImported(null)
    }
  }

  const handleClearFolder = () => {
    setEntries([])
    setFolderName(null)
    setError(null)
    void clearFolderHandle().catch(() => {})
  }

  const handlePickFolder = async () => {
    setError(null)
    setLoading(true)
    try {
      const result = await pickFolder()
      setEntries(result.entries)
      setFolderName(result.folderName)
      trackFolderSelected(result.entries.length, 'picker')
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(t.errorFolder)
    } finally {
      setLoading(false)
    }
  }

  const handleStartFromFolder = async () => {
    if (entries.length === 0 || starting) return

    let sorted = [...entries]
    if (order === 'folder') {
      sorted.sort((a, b) => naturalCompare(a.path, b.path))
    } else {
      sorted = shuffle(sorted)
    }

    const slides: Slide[] = sorted.map((entry) => ({
      path: entry.path,
      url: '',
      file: entry.file,
      handle: entry.handle,
    }))

    const slideshowConfig = { duration, order, correctOrientation }
    await startFromSlides(slides, slideshowConfig)
  }

  const handleSaveForLater = () => {
    if (entries.length === 0) return
    setError(null)
    setPrepareStep(2)
    setScreen('prepare')
  }

  const runExport = async () => {
    if (entries.length === 0 || exporting) return
    setExporting(true)
    setExportProgress('')
    setError(null)
    try {
      const blob = await exportStillrollPackage({
        name: folderName ?? 'StillRoll',
        entries,
        config: { duration, order, correctOrientation },
        quality: exportQuality,
        onProgress: (done, total) => {
          setExportProgress(`${t.exportProgress}: ${done}/${total}`)
        },
      })
      downloadStillrollPackage(blob, folderName ?? 'StillRoll')
      setPrepareStep(4)
    } catch (err) {
      const code = err instanceof Error ? err.message : 'EXPORT_FAILED'
      setError(packageErrorMessage(code, language))
    } finally {
      setExporting(false)
      setExportProgress('')
    }
  }

  const handleDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (!file) return
    setSource('package')
    void openPackageFile(file, false)
  }

  const resetPrepareWizard = () => {
    setScreen('setup')
    setPrepareStep(2)
    setSource('folder')
    setError(null)
  }

  const handlePrepareAnother = () => {
    handleClearFolder()
    setDuration(6)
    setOrder('folder')
    setCorrectOrientation(true)
    setExportQuality('event')
    resetPrepareWizard()
  }

  return (
    <div
      className={`setup ${dragOver && screen === 'setup' && source === 'package' ? 'setup--drag-over' : ''}`}
      onDragOver={(e) => {
        if (screen !== 'setup' || source !== 'package') return
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        if (screen !== 'setup' || source !== 'package') return
        handleDrop(e)
      }}
    >
      <div className="card">
        {screen === 'setup' && (
          <MainSetupScreen
            source={source}
            folderName={folderName}
            entries={entries}
            loading={loading}
            restoring={restoring}
            duration={duration}
            order={order}
            correctOrientation={correctOrientation}
            starting={starting}
            importing={importing}
            imported={imported}
            autoStarting={autoStarting}
            error={error}
            onSourceChange={handleSourceChange}
            onPickFolder={() => void handlePickFolder()}
            onClearFolder={handleClearFolder}
            onDurationChange={setDuration}
            onOrderChange={setOrder}
            onCorrectOrientationChange={setCorrectOrientation}
            onStart={() => void handleStartFromFolder()}
            onSaveForLater={handleSaveForLater}
            onOpenPackage={(file) => void openPackageFile(file, false)}
            onPackageStart={() => {
              if (!imported) return
              void startFromSlides(
                imported.slides,
                configFromManifest(imported.manifest),
              )
            }}
            onPackageCancel={() => setImported(null)}
          />
        )}

        {screen === 'prepare' && (
          <PrepareWizard
            step={prepareStep}
            entries={entries}
            exportQuality={exportQuality}
            exporting={exporting}
            exportProgress={exportProgress}
            error={error}
            onBack={() => {
              if (prepareStep === 2) {
                resetPrepareWizard()
              } else {
                setPrepareStep((s) => (s - 1) as PrepareStep)
              }
            }}
            onNext={() => setPrepareStep((s) => Math.min(4, s + 1) as PrepareStep)}
            onSkip={() => setPrepareStep(3)}
            onExportQualityChange={setExportQuality}
            onExport={() => void runExport()}
            onFinish={resetPrepareWizard}
            onPrepareAnother={handlePrepareAnother}
          />
        )}
      </div>
    </div>
  )
}
