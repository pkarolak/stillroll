import exifr from 'exifr'
import type { OrientationTransform } from '../types'

const ORIENTATION_MAP: Record<number, OrientationTransform> = {
  1: { rotate: 0 },
  2: { rotate: 0, scaleX: -1 },
  3: { rotate: 180 },
  4: { rotate: 180, scaleX: -1 },
  5: { rotate: 90, scaleX: -1 },
  6: { rotate: 90 },
  7: { rotate: -90, scaleX: -1 },
  8: { rotate: -90 },
}

export function orientationToTransform(orientation: number): OrientationTransform {
  return ORIENTATION_MAP[orientation] ?? { rotate: 0 }
}

export function transformToCss(transform: OrientationTransform): string {
  const parts: string[] = []
  if (transform.scaleX !== undefined || transform.scaleY !== undefined) {
    parts.push(`scale(${transform.scaleX ?? 1}, ${transform.scaleY ?? 1})`)
  }
  if (transform.rotate !== 0) {
    parts.push(`rotate(${transform.rotate}deg)`)
  }
  return parts.length > 0 ? parts.join(' ') : 'none'
}

export async function getOrientation(file: File): Promise<OrientationTransform> {
  try {
    const exif = await exifr.parse(file, { pick: ['Orientation'] })
    const orientation = exif?.Orientation ?? 1
    return orientationToTransform(orientation)
  } catch {
    return { rotate: 0 }
  }
}
