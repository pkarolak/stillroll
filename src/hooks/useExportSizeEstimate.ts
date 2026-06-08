import { useEffect, useState } from 'react'
import type { ImageEntry } from '../types'
import {
  estimateExportSizes,
  type ExportSizeEstimate,
} from '../utils/offlinePackage/estimateExportSize'

export function useExportSizeEstimate(entries: ImageEntry[]) {
  const [estimate, setEstimate] = useState<ExportSizeEstimate | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (entries.length === 0) {
      setEstimate(null)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    estimateExportSizes(entries)
      .then((result) => {
        if (!cancelled) {
          setEstimate(result)
          setLoading(false)
        }
      })
      .catch(() => {
        if (!cancelled) {
          setEstimate(null)
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [entries])

  return { estimate, loading }
}
