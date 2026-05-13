export type Theme = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'sim_theme'

export function getStoredTheme(): Theme {
  return (localStorage.getItem(STORAGE_KEY) as Theme) ?? 'system'
}

export function setStoredTheme(theme: Theme): void {
  localStorage.setItem(STORAGE_KEY, theme)
}

export function getSystemTheme(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light'
}
