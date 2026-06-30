// store/themeStore.ts

import { create } from 'zustand'

interface ThemeStore {
  isDark: boolean
  toggleTheme: () => void
  setTheme: (isDark: boolean) => void
}

export const useThemeStore = create<ThemeStore>((set) => ({
  isDark: true,
  toggleTheme: () =>
    set((state) => ({
      isDark: !state.isDark,
    })),
  setTheme: (isDark) => set({ isDark }),
}))