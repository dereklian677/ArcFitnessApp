'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'

interface ExerciseWeightInputProps {
  value: number | null | undefined
  onChange: (kg: number | null) => void
  preference: 'metric' | 'imperial'
}

function toDisplay(kg: number | null | undefined, pref: 'metric' | 'imperial'): string {
  if (kg == null) return ''
  return pref === 'imperial'
    ? String(Math.round(kg * 2.20462 * 10) / 10)
    : String(kg)
}

export function ExerciseWeightInput({ value, onChange, preference }: ExerciseWeightInputProps) {
  const [display, setDisplay] = useState(() => toDisplay(value, preference))

  // Only re-initialize display when preference changes, not while typing
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { setDisplay(toDisplay(value, preference)) }, [preference])

  return (
    <Input
      type="number"
      step="0.5"
      placeholder={preference === 'imperial' ? '135' : '60'}
      value={display}
      onChange={(e) => {
        setDisplay(e.target.value)
        const raw = e.target.value !== '' ? Number(e.target.value) : null
        if (raw === null || isNaN(raw)) { onChange(null); return }
        onChange(preference === 'imperial' ? parseFloat((raw / 2.20462).toFixed(2)) : raw)
      }}
    />
  )
}
