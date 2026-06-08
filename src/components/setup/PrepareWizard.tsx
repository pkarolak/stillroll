import { CheckCircle2, HardDriveDownload, Loader2 } from 'lucide-react'
import type { ExportQuality } from '../../workers/packageWorker'
import { useExportSizeEstimate } from '../../hooks/useExportSizeEstimate'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { useLanguage } from '../../i18n/useLanguage'
import type { ImageEntry } from '../../types'
import { formatBytes } from '../../utils/formatBytes'
import { MAX_ARCHIVE_BYTES } from '../../utils/offlinePackage/limits'
import { Button } from '../ui/Button'
import { InstallCard } from './InstallCard'
import { WizardNav } from './WizardNav'
import { WizardProgress } from './WizardProgress'

export type PrepareStep = 2 | 3 | 4

type PrepareWizardProps = {
  step: PrepareStep
  entries: ImageEntry[]
  exportQuality: ExportQuality
  exporting: boolean
  exportProgress: string
  error: string | null
  onBack: () => void
  onNext: () => void
  onSkip: () => void
  onExportQualityChange: (quality: ExportQuality) => void
  onExport: () => void
  onFinish: () => void
  onPrepareAnother: () => void
}

function formatApproxSize(bytes: number | undefined, loading: boolean): string {
  if (loading || bytes === undefined) return '…'
  return `~${formatBytes(bytes)}`
}

export function PrepareWizard({
  step,
  entries,
  exportQuality,
  exporting,
  exportProgress,
  error,
  onBack,
  onNext,
  onSkip,
  onExportQualityChange,
  onExport,
  onFinish,
  onPrepareAnother,
}: PrepareWizardProps) {
  const { t } = useLanguage()
  const { isDesktopDevice } = useInstallPrompt()
  const { estimate, loading: sizeLoading } = useExportSizeEstimate(entries)

  const selectedBytes =
    exportQuality === 'event' ? estimate?.eventBytes : estimate?.originalBytes
  const exceedsLimit =
    selectedBytes !== undefined && selectedBytes > MAX_ARCHIVE_BYTES

  return (
    <div className="setup-flow prepare-wizard">
      <WizardProgress step={step} />

      <div className="settings prepare-wizard__body">
        {step === 2 && (
          <div className="settings__row">
            <InstallCard />
          </div>
        )}

        {step === 3 && (
          <div className="settings__row">
            <span className="settings__label">
              <HardDriveDownload size={16} strokeWidth={2} />
              {t.wizardStep3Title}
            </span>

            {isDesktopDevice ? (
              <>
                <div className="segmented settings__segmented" role="group">
                  <button
                    type="button"
                    className={`segmented__item ${exportQuality === 'event' ? 'segmented__item--active' : ''}`}
                    onClick={() => onExportQualityChange('event')}
                  >
                    {t.packageQualityEvent}
                    <span className="segmented__meta">
                      {formatApproxSize(estimate?.eventBytes, sizeLoading)}
                    </span>
                  </button>
                  <button
                    type="button"
                    className={`segmented__item ${exportQuality === 'original' ? 'segmented__item--active' : ''}`}
                    onClick={() => onExportQualityChange('original')}
                  >
                    {t.packageQualityOriginal}
                    <span className="segmented__meta">
                      {formatApproxSize(estimate?.originalBytes, sizeLoading)}
                    </span>
                  </button>
                </div>

                {exceedsLimit && (
                  <p className="text-error export-size-warning">{t.exportSizeWarning}</p>
                )}

                <Button
                  variant="primary"
                  block
                  onClick={onExport}
                  disabled={exporting || exceedsLimit || sizeLoading}
                >
                  {exporting ? (
                    <Loader2 size={18} className="spin" />
                  ) : (
                    <HardDriveDownload size={18} />
                  )}
                  {exporting ? t.exportingPackage : t.exportPackage}
                </Button>

                {exportProgress && <p className="hint">{exportProgress}</p>}
              </>
            ) : (
              <p className="hint">{t.prepareExportDesktopOnly}</p>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="settings__row">
            <span className="settings__label">
              <CheckCircle2 size={16} strokeWidth={2} />
              {t.wizardStep4Title}
            </span>

            <div className="settings__panel">
              <p className="hint hint--success">{t.exportComplete}</p>
              <ul className="wizard-tips">
                <li>{t.prepareSuccessStep1}</li>
                <li>{t.prepareSuccessStep2}</li>
              </ul>
              <p className="wizard-warning">
                <strong>{t.prepareSuccessWarningLabel}</strong>{' '}
                {t.prepareSuccessWarning}
              </p>
              <ul className="wizard-tips">
                <li>{t.prepareSuccessStep3}</li>
              </ul>
            </div>

            <div className="actions">
              <Button variant="primary" block onClick={onFinish}>
                {t.backToSetup}
              </Button>
              <Button variant="secondary" block onClick={onPrepareAnother}>
                {t.prepareAnother}
              </Button>
            </div>
          </div>
        )}
      </div>

      {step !== 4 && (
        <WizardNav
          backLabel={t.wizardBack}
          nextLabel={t.wizardNext}
          skipLabel={t.wizardSkip}
          onBack={onBack}
          onNext={onNext}
          onSkip={onSkip}
          showSkip={step === 2}
          showNext={step === 2}
        />
      )}

      {error && <p className="text-error">{error}</p>}
    </div>
  )
}
