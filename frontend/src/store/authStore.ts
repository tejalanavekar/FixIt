// store -> global state and any componenet can read it globally and lives outside the commponent
// using zustand for state management

import { create } from 'zustand'
import type { AuthState, User } from '../types/index'
// AuthStore extends AuthState and adds methods to update the state
interface AuthStore extends AuthState {
  setUser: (user: User | null) => void
  setLoading: (isLoading: boolean) => void
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  setUser: (user) => set({ user , isAuthenticated: !!user , isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
}))


//setUser -> updates who logged in , setLoading -> updates the  loading state
// state -> data, actions -> functions for change of the data 
// initial value -> user is null as no one logged in yet, the loading is true as no session, once there is setUser the isloading is set to false that it was loaded 