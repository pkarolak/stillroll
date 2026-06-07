import type { Slide } from '../types'

export async function resolveSlideFile(slide: Slide): Promise<File> {
  if (slide.file) return slide.file
  if (slide.handle) return slide.handle.getFile()
  throw new Error(`Brak źródła pliku: ${slide.path}`)
}
