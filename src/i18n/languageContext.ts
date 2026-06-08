import { createContext } from 'react'
import type { Language, Translations } from './types'

export type LanguageContextValue = {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
  photos: (count: number) => string
  captionsProgress: (filled: number, total: number) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)
