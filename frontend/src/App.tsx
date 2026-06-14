import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { useEffect } from 'react'
import SignInPage from './pages/SignInPage'
import SignUpPage from './pages/SignUpPage'
import HomePage from './pages/HomePage'
import AppLayout from './components/layout/AppLayout'
import { useThemeStore } from './store/themeStore'

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
        <Route path="/" element={<SignInPage />} />
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/home" element={<HomePage />} />
      </Routes>
    </BrowserRouter>
    
  )
}

export default App