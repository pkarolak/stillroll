import type { Language, Translations } from './types'

export const translations: Record<Language, Translations> = {
  pl: {
    tagline: 'Nieskończony pokaz slajdów z folderu na dysku — wszystko działa lokalnie w przeglądarce.',
    folderLabel: 'Folder ze zdjęciami',
    pickFolder: 'Wybierz folder',
    changeFolder: 'Zmień folder',
    restoringFolder: 'Przywracanie folderu…',
    scanning: 'Skanowanie…',
    slideDuration: 'Czas slajdu',
    slideDurationAria: 'Czas slajdu w sekundach',
    seconds: 'sek',
    order: 'Kolejność',
    orderFolder: 'Wg folderu',
    orderRandom: 'Losowa',
    exifLabel: 'Korekcja orientacji (EXIF)',
    exifHint: 'JPEG z aparatu lub telefonu. PNG bez EXIF — bez zmian.',
    startShow: 'Start pokazu',
    loading: 'Ładowanie…',
    privacyFooter: 'Pliki nie opuszczają Twojego komputera',
    errorFolder: 'Nie udało się otworzyć folderu. Spróbuj ponownie.',
    errorFirstPhoto: 'Nie udało się załadować pierwszego zdjęcia.',
    infiniteMode: 'Tryb nieskończony',
    prevSlide: 'Poprzedni slajd',
    nextSlide: 'Następny slajd',
    pause: 'Pauza',
    resume: 'Wznów',
    exit: 'Wyjście',
  },
  en: {
    tagline: 'Endless slideshow from a folder on your disk — everything runs locally in your browser.',
    folderLabel: 'Photo folder',
    pickFolder: 'Choose folder',
    changeFolder: 'Change folder',
    restoringFolder: 'Restoring folder…',
    scanning: 'Scanning…',
    slideDuration: 'Slide duration',
    slideDurationAria: 'Slide duration in seconds',
    seconds: 'sec',
    order: 'Order',
    orderFolder: 'By folder',
    orderRandom: 'Random',
    exifLabel: 'Orientation correction (EXIF)',
    exifHint: 'JPEG from camera or phone. PNG without EXIF — unchanged.',
    startShow: 'Start slideshow',
    loading: 'Loading…',
    privacyFooter: 'Files never leave your computer',
    errorFolder: 'Could not open folder. Please try again.',
    errorFirstPhoto: 'Could not load the first photo.',
    infiniteMode: 'Infinite loop',
    prevSlide: 'Previous slide',
    nextSlide: 'Next slide',
    pause: 'Pause',
    resume: 'Resume',
    exit: 'Exit',
  },
  es: {
    tagline: 'Presentación infinita desde una carpeta en tu disco — todo funciona localmente en el navegador.',
    folderLabel: 'Carpeta de fotos',
    pickFolder: 'Elegir carpeta',
    changeFolder: 'Cambiar carpeta',
    restoringFolder: 'Restaurando carpeta…',
    scanning: 'Escaneando…',
    slideDuration: 'Duración del slide',
    slideDurationAria: 'Duración del slide en segundos',
    seconds: 'seg',
    order: 'Orden',
    orderFolder: 'Por carpeta',
    orderRandom: 'Aleatorio',
    exifLabel: 'Corrección de orientación (EXIF)',
    exifHint: 'JPEG de cámara o móvil. PNG sin EXIF — sin cambios.',
    startShow: 'Iniciar presentación',
    loading: 'Cargando…',
    privacyFooter: 'Los archivos no salen de tu ordenador',
    errorFolder: 'No se pudo abrir la carpeta. Inténtalo de nuevo.',
    errorFirstPhoto: 'No se pudo cargar la primera foto.',
    infiniteMode: 'Bucle infinito',
    prevSlide: 'Slide anterior',
    nextSlide: 'Slide siguiente',
    pause: 'Pausa',
    resume: 'Reanudar',
    exit: 'Salir',
  },
}

export const languageLabels: Record<Language, string> = {
  pl: 'PL',
  en: 'EN',
  es: 'ES',
}

export function detectLanguage(): Language {
  const lang = navigator.language.toLowerCase()
  if (lang.startsWith('pl')) return 'pl'
  if (lang.startsWith('es')) return 'es'
  return 'en'
}

export function photoCount(count: number, lang: Language): string {
  if (lang === 'pl') {
    if (count === 1) return 'zdjęcie'
    const mod10 = count % 10
    const mod100 = count % 100
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'zdjęcia'
    return 'zdjęć'
  }
  if (lang === 'es') {
    return count === 1 ? 'foto' : 'fotos'
  }
  return count === 1 ? 'photo' : 'photos'
}
