import type { CreatureState, TerrariumState, TerrariumEvent } from '#schema.ts'

export type { CreatureState, TerrariumState, TerrariumEvent }

export const RIVET_ENDPOINT = '/rivet'

export function hslStr(hue: number, saturation: number, lightness: number = 50): string {
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

export function hslStrA(
  hue: number,
  saturation: number,
  lightness: number = 50,
  alpha: number = 1
): string {
  return `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`
}

export function energyColor(energy: number): string {
  if (energy > 60) return '#00ffd5'
  if (energy > 30) return '#ffb347'
  return '#ff6b6b'
}

export function statusLabel(status: string): string {
  switch (status) {
    case 'active':
      return 'Active'
    case 'hibernating':
      return 'Hibernating'
    case 'dead':
      return 'Perished'
    default:
      return status
  }
}

export function statusIcon(status: string): string {
  switch (status) {
    case 'active':
      return '●'
    case 'hibernating':
      return '❄'
    case 'dead':
      return '✕'
    default:
      return '?'
  }
}

export function formatAmount(amount: number): string {
  return amount.toFixed(4)
}

export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  if (seconds < 5) return 'just now'
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}

export function generateBlobPath(seed: number, size: number, complexity: number = 0.5): string {
  const points = 6 + Math.floor(complexity * 6)
  const angleStep = (Math.PI * 2) / points
  const coords: { x: number; y: number }[] = []

  let s = seed
  const rng = () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff
    return (s >>> 0) / 0xffffffff
  }

  for (let i = 0; i < points; i++) {
    const angle = i * angleStep - Math.PI / 2
    const variance = 0.7 + rng() * 0.3 * (1 + complexity)
    const radius = (30 + size * 15) * variance
    coords.push({
      x: 50 + Math.cos(angle) * radius,
      y: 50 + Math.sin(angle) * radius
    })
  }

  let path = `M ${coords[0].x} ${coords[0].y}`
  for (let i = 0; i < coords.length; i++) {
    const curr = coords[i]
    const next = coords[(i + 1) % coords.length]
    const cpx = (curr.x + next.x) / 2 + (rng() - 0.5) * 10
    const cpy = (curr.y + next.y) / 2 + (rng() - 0.5) * 10
    path += ` Q ${cpx} ${cpy} ${next.x} ${next.y}`
  }
  path += ' Z'
  return path
}
