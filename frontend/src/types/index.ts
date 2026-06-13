export interface User {
  id: string
  authId: string
  username: string
  email: string
  avatarUrl?: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}