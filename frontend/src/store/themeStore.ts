import { create } from 'zustand'

type Theme = 'light' | 'dark' | 'system'

export const useThemeStore = create<{
  theme: Theme
  setTheme: (t: Theme) => void
}>((set) => ({
  theme: (localStorage.getItem('sim_theme') as Theme) || 'system',

  setTheme: (t) => {
    localStorage.setItem('sim_theme', t)
    set({ theme: t })
  },
}))