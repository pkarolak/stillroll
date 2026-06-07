import { useLanguage } from '../i18n/useLanguage'
import { languageLabels } from '../i18n/translations'
import type { Language } from '../i18n/types'

const LANGUAGES: Language[] = ['pl', 'en', 'es']

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage()

  return (
    <div className="lang-switcher" role="group" aria-label="Language">
      {LANGUAGES.map((lang) => (
        <button
          key={lang}
          type="button"
          className={`lang-switcher__btn ${language === lang ? 'lang-switcher__btn--active' : ''}`}
          onClick={() => setLanguage(lang)}
          aria-pressed={language === lang}
        >
          {languageLabels[lang]}
        </button>
      ))}
    </div>
  )
}
