export type BrowserKind = 'chrome' | 'edge' | 'safari' | 'firefox' | 'other'

export function detectBrowser(): BrowserKind {
  const ua = navigator.userAgent

  if (/Edg\//.test(ua)) return 'edge'
  if (/Chrome\//.test(ua) && !/Edg\//.test(ua)) return 'chrome'
  if (/Firefox\//.test(ua)) return 'firefox'
  if (/Safari\//.test(ua) && !/Chrome\//.test(ua)) return 'safari'

  return 'other'
}

export function isInstallableBrowser(browser: BrowserKind): boolean {
  return browser === 'chrome' || browser === 'edge'
}
