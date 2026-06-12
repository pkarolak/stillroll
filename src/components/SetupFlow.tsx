import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type DragEvent,
} from 'react'
import type {
  EventOverlaySettings,
  ImageEntry,
  Slide,
  SlideCaption,
  SlideOrder,
  SlideshowConfig,
} from '../types'
import { DEFAULT_EVENT_OVERLAY_TEMPLATE_ID } from '../data/eventOverlayTemplates'
import { onLaunchFile } from '../boot/fileLaunch'
import { useLanguage } from '../i18n/useLanguage'
import { loadSavedFolder, pickFolder } from '../utils/collectImages'
import { clearFolderHandle } from '../utils/folderStorage'
import { naturalCompare } from '../utils/naturalSort'
import { resolveSlideFile } from '../utils/slideSource'
import { resolveDisplayableBlob } from '../utils/resolveDisplayableImage'
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
import {
  folderCaptionKey,
  loadCaptions,
  packageCaptionKey,
  saveCaptions,
} from '../utils/captionStorage'
import {
  folderEventOverlayKey,
  loadEventOverlay,
  packageEventOverlayKey,
  saveEventOverlay,
} from '../utils/eventOverlayStorage'
import {
  clampCaptionField,
  hasCaptionContent,
  normalizeCaption,
} from '../utils/captionUtils'
import {
  hasEventOverlayContent,
  normalizeEventOverlay,
  overlayMimeFromBuffer,
} from '../utils/eventOverlayUtils'
import { MainSetupScreen } from './setup/MainSetupScreen'
import { PrepareWizard, type PrepareStep } from './setup/PrepareWizard'
import { CaptionEditorScreen } from './setup/CaptionEditorScreen'
import { EventOverlayEditorScreen } from './setup/EventOverlayEditorScreen'
import type { SetupSource } from './setup/SourcePicker'

type SetupScreen = 'setup' | 'prepare' | 'captions' | 'eventOverlay'

type StartOptions = {
  customEventOverlayUrl?: string | null
}

type SetupFlowProps = {
  onStart: (
    slides: Slide[],
    config: SlideshowConfig,
    options?: StartOptions,
  ) => void
}

function slidesToCaptionsMap(slides: Slide[]): Record<string, SlideCaption> {
  const map: Record<string, SlideCaption> = {}
  for (const slide of slides) {
    if (slide.caption) map[slide.path] = slide.caption
  }
  return map
}

function attachCaptionsToSlides(
  slides: Slide[],
  captionsByPath: Record<string, SlideCaption>,
): Slide[] {
  return slides.map((slide) => {
    const caption = normalizeCaption(captionsByPath[slide.path])
    return caption ? { ...slide, caption } : slide
  })
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
  const [captionsByPath, setCaptionsByPath] = useState<
    Record<string, SlideCaption>
  >({})
  const [captionsEnabled, setCaptionsEnabled] = useState(false)
  const [eventOverlayEnabled, setEventOverlayEnabled] = useState(false)
  const [eventOverlaySettings, setEventOverlaySettings] =
    useState<EventOverlaySettings>({
      templateId: DEFAULT_EVENT_OVERLAY_TEMPLATE_ID,
      text: '',
    })
  const [customOverlayBlob, setCustomOverlayBlob] = useState<Blob | null>(null)
  const [customOverlayUrl, setCustomOverlayUrl] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const [restoring, setRestoring] = useState(true)
  const [exportQuality, setExportQuality] = useState<ExportQuality>('event')
  const [exporting, setExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState('')
  const [importing, setImporting] = useState(false)
  const [imported, setImported] = useState<ImportedPackage | null>(null)
  const [autoStarting, setAutoStarting] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const eventOverlaySaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  )

  const captionStorageKey =
    source === 'folder' && folderName
      ? folderCaptionKey(folderName)
      : source === 'package' && imported
        ? packageCaptionKey(imported.manifest.name)
        : null

  const eventOverlayStorageKey =
    source === 'folder' && folderName
      ? folderEventOverlayKey(folderName)
      : source === 'package' && imported
        ? packageEventOverlayKey(imported.manifest.name)
        : null

  const captionEntries: ImageEntry[] =
    source === 'package' && imported
      ? imported.slides.map((slide) => ({
          path: slide.path,
          file: slide.file,
          handle: slide.handle,
        }))
      : entries

  const buildConfig = useCallback(
    (): SlideshowConfig => ({
      duration,
      order,
      correctOrientation,
      captionsEnabled,
      eventOverlayEnabled,
      eventOverlay: normalizeEventOverlay(eventOverlaySettings),
    }),
    [
      duration,
      order,
      correctOrientation,
      captionsEnabled,
      eventOverlayEnabled,
      eventOverlaySettings,
    ],
  )

  const resolveCustomOverlayUrl = useCallback((): string | null => {
    if (eventOverlaySettings.templateId !== 'custom') return null
    if (customOverlayUrl) return customOverlayUrl
    if (imported?.customOverlayBuffer) {
      const blob = new Blob([imported.customOverlayBuffer], {
        type: overlayMimeFromBuffer(imported.customOverlayBuffer),
      })
      return URL.createObjectURL(blob)
    }
    return null
  }, [customOverlayUrl, eventOverlaySettings.templateId, imported])

  const applyCustomOverlayBlob = useCallback((blob: Blob | null) => {
    setCustomOverlayBlob(blob)
    setCustomOverlayUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev)
      return blob ? URL.createObjectURL(blob) : null
    })
  }, [])

  const persistCaptions = useCallback(
    (
      nextCaptions: Record<string, SlideCaption>,
      nextEnabled: boolean,
      key: string | null,
    ) => {
      if (!key) return
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      saveTimerRef.current = setTimeout(() => {
        void saveCaptions(key, {
          captionsByPath: nextCaptions,
          captionsEnabled: nextEnabled,
          updatedAt: new Date().toISOString(),
        })
      }, 400)
    },
    [],
  )

  const loadCaptionsForKey = useCallback(async (key: string) => {
    const stored = await loadCaptions(key)
    if (stored) {
      setCaptionsByPath(stored.captionsByPath)
      setCaptionsEnabled(stored.captionsEnabled)
      return true
    }
    return false
  }, [])

  const loadEventOverlayForKey = useCallback(async (key: string) => {
    const stored = await loadEventOverlay(key)
    if (stored) {
      setEventOverlaySettings(stored.settings)
      setEventOverlayEnabled(stored.enabled)
      applyCustomOverlayBlob(stored.customImageBlob ?? null)
      return true
    }
    return false
  }, [applyCustomOverlayBlob])

  const persistEventOverlay = useCallback(
    (
      nextSettings: EventOverlaySettings,
      nextEnabled: boolean,
      nextBlob: Blob | null,
      key: string | null,
    ) => {
      if (!key) return
      if (eventOverlaySaveTimerRef.current) {
        clearTimeout(eventOverlaySaveTimerRef.current)
      }
      eventOverlaySaveTimerRef.current = setTimeout(() => {
        void saveEventOverlay(key, {
          settings: nextSettings,
          enabled: nextEnabled,
          ...(nextBlob ? { customImageBlob: nextBlob } : {}),
          updatedAt: new Date().toISOString(),
        })
      }, 400)
    },
    [],
  )

  const startFromSlides = useCallback(
    async (slides: Slide[], config: SlideshowConfig, options?: StartOptions) => {
      if (slides.length === 0) return
      setStarting(true)
      try {
        const file = await resolveSlideFile(slides[0])
        const blob = await resolveDisplayableBlob(file)
        slides[0].url = URL.createObjectURL(blob)
        trackSlideshowStarted(slides.length, config)
        onStart(slides, config, options)
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

        const key = packageCaptionKey(result.manifest.name)
        const stored = await loadCaptions(key)
        const captionsMap = stored
          ? stored.captionsByPath
          : slidesToCaptionsMap(result.slides)
        const enabled = stored
          ? stored.captionsEnabled
          : result.manifest.config.captionsEnabled

        setCaptionsByPath(captionsMap)
        setCaptionsEnabled(enabled)

        const overlayKey = packageEventOverlayKey(result.manifest.name)
        const storedOverlay = await loadEventOverlay(overlayKey)
        if (storedOverlay) {
          setEventOverlaySettings(storedOverlay.settings)
          setEventOverlayEnabled(storedOverlay.enabled)
          applyCustomOverlayBlob(storedOverlay.customImageBlob ?? null)
        } else {
          const manifestConfig = configFromManifest(result.manifest)
          setEventOverlaySettings(
            manifestConfig.eventOverlay ?? {
              templateId: DEFAULT_EVENT_OVERLAY_TEMPLATE_ID,
              text: '',
            },
          )
          setEventOverlayEnabled(manifestConfig.eventOverlayEnabled)
          applyCustomOverlayBlob(
            result.customOverlayBuffer
              ? new Blob([result.customOverlayBuffer], {
                  type: overlayMimeFromBuffer(result.customOverlayBuffer),
                })
              : null,
          )
        }

        const shouldAutoStart =
          autoStart &&
          canAutoStartPackage(result.archiveSize, result.slides.length)

        if (shouldAutoStart) {
          setAutoStarting(true)
          const manifestConfig = configFromManifest(result.manifest)
          const overlayUrl =
            (storedOverlay?.customImageBlob
              ? URL.createObjectURL(storedOverlay.customImageBlob)
              : null) ??
            (result.customOverlayBuffer
              ? URL.createObjectURL(
                  new Blob([result.customOverlayBuffer], {
                    type: overlayMimeFromBuffer(result.customOverlayBuffer),
                  }),
                )
              : null)
          await startFromSlides(
            attachCaptionsToSlides(result.slides, captionsMap),
            {
              ...manifestConfig,
              captionsEnabled: enabled,
              eventOverlayEnabled: storedOverlay
                ? storedOverlay.enabled
                : manifestConfig.eventOverlayEnabled,
              eventOverlay: storedOverlay
                ? normalizeEventOverlay(storedOverlay.settings)
                : manifestConfig.eventOverlay,
            },
            {
              customEventOverlayUrl:
                manifestConfig.eventOverlay?.templateId === 'custom'
                  ? overlayUrl
                  : null,
            },
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
    [applyCustomOverlayBlob, language, startFromSlides],
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
          await loadCaptionsForKey(folderCaptionKey(saved.folderName))
          await loadEventOverlayForKey(
            folderEventOverlayKey(saved.folderName),
          )
        }
      } catch {
        // Brak zapisanego folderu lub odmowa dostępu
      } finally {
        setRestoring(false)
      }
    })()
  }, [loadCaptionsForKey, loadEventOverlayForKey])

  useEffect(() => {
    if (!captionStorageKey) return
    persistCaptions(captionsByPath, captionsEnabled, captionStorageKey)
  }, [
    captionsByPath,
    captionsEnabled,
    captionStorageKey,
    persistCaptions,
  ])

  useEffect(() => {
    if (!eventOverlayStorageKey) return
    persistEventOverlay(
      eventOverlaySettings,
      eventOverlayEnabled,
      customOverlayBlob,
      eventOverlayStorageKey,
    )
  }, [
    customOverlayBlob,
    eventOverlayEnabled,
    eventOverlaySettings,
    eventOverlayStorageKey,
    persistEventOverlay,
  ])

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
      if (eventOverlaySaveTimerRef.current) {
        clearTimeout(eventOverlaySaveTimerRef.current)
      }
    }
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
    setCaptionsByPath({})
    setCaptionsEnabled(false)
    setEventOverlaySettings({
      templateId: DEFAULT_EVENT_OVERLAY_TEMPLATE_ID,
      text: '',
    })
    setEventOverlayEnabled(false)
    applyCustomOverlayBlob(null)
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
      const hadStored = await loadCaptionsForKey(
        folderCaptionKey(result.folderName),
      )
      const hadStoredOverlay = await loadEventOverlayForKey(
        folderEventOverlayKey(result.folderName),
      )
      if (!hadStored) {
        setCaptionsByPath({})
        setCaptionsEnabled(false)
      }
      if (!hadStoredOverlay) {
        setEventOverlaySettings({
          templateId: DEFAULT_EVENT_OVERLAY_TEMPLATE_ID,
          text: '',
        })
        setEventOverlayEnabled(false)
        applyCustomOverlayBlob(null)
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(t.errorFolder)
    } finally {
      setLoading(false)
    }
  }

  const handleCaptionChange = (
    path: string,
    field: keyof SlideCaption,
    value: string,
  ) => {
    const clipped = clampCaptionField(value)

    setCaptionsByPath((prev) => {
      const current = { ...(prev[path] ?? {}) }
      if (clipped.length === 0) {
        delete current[field]
      } else {
        current[field] = clipped
      }
      const next = { ...prev }
      if (Object.keys(current).length === 0) {
        delete next[path]
      } else {
        next[path] = current
      }
      return next
    })

    const draft = { ...(captionsByPath[path] ?? {}) }
    if (clipped.length === 0) {
      delete draft[field]
    } else {
      draft[field] = clipped
    }
    if (hasCaptionContent(draft)) {
      setCaptionsEnabled(true)
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

    await startFromSlides(attachCaptionsToSlides(slides, captionsByPath), buildConfig(), {
      customEventOverlayUrl: resolveCustomOverlayUrl(),
    })
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
        config: buildConfig(),
        captionsByPath,
        customOverlayBlob,
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
    setCaptionsByPath({})
    setCaptionsEnabled(false)
    setEventOverlaySettings({
      templateId: DEFAULT_EVENT_OVERLAY_TEMPLATE_ID,
      text: '',
    })
    setEventOverlayEnabled(false)
    applyCustomOverlayBlob(null)
    setExportQuality('event')
    resetPrepareWizard()
  }

  const handleEventOverlaySettingsChange = (next: EventOverlaySettings) => {
    setEventOverlaySettings(next)
    if (hasEventOverlayContent(next)) {
      setEventOverlayEnabled(true)
    }
  }

  const handleCustomOverlayImageChange = (blob: Blob | null) => {
    applyCustomOverlayBlob(blob)
    if (blob) {
      setEventOverlayEnabled(true)
      setEventOverlaySettings((prev) => ({ ...prev, templateId: 'custom' }))
    }
  }

  return (
    <div
      className={`setup ${screen === 'captions' || screen === 'eventOverlay' ? 'setup--editor' : ''} ${dragOver && screen === 'setup' && source === 'package' ? 'setup--drag-over' : ''}`}
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
      {screen === 'captions' ? (
        <CaptionEditorScreen
          entries={captionEntries}
          captionsByPath={captionsByPath}
          onCaptionChange={handleCaptionChange}
          onBack={() => setScreen('setup')}
        />
      ) : screen === 'eventOverlay' ? (
        <EventOverlayEditorScreen
          settings={eventOverlaySettings}
          customImageUrl={customOverlayUrl}
          onSettingsChange={handleEventOverlaySettingsChange}
          onCustomImageChange={handleCustomOverlayImageChange}
          onBack={() => setScreen('setup')}
        />
      ) : (
      <div className="card">
        {screen === 'setup' && (
          <MainSetupScreen
            source={source}
            folderName={folderName}
            entries={entries}
            captionEntries={captionEntries}
            loading={loading}
            restoring={restoring}
            duration={duration}
            order={order}
            correctOrientation={correctOrientation}
            captionsEnabled={captionsEnabled}
            eventOverlayEnabled={eventOverlayEnabled}
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
            onCaptionsEnabledChange={setCaptionsEnabled}
            onOpenCaptions={() => setScreen('captions')}
            onEventOverlayEnabledChange={setEventOverlayEnabled}
            onOpenEventOverlay={() => setScreen('eventOverlay')}
            onStart={() => void handleStartFromFolder()}
            onSaveForLater={handleSaveForLater}
            onOpenPackage={(file) => void openPackageFile(file, false)}
            onPackageStart={() => {
              if (!imported) return
              void startFromSlides(
                attachCaptionsToSlides(imported.slides, captionsByPath),
                buildConfig(),
                { customEventOverlayUrl: resolveCustomOverlayUrl() },
              )
            }}
            onPackageCancel={() => {
              setImported(null)
              setCaptionsByPath({})
              setCaptionsEnabled(false)
              setEventOverlaySettings({
                templateId: DEFAULT_EVENT_OVERLAY_TEMPLATE_ID,
                text: '',
              })
              setEventOverlayEnabled(false)
              applyCustomOverlayBlob(null)
            }}
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
      )}
    </div>
  )
}
