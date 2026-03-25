import type { Rank } from '@/types'

export const RANK_THRESHOLDS: Record<Rank, number> = {
  Bronze: 0,
  Silver: 10,
  Gold: 25,
  Platinum: 50,
  Diamond: 100,
}

export const RANK_COLORS: Record<Rank, string> = {
  Bronze: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  Silver: 'text-zinc-300 bg-zinc-300/10 border-zinc-300/20',
  Gold: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Platinum: 'text-sky-400 bg-sky-400/10 border-sky-400/20',
  Diamond: 'text-violet-400 bg-violet-400/10 border-violet-400/20',
}

export const RANK_ORDER: Rank[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond']

export function getNextRank(current: Rank): Rank | null {
  const idx = RANK_ORDER.indexOf(current)
  return idx < RANK_ORDER.length - 1 ? RANK_ORDER[idx + 1] : null
}
