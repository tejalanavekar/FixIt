import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AccentColor = 'blue' | 'purple' | 'green' | 'orange'

export const ACCENT_HEX: Record<AccentColor, { base: string; dark: string }> = {
  blue:   { base: '#3b82f6', dark: '#2563eb' },
  purple: { base: '#a855f7', dark: '#9333ea' },
  green:  { base: '#22c55e', dark: '#16a34a' },
  orange: { base: '#f97316', dark: '#ea6800' },
}

interface AppearanceStore {
  accent: AccentColor
  setAccent: (accent: AccentColor) => void
}

export const useAppearanceStore = create<AppearanceStore>()(
  persist(
    (set) => ({
      accent: 'blue',
      setAccent: (accent) => set({ accent }),
    }),
    { name: 'fixit-appearance' }
  )
)
