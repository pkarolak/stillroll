import { useState } from 'react'
import { SetupPanel } from './components/SetupPanel'
import { Slideshow } from './components/Slideshow'
import type { Slide, SlideshowConfig } from './types'

type AppView = 'setup' | 'slideshow'

function App() {
  const [view, setView] = useState<AppView>('setup')
  const [slides, setSlides] = useState<Slide[]>([])
  const [sessionKey, setSessionKey] = useState(0)
  const [config, setConfig] = useState<SlideshowConfig>({
    duration: 6,
    order: 'folder',
    correctOrientation: true,
  })

  const handleStart = (newSlides: Slide[], newConfig: SlideshowConfig) => {
    setSlides(newSlides)
    setConfig(newConfig)
    setSessionKey((k) => k + 1)
    setView('slideshow')
  }

  const handleExit = () => {
    setView('setup')
    setSlides([])
  }

  if (view === 'slideshow' && slides.length > 0) {
    return (
      <Slideshow
        key={sessionKey}
        slides={slides}
        config={config}
        onExit={handleExit}
      />
    )
  }

  return (
    <main className="app">
      <SetupPanel onStart={handleStart} />
    </main>
  )
}

export default App
