import { useLanguage } from '../../i18n/useLanguage'

export type SetupSource = 'folder' | 'package'

type SourcePickerProps = {
  source: SetupSource
  onSourceChange: (source: SetupSource) => void
}

export function SourcePicker({ source, onSourceChange }: SourcePickerProps) {
  const { t } = useLanguage()

  return (
    <div className="segmented source-picker" role="tablist">
      <button
        type="button"
        role="tab"
        aria-selected={source === 'folder'}
        className={`segmented__item ${source === 'folder' ? 'segmented__item--active' : ''}`}
        onClick={() => onSourceChange('folder')}
      >
        {t.showSourceFolder}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={source === 'package'}
        className={`segmented__item ${source === 'package' ? 'segmented__item--active' : ''}`}
        onClick={() => onSourceChange('package')}
      >
        {t.showSourcePackage}
      </button>
    </div>
  )
}
