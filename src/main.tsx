import './fonts/ribbonFonts'
import '@fontsource/plus-jakarta-sans/latin-400.css'
import '@fontsource/plus-jakarta-sans/latin-500.css'
import '@fontsource/plus-jakarta-sans/latin-600.css'
import '@fontsource/plus-jakarta-sans/latin-700.css'
import { Analytics } from '@vercel/analytics/react'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './boot/installPromptCapture'
import { initFileLaunch } from './boot/fileLaunch'
import { LanguageProvider } from './i18n/LanguageProvider'
import { initTheme } from './utils/theme'
import './styles/global.css'
import App from './App.tsx'

initTheme()
initFileLaunch()
registerSW({ immediate: true })

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <App />
      <Analytics />
    </LanguageProvider>
  </StrictMode>,
)
