import { useState } from 'react'
import { AppTopBar } from './components/AppTopBar'
import { SetupFlow } from './components/SetupFlow'
import { Slideshow } from './components/Slideshow'
import type { Slide, SlideshowConfig } from './types'

type AppView = 'setup' | 'slideshow'

function App() {
  const [view, setView] = useState<AppView>('setup')
  const [slides, setSlides] = useState<Slide[]>([])
  const [sessionKey, setSessionKey] = useState(0)
  const [setupKey, setSetupKey] = useState(0)
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
    setSetupKey((k) => k + 1)
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
      <AppTopBar />
      <div className="app__body">
        <SetupFlow key={setupKey} onStart={handleStart} />
      </div>
    </main>
  )
}

export default App
