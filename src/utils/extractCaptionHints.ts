import exifr from 'exifr'
import type { Language } from '../i18n/types'

type ExifCaptionData = {
  DateTimeOriginal?: Date | string
  CreateDate?: Date | string
  City?: string
  State?: string
  Country?: string
  LocationCreated?: string
  GPSLatitude?: number
  GPSLongitude?: number
}

export type CaptionHints = {
  date?: string
  place?: string
}

const LOCALE_MAP: Record<Language, string> = {
  pl: 'pl-PL',
  en: 'en-US',
  es: 'es-ES',
}

function capitalizeFirst(value: string): string {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function toDate(value: Date | string | undefined): Date | null {
  if (!value) return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatCaptionDate(
  date: Date,
  language: Language,
): string {
  const formatted = new Intl.DateTimeFormat(LOCALE_MAP[language], {
    month: 'long',
    year: 'numeric',
  }).format(date)
  return capitalizeFirst(formatted)
}

function formatGpsPlace(lat?: number, lon?: number): string | undefined {
  if (lat === undefined || lon === undefined) return undefined
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return undefined
  const latStr = `${Math.abs(lat).toFixed(2)}°${lat >= 0 ? 'N' : 'S'}`
  const lonStr = `${Math.abs(lon).toFixed(2)}°${lon >= 0 ? 'E' : 'W'}`
  return `${latStr}, ${lonStr}`
}

function buildPlace(data: ExifCaptionData): string | undefined {
  const city = data.City?.trim() || data.LocationCreated?.trim()
  const state = data.State?.trim()
  const country = data.Country?.trim()

  if (city && country) return `${city}, ${country}`
  if (city && state) return `${city}, ${state}`
  if (city) return city
  if (state && country) return `${state}, ${country}`
  if (country) return country

  return formatGpsPlace(data.GPSLatitude, data.GPSLongitude)
}

export async function extractCaptionHints(
  file: File,
  language: Language,
): Promise<CaptionHints> {
  try {
    const data = (await exifr.parse(file, {
      pick: [
        'DateTimeOriginal',
        'CreateDate',
        'City',
        'State',
        'Country',
        'LocationCreated',
        'GPSLatitude',
        'GPSLongitude',
      ],
    })) as ExifCaptionData | null

    if (!data) return {}

    const hints: CaptionHints = {}
    const shotDate = toDate(data.DateTimeOriginal) ?? toDate(data.CreateDate)
    if (shotDate) {
      hints.date = formatCaptionDate(shotDate, language)
    }

    const place = buildPlace(data)
    if (place) hints.place = place

    return hints
  } catch {
    return {}
  }
}

const EXIF_BATCH_SIZE = 10

export async function batchExtractCaptionHints(
  files: Array<{ path: string; file: File }>,
  language: Language,
  onResult: (path: string, hints: CaptionHints) => void,
): Promise<void> {
  for (let i = 0; i < files.length; i += EXIF_BATCH_SIZE) {
    const batch = files.slice(i, i + EXIF_BATCH_SIZE)
    await Promise.all(
      batch.map(async ({ path, file }) => {
        const hints = await extractCaptionHints(file, language)
        if (hints.date || hints.place) onResult(path, hints)
      }),
    )
  }
}
