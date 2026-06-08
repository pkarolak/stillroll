import { Loader2, PackageOpen, Play } from 'lucide-react'
import { Button } from '../ui/Button'
import type { ImportedPackage } from '../../utils/offlinePackage/importPackage'
import { useLanguage } from '../../i18n/useLanguage'

type PackageSectionProps = {
  imported: ImportedPackage | null
  importing: boolean
  autoStarting: boolean
  starting: boolean
  onOpenPackage: (file: File) => void
  onStart: () => void
  onCancel: () => void
}

export function PackageSection({
  imported,
  importing,
  autoStarting,
  starting,
  onOpenPackage,
  onStart,
  onCancel,
}: PackageSectionProps) {
  const { t, photos } = useLanguage()

  const busy = importing || autoStarting
  const ready = Boolean(imported) && !autoStarting

  return (
    <div className="settings__row">
      <div className="settings__header">
        <span className="settings__label settings__label--inline">
          <PackageOpen className="settings__label-icon" strokeWidth={2} />
          {t.sourceLabel}
        </span>
        <span className="settings__aside">{t.privacyFooter}</span>
      </div>

      <input
        id="package-file-input"
        type="file"
        accept=".stillroll,application/zip"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onOpenPackage(file)
          e.target.value = ''
        }}
      />

      {ready && imported ? (
        <div className="settings__panel package-ready">
          <span className="package-ready__title">{t.packageReady}</span>
          <div className="package-ready__head">
            <PackageOpen size={20} className="package-ready__icon" />
            <div className="package-ready__info">
              <span className="package-ready__name">{imported.manifest.name}</span>
              <span className="package-ready__meta">
                {imported.slides.length} {photos(imported.slides.length)} ·{' '}
                {imported.manifest.config.duration} {t.seconds}
              </span>
            </div>
          </div>
          <div className="actions">
            <Button variant="primary" block onClick={onStart} disabled={starting}>
              {starting ? (
                <Loader2 size={18} className="spin" />
              ) : (
                <Play size={18} fill="currentColor" />
              )}
              {starting ? t.loading : t.packageStart}
            </Button>
            <Button variant="secondary" block onClick={onCancel}>
              {t.packageCancel}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="folder-picker">
            <button
              type="button"
              className="folder-picker__select"
              disabled={busy}
              onClick={() => document.getElementById('package-file-input')?.click()}
            >
              {busy ? (
                <Loader2 size={20} className="folder-picker__icon spin" />
              ) : (
                <PackageOpen size={20} className="folder-picker__icon" />
              )}
              <span className="folder-picker__content">
                <span className="folder-picker__label">
                  {autoStarting
                    ? t.packageAutoStarting
                    : importing
                      ? t.packageLoading
                      : t.openPackage}
                </span>
              </span>
            </button>
          </div>
          <p className="hint">{t.showPackageHint}</p>
          <p className="hint">{t.offlineHint}</p>
        </>
      )}
    </div>
  )
}
