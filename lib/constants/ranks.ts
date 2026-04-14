import type { Rank } from '@/types'

export const RANK_THRESHOLDS: Record<Rank, number> = {
  Bronze:   0,
  Silver:   10,
  Gold:     25,
  Platinum: 50,
  Diamond:  100,
}

// Hex values for each rank — used in RankBadge
export const RANK_HEX: Record<Rank, { text: string; bg: string; border: string }> = {
  Bronze:   { text: '#CD7F32', bg: 'rgba(205, 127, 50, 0.08)',  border: 'rgba(205, 127, 50, 0.25)' },
  Silver:   { text: '#C0C0C0', bg: 'rgba(192, 192, 192, 0.08)', border: 'rgba(192, 192, 192, 0.25)' },
  Gold:     { text: '#D4AF37', bg: 'rgba(212, 175, 55, 0.08)',  border: 'rgba(212, 175, 55, 0.25)' },
  Platinum: { text: '#06B6D4', bg: 'rgba(6, 182, 212, 0.08)',   border: 'rgba(6, 182, 212, 0.25)'  },
  Diamond:  { text: '#7C3AED', bg: 'rgba(124, 58, 237, 0.08)',  border: 'rgba(124, 58, 237, 0.25)' },
}

// Legacy Tailwind classes kept for compatibility
export const RANK_COLORS: Record<Rank, string> = {
  Bronze:   'text-amber-600 bg-amber-600/10 border-amber-600/20',
  Silver:   'text-zinc-300 bg-zinc-300/10 border-zinc-300/20',
  Gold:     'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Platinum: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  Diamond:  'text-violet-400 bg-violet-400/10 border-violet-400/20',
}

export const RANK_ORDER: Rank[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']

export function getNextRank(current: Rank): Rank | null {
  const idx = RANK_ORDER.indexOf(current)
  return idx < RANK_ORDER.length - 1 ? RANK_ORDER[idx + 1] : null
}
