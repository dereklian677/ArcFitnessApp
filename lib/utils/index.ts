import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { Exercise, Rank } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatDateShort(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function calculateVolume(exercises: Exercise[]): number {
  return exercises.reduce((total, ex) => {
    if (ex.sets && ex.reps && ex.weight_kg) {
      return total + ex.sets * ex.reps * ex.weight_kg
    }
    return total
  }, 0)
}

export function formatVolume(volume: number): string {
  if (volume >= 1000) {
    return `${(volume / 1000).toFixed(1)}k kg`
  }
  return `${volume.toFixed(0)} kg`
}

export function formatWeight(kg: number, unit: 'kg' | 'lbs' = 'kg'): string {
  if (unit === 'lbs') {
    return `${(kg * 2.20462).toFixed(1)} lbs`
  }
  return `${kg} kg`
}

export function getRankFromWorkouts(totalWorkouts: number): Rank {
  if (totalWorkouts >= 100) return 'Diamond'
  if (totalWorkouts >= 50) return 'Platinum'
  if (totalWorkouts >= 25) return 'Gold'
  if (totalWorkouts >= 10) return 'Silver'
  return 'Bronze'
}

export function getNextRankThreshold(currentWorkouts: number): number {
  if (currentWorkouts >= 100) return 100
  if (currentWorkouts >= 50) return 100
  if (currentWorkouts >= 25) return 50
  if (currentWorkouts >= 10) return 25
  return 10
}

export function getRankProgress(totalWorkouts: number): number {
  if (totalWorkouts >= 100) return 100
  if (totalWorkouts >= 50) return ((totalWorkouts - 50) / 50) * 100
  if (totalWorkouts >= 25) return ((totalWorkouts - 25) / 25) * 100
  if (totalWorkouts >= 10) return ((totalWorkouts - 10) / 15) * 100
  return (totalWorkouts / 10) * 100
}

export function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

export function checkPR(
  exerciseName: string,
  weightKg: number,
  reps: number,
  existingPRs: Array<{ exercise_name: string; weight_kg: number | null; reps: number | null }>
): boolean {
  const existing = existingPRs.find(
    (pr) => pr.exercise_name.toLowerCase() === exerciseName.toLowerCase()
  )
  if (!existing) return true
  if (!existing.weight_kg || !existing.reps) return true
  // New PR if heavier weight OR same weight with more reps
  return weightKg > existing.weight_kg || (weightKg === existing.weight_kg && reps > existing.reps)
}
