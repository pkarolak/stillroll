import { Moon, Sun } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import {
  applyTheme,
  getStoredTheme,
  getSystemTheme,
  setStoredTheme,
  type Theme,
} from '../utils/theme'

const THEMES: Theme[] = ['dark', 'light']

const themeIcons = {
  dark: Moon,
  light: Sun,
} as const

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(
    () => getStoredTheme() ?? getSystemTheme(),
  )

  useEffect(() => {
    const root = document.documentElement
    const observer = new MutationObserver(() => {
      const next = root.dataset.theme
      if (next === 'light' || next === 'dark') setTheme(next)
    })
    observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] })
    return () => observer.disconnect()
  }, [])

  const selectTheme = useCallback((next: Theme) => {
    setStoredTheme(next)
    applyTheme(next)
    setTheme(next)
  }, [])

  return (
    <div className="chip-group" role="group" aria-label="Theme">
      {THEMES.map((value) => {
        const Icon = themeIcons[value]
        return (
          <button
            key={value}
            type="button"
            className={`chip ${theme === value ? 'chip--active' : ''}`}
            onClick={() => selectTheme(value)}
            aria-pressed={theme === value}
            aria-label={value === 'dark' ? 'Dark mode' : 'Light mode'}
            title={value === 'dark' ? 'Dark mode' : 'Light mode'}
          >
            <Icon size={14} />
          </button>
        )
      })}
    </div>
  )
}
