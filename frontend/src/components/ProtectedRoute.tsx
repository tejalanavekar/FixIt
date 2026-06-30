import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function FullScreenSpinner() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <FullScreenSpinner />
  if (!isAuthenticated) return <Navigate to="/signin" replace />
  return <>{children}</>
}

export function RedirectIfAuthed({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()
  if (isLoading) return <FullScreenSpinner />
  if (isAuthenticated) return <Navigate to="/home" replace />
  return <>{children}</>
}
