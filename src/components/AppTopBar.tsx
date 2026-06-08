import { LanguageSwitcher } from './LanguageSwitcher'
import { ThemeToggle } from './ThemeToggle'
import { useLanguage } from '../i18n/useLanguage'

export function AppTopBar() {
  const { t } = useLanguage()

  return (
    <header className="app-top-bar">
      <div className="app-top-bar__brand">
        <img
          src="/icon.png"
          alt=""
          className="app-top-bar__logo"
          width={56}
          height={56}
          draggable={false}
        />
        <div className="app-top-bar__text">
          <h1 className="app-top-bar__title">
            Still<span className="app-top-bar__title-accent">Roll</span>
          </h1>
          <p className="app-top-bar__tagline">{t.tagline}</p>
        </div>
      </div>
      <div className="app-top-bar__actions">
        <ThemeToggle />
        <LanguageSwitcher />
      </div>
    </header>
  )
}
