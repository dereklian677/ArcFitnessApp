'use client'

import { createContext, useContext, useState } from 'react'
import { formatWeight, formatVolume, formatHeight } from '@/lib/utils'

export type UnitPreference = 'metric' | 'imperial'

interface UnitContextValue {
  preference: UnitPreference
  setPreference: (p: UnitPreference) => void
  fmtWeight: (kg: number) => string
  fmtVolume: (kg: number) => string
  fmtHeight: (cm: number) => string
}

const UnitContext = createContext<UnitContextValue | null>(null)

export function UnitProvider({
  initialPreference = 'metric',
  children,
}: {
  initialPreference?: UnitPreference
  children: React.ReactNode
}) {
  const [preference, setPreference] = useState<UnitPreference>(initialPreference)

  const value: UnitContextValue = {
    preference,
    setPreference,
    fmtWeight: (kg) => formatWeight(kg, preference),
    fmtVolume: (kg) => formatVolume(kg, preference),
    fmtHeight: (cm) => formatHeight(cm, preference),
  }

  return <UnitContext.Provider value={value}>{children}</UnitContext.Provider>
}

export function useUnit(): UnitContextValue {
  const ctx = useContext(UnitContext)
  if (!ctx) throw new Error('useUnit must be used within UnitProvider')
  return ctx
}
