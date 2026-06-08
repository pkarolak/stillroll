import type { Language, Translations } from './types'

export const translations: Record<Language, Translations> = {
  pl: {
    tagline:
      'Nieskończony pokaz slajdów z folderu na dysku — wszystko działa lokalnie w przeglądarce.',
    folderLabel: 'Folder ze zdjęciami',
    sourceLabel: 'Źródło',
    pickFolder: 'Wybierz folder',
    changeFolder: 'Zmień folder',
    unlinkFolder: 'Odłącz folder',
    restoringFolder: 'Przywracanie folderu…',
    scanning: 'Skanowanie…',
    slideDuration: 'Czas slajdu',
    slideDurationAria: 'Czas slajdu w sekundach',
    seconds: 'sek',
    order: 'Kolejność',
    orderFolder: 'Wg folderu',
    orderRandom: 'Losowa',
    exifLabel: 'Automatyczny obrót',
    exifHint:
      'Pokazuj zdjęcia portretowe w pionie, a horyzontalne w poziomie — nawet jeśli są inaczej ułożone w Twoim folderze.',
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
    showSourceFolder: 'Nowy pokaz',
    showSourcePackage: 'Otwórz zapisany',
    showPackageHint:
      'Plik zawiera zdjęcia i ustawienia — wystarczy otworzyć i wystartować.',
    saveForLater: 'Zapisz na później',
    saveForLaterHint:
      'Pobierz plik .stillroll — odtworzysz go zawsze, nawet bez internetu.',
    wizardStep1Done: 'Zdjęcia',
    wizardStep2Title: 'Zainstaluj aplikację',
    wizardStep3Title: 'Pobierz plik',
    wizardStep4Title: 'Gotowe',
    wizardBack: 'Wstecz',
    wizardNext: 'Dalej',
    wizardSkip: 'Pomiń',
    backToSetup: 'Wróć',
    openPackage: 'Otwórz plik .stillroll',
    exportPackage: 'Pobierz plik .stillroll',
    exportingPackage: 'Tworzenie pliku…',
    packageQualityEvent: 'Zoptymalizowane',
    packageQualityOriginal: 'Oryginały',
    offlineHint:
      'Przeciągnij plik tutaj lub kliknij przycisk powyżej. Działa bez internetu.',
    installApp: 'Zainstaluj aplikację',
    installBannerText: 'Zainstaluj StillRoll — działa offline na evencie.',
    installCardTitle: 'Zainstaluj StillRoll na komputerze',
    installCardIntro:
      'Zainstalowana aplikacja działa bez internetu i otwiera pliki .stillroll dwuklikiem.',
    installCardInstalled:
      'StillRoll jest zainstalowany. Pliki .stillroll otworzysz dwuklikiem.',
    installCardMobileHint:
      'Instalacja działa tylko na komputerze. Otwórz stronę w Chrome lub Edge na laptopie.',
    installGuideChrome1:
      'Otwórz tę stronę w Google Chrome na komputerze.',
    installGuideChrome2:
      'Na pasku adresu, po prawej stronie URL, szukaj ikony ⊕ lub „Zainstaluj”. Jeśli jej nie ma — patrz krok 4 poniżej.',
    installGuideChrome3:
      'Kliknij „Zainstaluj” i potwierdź. StillRoll pojawi się w Launchpad / menu Start.',
    installGuideEdge1: 'Otwórz tę stronę w Microsoft Edge na komputerze.',
    installGuideEdge2:
      'Na pasku adresu kliknij „Zainstaluj” lub „Aplikacja dostępna” (po prawej od URL).',
    installGuideEdge3:
      'Potwierdź instalację. StillRoll pojawi się w menu Start / Dock.',
    installGuideMenuAlt:
      'Menu ⋮ (górny prawy róg) → „Zapisz i udostępnij” → „Zainstaluj stronę jako aplikację”.',
    installGuideEngagement:
      'Ikony nie ma? Twarde odświeżenie (Cmd+Shift+R), ~30 s na stronie i kliknij gdziekolwiek.',
    installGuideUnsupported:
      'Ta przeglądarka nie obsługuje instalacji. Użyj Chrome lub Edge na komputerze.',
    packageLoading: 'Ładowanie pakietu…',
    packageReady: 'Pokaz gotowy',
    packageStart: 'Start pokazu',
    packageCancel: 'Anuluj',
    packageAutoStarting: 'Uruchamianie pokazu…',
    useChromeEdge: 'Do trybu offline użyj Chrome lub Edge na komputerze.',
    exportProgress: 'Przetwarzanie zdjęć',
    exportComplete: 'Plik pobrany.',
    prepareSuccessTitle: 'Plik gotowy do użycia offline',
    prepareSuccessStep1:
      'Skopiuj plik .stillroll na pendrive lub dysk eventowy.',
    prepareSuccessStep2:
      'Na komputerze na evencie uruchom zainstalowaną aplikację StillRoll.',
    prepareSuccessWarningLabel: 'Uwaga!',
    prepareSuccessWarning:
      'Upewnij się, że aplikacja się tam znajduje, albo że będziesz miał dostęp do internetu — inaczej nie uda się odtworzyć pokazu.',
    prepareSuccessStep3:
      'Otwórz plik .stillroll dwuklikiem — pokaz wystartuje bez internetu.',
    prepareAnother: 'Przygotuj kolejny plik',
    prepareExportDesktopOnly:
      'Pobieranie pliku wymaga Chrome lub Edge na komputerze.',
    exportSizeWarning:
      'Szacowany rozmiar przekracza limit pliku (2 GB). Wybierz opcję zoptymalizowaną lub usuń część zdjęć.',
  },
  en: {
    tagline:
      'Endless slideshow from a folder on your disk — everything runs locally in your browser.',
    folderLabel: 'Photo folder',
    sourceLabel: 'Source',
    pickFolder: 'Choose folder',
    changeFolder: 'Change folder',
    unlinkFolder: 'Unlink folder',
    restoringFolder: 'Restoring folder…',
    scanning: 'Scanning…',
    slideDuration: 'Slide duration',
    slideDurationAria: 'Slide duration in seconds',
    seconds: 'sec',
    order: 'Order',
    orderFolder: 'By folder',
    orderRandom: 'Random',
    exifLabel: 'Auto-rotate',
    exifHint:
      'Show portrait photos upright and horizontal ones sideways — even if they are stored differently in your folder.',
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
    showSourceFolder: 'New show',
    showSourcePackage: 'Open saved',
    showPackageHint:
      'The file includes photos and settings — just open and start.',
    saveForLater: 'Save for later',
    saveForLaterHint:
      'Download a .stillroll file — play it anytime, even without internet.',
    wizardStep1Done: 'Photos',
    wizardStep2Title: 'Install the app',
    wizardStep3Title: 'Download file',
    wizardStep4Title: 'Done',
    wizardBack: 'Back',
    wizardNext: 'Next',
    wizardSkip: 'Skip',
    backToSetup: 'Back',
    openPackage: 'Open .stillroll file',
    exportPackage: 'Download .stillroll file',
    exportingPackage: 'Creating file…',
    packageQualityEvent: 'Optimized',
    packageQualityOriginal: 'Originals',
    offlineHint: 'Drag a file here or use the button above. Works offline.',
    installApp: 'Install app',
    installBannerText: 'Install StillRoll — works offline at your event.',
    installCardTitle: 'Install StillRoll on your computer',
    installCardIntro:
      'The installed app works offline and opens .stillroll files on double-click.',
    installCardInstalled:
      'StillRoll is installed. Open .stillroll files with a double-click.',
    installCardMobileHint:
      'Installation only works on a computer. Open this page in Chrome or Edge on a laptop.',
    installGuideChrome1: 'Open this page in Google Chrome on your computer.',
    installGuideChrome2:
      'In the address bar, right of the URL, look for ⊕ or “Install”. If missing — see step 4 below.',
    installGuideChrome3:
      'Click “Install” and confirm. StillRoll will appear in Launchpad / Start menu.',
    installGuideEdge1: 'Open this page in Microsoft Edge on your computer.',
    installGuideEdge2:
      'In the address bar, click “Install” or “App available” (right of the URL).',
    installGuideEdge3: 'Confirm installation. StillRoll will appear in Start / Dock.',
    installGuideMenuAlt:
      'Menu ⋮ (top right) → “Save and share” → “Install page as app”.',
    installGuideEngagement:
      'No icon? Hard-refresh (Cmd+Shift+R), stay ~30 s and click anywhere.',
    installGuideUnsupported:
      'This browser cannot install the app. Use Chrome or Edge on a computer.',
    packageLoading: 'Loading package…',
    packageReady: 'Show ready',
    packageStart: 'Start slideshow',
    packageCancel: 'Cancel',
    packageAutoStarting: 'Starting slideshow…',
    useChromeEdge: 'For offline mode use Chrome or Edge on a computer.',
    exportProgress: 'Processing photos',
    exportComplete: 'File downloaded.',
    prepareSuccessTitle: 'File ready for offline use',
    prepareSuccessStep1: 'Copy the .stillroll file to a USB drive or event computer.',
    prepareSuccessStep2:
      'On the event computer, launch the installed StillRoll app.',
    prepareSuccessWarningLabel: 'Warning!',
    prepareSuccessWarning:
      'Make sure the app is installed there, or that you will have internet access — otherwise the show will not play.',
    prepareSuccessStep3:
      'Open the .stillroll file with a double-click — slideshow runs without internet.',
    prepareAnother: 'Prepare another file',
    prepareExportDesktopOnly:
      'Downloading the file requires Chrome or Edge on a computer.',
    exportSizeWarning:
      'Estimated size exceeds the file limit (2 GB). Choose the optimized option or remove some photos.',
  },
  es: {
    tagline:
      'Presentación infinita desde una carpeta en tu disco — todo funciona localmente en el navegador.',
    folderLabel: 'Carpeta de fotos',
    sourceLabel: 'Origen',
    pickFolder: 'Elegir carpeta',
    changeFolder: 'Cambiar carpeta',
    unlinkFolder: 'Desvincular carpeta',
    restoringFolder: 'Restaurando carpeta…',
    scanning: 'Escaneando…',
    slideDuration: 'Duración del slide',
    slideDurationAria: 'Duración del slide en segundos',
    seconds: 'seg',
    order: 'Orden',
    orderFolder: 'Por carpeta',
    orderRandom: 'Aleatorio',
    exifLabel: 'Giro automático',
    exifHint:
      'Muestra las fotos de retrato en vertical y las horizontales en horizontal — aunque en tu carpeta estén guardadas de otro modo.',
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
    showSourceFolder: 'Nuevo pase',
    showSourcePackage: 'Abrir guardado',
    showPackageHint:
      'El archivo incluye fotos y ajustes — solo ábrelo e inicia.',
    saveForLater: 'Guardar para después',
    saveForLaterHint:
      'Descarga un archivo .stillroll — reprodúcelo siempre, incluso sin internet.',
    wizardStep1Done: 'Fotos',
    wizardStep2Title: 'Instalar la aplicación',
    wizardStep3Title: 'Descargar archivo',
    wizardStep4Title: 'Listo',
    wizardBack: 'Atrás',
    wizardNext: 'Siguiente',
    wizardSkip: 'Omitir',
    backToSetup: 'Volver',
    openPackage: 'Abrir archivo .stillroll',
    exportPackage: 'Descargar archivo .stillroll',
    exportingPackage: 'Creando archivo…',
    packageQualityEvent: 'Optimizado',
    packageQualityOriginal: 'Originales',
    offlineHint:
      'Arrastra un archivo aquí o usa el botón de arriba. Funciona sin internet.',
    installApp: 'Instalar aplicación',
    installBannerText: 'Instala StillRoll — funciona sin conexión en el evento.',
    installCardTitle: 'Instala StillRoll en el ordenador',
    installCardIntro:
      'La app instalada funciona sin internet y abre archivos .stillroll con doble clic.',
    installCardInstalled:
      'StillRoll está instalado. Abre archivos .stillroll con doble clic.',
    installCardMobileHint:
      'La instalación solo funciona en ordenador. Abre esta página en Chrome o Edge en un portátil.',
    installGuideChrome1: 'Abre esta página en Google Chrome en tu ordenador.',
    installGuideChrome2:
      'En la barra de direcciones, a la derecha de la URL, busca ⊕ o “Instalar”. Si no aparece — ver paso 4 abajo.',
    installGuideChrome3:
      'Haz clic en “Instalar” y confirma. StillRoll aparecerá en Launchpad / menú Inicio.',
    installGuideEdge1: 'Abre esta página en Microsoft Edge en tu ordenador.',
    installGuideEdge2:
      'En la barra de direcciones, haz clic en “Instalar” o “Aplicación disponible”.',
    installGuideEdge3:
      'Confirma la instalación. StillRoll aparecerá en Inicio / Dock.',
    installGuideMenuAlt:
      'Menú ⋮ (arriba a la derecha) → “Guardar y compartir” → “Instalar página como aplicación”.',
    installGuideEngagement:
      '¿Sin icono? Recarga forzada (Cmd+Shift+R), ~30 s en la página y haz clic.',
    installGuideUnsupported:
      'Este navegador no permite instalar la app. Usa Chrome o Edge en un ordenador.',
    packageLoading: 'Cargando paquete…',
    packageReady: 'Pase listo',
    packageStart: 'Iniciar presentación',
    packageCancel: 'Cancelar',
    packageAutoStarting: 'Iniciando presentación…',
    useChromeEdge: 'Para modo offline usa Chrome o Edge en un ordenador.',
    exportProgress: 'Procesando fotos',
    exportComplete: 'Archivo descargado.',
    prepareSuccessTitle: 'Archivo listo para uso offline',
    prepareSuccessStep1:
      'Copia el archivo .stillroll a un pendrive u ordenador del evento.',
    prepareSuccessStep2:
      'En el ordenador del evento, abre la aplicación StillRoll instalada.',
    prepareSuccessWarningLabel: '¡Atención!',
    prepareSuccessWarning:
      'Asegúrate de que la aplicación esté instalada allí, o de que tendrás acceso a internet — si no, no se podrá reproducir la presentación.',
    prepareSuccessStep3:
      'Abre el archivo .stillroll con doble clic — la presentación arranca sin internet.',
    prepareAnother: 'Preparar otro archivo',
    prepareExportDesktopOnly:
      'Descargar el archivo requiere Chrome o Edge en un ordenador.',
    exportSizeWarning:
      'El tamaño estimado supera el límite del archivo (2 GB). Elige la opción optimizada o elimina algunas fotos.',
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
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
      return 'zdjęcia'
    return 'zdjęć'
  }
  if (lang === 'es') {
    return count === 1 ? 'foto' : 'fotos'
  }
  return count === 1 ? 'photo' : 'photos'
}
