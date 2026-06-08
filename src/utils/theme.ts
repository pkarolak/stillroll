export type Theme = 'light' | 'dark'

const STORAGE_KEY = 'stillroll-theme'

export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}

export function getStoredTheme(): Theme | null {
  const value = localStorage.getItem(STORAGE_KEY)
  if (value === 'light' || value === 'dark') return value
  return null
}

export function setStoredTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme)
}

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', theme === 'dark' ? '#0f2a38' : '#e8f3f6')
  }
}

export function initTheme(): Theme {
  const theme = getStoredTheme() ?? getSystemTheme()
  applyTheme(theme)
  return theme
}

export function toggleTheme(current: Theme): Theme {
  const next = current === 'dark' ? 'light' : 'dark'
  setStoredTheme(next)
  applyTheme(next)
  return next
}
