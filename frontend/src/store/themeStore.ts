import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeChoice = 'dark' | 'light' | 'system'

const getSystemIsDark = () => window.matchMedia('(prefers-color-scheme: dark)').matches

const resolveIsDark = (theme: ThemeChoice): boolean =>
  theme === 'system' ? getSystemIsDark() : theme === 'dark'

interface ThemeStore {
  theme: ThemeChoice
  isDark: boolean
  setTheme: (theme: ThemeChoice) => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      theme: 'system',
      isDark: getSystemIsDark(),
      setTheme: (theme) => set({ theme, isDark: resolveIsDark(theme) }),
    }),
    {
      name: 'fixit-theme',
      // Re-resolve isDark after rehydrating from localStorage so system preference isn't stale.
      onRehydrateStorage: () => (state) => {
        if (state) state.isDark = resolveIsDark(state.theme)
      },
    }
  )
)
