import { FolderOpen, Loader2, X } from 'lucide-react'
import type { ImageEntry } from '../../types'
import { useLanguage } from '../../i18n/useLanguage'

type FolderSectionProps = {
  folderName: string | null
  entries: ImageEntry[]
  loading: boolean
  restoring: boolean
  onPickFolder: () => void
  onClearFolder: () => void
}

export function FolderSection({
  folderName,
  entries,
  loading,
  restoring,
  onPickFolder,
  onClearFolder,
}: FolderSectionProps) {
  const { t, photos } = useLanguage()

  const busy = loading || restoring
  const hasFolder = Boolean(folderName)

  const label = restoring
    ? t.restoringFolder
    : loading
      ? t.scanning
      : hasFolder
        ? folderName
        : t.pickFolder

  const classes = [
    'folder-picker',
    hasFolder && !busy ? 'folder-picker--selected' : '',
    hasFolder && !busy ? 'folder-picker--with-action' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const picker = (
    <button
      type="button"
      className="folder-picker__select"
      onClick={onPickFolder}
      disabled={busy}
      aria-label={hasFolder ? t.changeFolder : t.pickFolder}
    >
      {busy ? (
        <Loader2 size={20} className="folder-picker__icon spin" />
      ) : (
        <FolderOpen size={20} className="folder-picker__icon" />
      )}
      <span
        className={`folder-picker__content ${hasFolder && !busy ? 'folder-picker__content--selected' : ''}`}
      >
        <span className="folder-picker__label">{label}</span>
        {hasFolder && !busy && (
          <span className="folder-picker__meta">
            {entries.length} {photos(entries.length)}
          </span>
        )}
      </span>
    </button>
  )

  return (
    <div className="settings__row">
      <div className="settings__header">
        <span className="settings__label settings__label--inline">
          <FolderOpen
            className="settings__label-icon"
            strokeWidth={2}
          />
          {t.sourceLabel}
        </span>
        <span className="settings__aside">{t.privacyFooter}</span>
      </div>

      {hasFolder && !busy ? (
        <div className={classes}>
          {picker}
          <button
            type="button"
            className="folder-picker__unlink"
            onClick={onClearFolder}
            aria-label={t.unlinkFolder}
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>
      ) : (
        <div className={classes}>{picker}</div>
      )}
    </div>
  )
}
