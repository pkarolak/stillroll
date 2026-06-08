import { useMemo } from 'react'
import { CheckCircle2, Download } from 'lucide-react'
import { useInstallPrompt } from '../../hooks/useInstallPrompt'
import { useLanguage } from '../../i18n/useLanguage'
import type { Translations } from '../../i18n/types'
import {
  detectBrowser,
  isInstallableBrowser,
  type BrowserKind,
} from '../../utils/detectBrowser'
import { Button } from '../ui/Button'

function getInstallHint(t: Translations, browser: BrowserKind): string {
  if (browser === 'chrome') return t.installGuideChrome1
  if (browser === 'edge') return t.installGuideEdge1
  return t.installGuideUnsupported
}

export function InstallCard() {
  const { t } = useLanguage()
  const { canInstall, isInstalled, isDesktopDevice, install } = useInstallPrompt()
  const browser = useMemo(() => detectBrowser(), [])
  const installHint = getInstallHint(t, browser)
  const showMenuAlt =
    isDesktopDevice && isInstallableBrowser(browser) && !canInstall && !isInstalled

  if (isInstalled) {
    return (
      <p className="hint hint--success install-card__status">
        <CheckCircle2 size={16} strokeWidth={2} />
        {t.installCardInstalled}
      </p>
    )
  }

  if (!isDesktopDevice) {
    return <p className="hint">{t.installCardMobileHint}</p>
  }

  return (
    <>
      <p className="hint">{t.installCardIntro}</p>

      {canInstall ? (
        <Button variant="primary" block onClick={() => void install()}>
          <Download size={18} />
          {t.installApp}
        </Button>
      ) : (
        <div className="settings__panel">
          <p className="settings__panel-text">{installHint}</p>
          {showMenuAlt && (
            <p className="settings__panel-text settings__panel-text--muted">
              {t.installGuideMenuAlt}
            </p>
          )}
        </div>
      )}
    </>
  )
}
