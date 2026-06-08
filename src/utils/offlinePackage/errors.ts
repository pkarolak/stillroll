import type { Language } from '../../i18n/types'

const MESSAGES: Record<string, Record<Language, string>> = {
  ARCHIVE_EMPTY: {
    pl: 'Plik pakietu jest pusty.',
    en: 'The package file is empty.',
    es: 'El archivo del paquete está vacío.',
  },
  ARCHIVE_TOO_LARGE: {
    pl: 'Pakiet jest za duży (maks. 2 GB).',
    en: 'Package is too large (max 2 GB).',
    es: 'El paquete es demasiado grande (máx. 2 GB).',
  },
  ZIP_BOMB_RATIO: {
    pl: 'Pakiet wygląda na niebezpieczny i został odrzucony.',
    en: 'This package looks unsafe and was rejected.',
    es: 'Este paquete parece inseguro y fue rechazado.',
  },
  ZIP_BOMB_UNCOMPRESSED: {
    pl: 'Rozpakowany pakiet przekracza dozwolony rozmiar.',
    en: 'Unpacked package exceeds the allowed size.',
    es: 'El paquete descomprimido supera el tamaño permitido.',
  },
  MANIFEST_MISSING: {
    pl: 'To nie jest pakiet StillRoll.',
    en: 'This is not a StillRoll package.',
    es: 'Esto no es un paquete StillRoll.',
  },
  MANIFEST_MISSING_FILES: {
    pl: 'W pakiecie brakuje niektórych zdjęć.',
    en: 'Some photos are missing from the package.',
    es: 'Faltan algunas fotos en el paquete.',
  },
  MANIFEST_INVALID: {
    pl: 'Nieprawidłowy manifest pakietu.',
    en: 'Invalid package manifest.',
    es: 'Manifiesto del paquete no válido.',
  },
  TOO_MANY_SLIDES: {
    pl: 'Za dużo zdjęć (maks. 2000).',
    en: 'Too many photos (max 2000).',
    es: 'Demasiadas fotos (máx. 2000).',
  },
  WORKER_CRASHED: {
    pl: 'Błąd przetwarzania pakietu.',
    en: 'Package processing failed.',
    es: 'Error al procesar el paquete.',
  },
}

export function packageErrorMessage(code: string, lang: Language): string {
  return (
    MESSAGES[code]?.[lang] ??
    {
      pl: 'Nie udało się otworzyć pakietu.',
      en: 'Could not open the package.',
      es: 'No se pudo abrir el paquete.',
    }[lang]
  )
}
