import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { LanguageContext, type LanguageContextValue } from './languageContext'
import { trackLanguageChanged } from '../utils/analytics'
import {
  captionsProgress,
  detectLanguage,
  photoCount,
  translations,
} from './translations'
import type { Language } from './types'

const STORAGE_KEY = 'stillroll-language'

function loadLanguage(): Language {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === 'pl' || stored === 'en' || stored === 'es') return stored
  } catch {
    // localStorage niedostępny
  }
  return detectLanguage()
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(loadLanguage)

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState((prev) => {
      if (prev !== lang) trackLanguageChanged(lang)
      return lang
    })
    try {
      localStorage.setItem(STORAGE_KEY, lang)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    document.documentElement.lang = language
    document.title = 'StillRoll'
  }, [language])

  const value = useMemo<LanguageContextValue>(
    () => ({
      language,
      setLanguage,
      t: translations[language],
      photos: (count: number) => photoCount(count, language),
      captionsProgress: (filled: number, total: number) =>
        captionsProgress(filled, total, language),
    }),
    [language, setLanguage],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}
