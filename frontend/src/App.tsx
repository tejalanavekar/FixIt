import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import { useThemeStore } from './store/themeStore'
import PlaygroundPage from './pages/PlaygroundPage'
import ProfilePage from './pages/ProfilePage'
import SettingsPage from './pages/SettingsPage'
import { RequireAuth, RedirectIfAuthed } from './components/ProtectedRoute'


function App() {
  const { isDark } = useThemeStore()
   useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])
  
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