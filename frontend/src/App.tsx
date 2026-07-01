import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import { useThemeStore } from './store/themeStore'
import { useAppearanceStore, ACCENT_HEX } from './store/appearanceStore'
import PlaygroundPage from './pages/PlaygroundPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import { RequireAuth, RedirectIfAuthed } from './components/ProtectedRoute'

function App() {
  const { isDark, theme, setTheme } = useThemeStore()
  const { accent } = useAppearanceStore()

  // Apply dark/light class to <html>
  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  // Re-resolve when OS preference changes and theme is set to 'system'
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      if (useThemeStore.getState().theme === 'system') {
        setTheme('system')
      }
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Apply accent color as CSS custom properties on :root
  useEffect(() => {
    const { base, dark } = ACCENT_HEX[accent]
    document.documentElement.style.setProperty('--fixit-accent', base)
    document.documentElement.style.setProperty('--fixit-accent-dark', dark)
  }, [accent])

  // Suppress unused warning — theme is read only to satisfy the effect dep above indirectly
  void theme

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RedirectIfAuthed><SignInPage /></RedirectIfAuthed>} />
        <Route path="/signin" element={<RedirectIfAuthed><SignInPage /></RedirectIfAuthed>} />
        <Route path="/signup" element={<RedirectIfAuthed><SignUpPage /></RedirectIfAuthed>} />
        <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/playground" element={<RequireAuth><PlaygroundPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/settings" element={<RequireAuth><SettingsPage /></RequireAuth>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
