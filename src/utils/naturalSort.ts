export function naturalCompare(a: string, b: string): number {
  const re = /(\d+)|(\D+)/g
  const aParts = a.match(re) ?? []
  const bParts = b.match(re) ?? []
  const len = Math.max(aParts.length, bParts.length)

  for (let i = 0; i < len; i++) {
    const aPart = aParts[i] ?? ''
    const bPart = bParts[i] ?? ''

    const aNum = /^\d+$/.test(aPart) ? Number(aPart) : null
    const bNum = /^\d+$/.test(bPart) ? Number(bPart) : null

    if (aNum !== null && bNum !== null) {
      if (aNum !== bNum) return aNum - bNum
    } else {
      const cmp = aPart.localeCompare(bPart, undefined, { sensitivity: 'base' })
      if (cmp !== 0) return cmp
    }
  }

  return 0
}
