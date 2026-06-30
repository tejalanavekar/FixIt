import { create } from 'zustand'
import { listSessions, type SessionRow } from '../services/session.service'

interface SessionsState {
  sessions: SessionRow[]
  hasLoaded: boolean
  loadSessions: () => void
  setSessions: (updater: (prev: SessionRow[]) => SessionRow[]) => void
}

// Cached across Sidebar remounts (every route change remounts AppLayout/Sidebar),
// so navigating between pages no longer flashes an empty list while refetching.
export const useSessionsStore = create<SessionsState>((set, get) => ({
  sessions: [],
  hasLoaded: false,
  loadSessions: () => {
    if (get().hasLoaded) return
    listSessions()
      .then((sessions) => set({ sessions, hasLoaded: true }))
      .catch(() => set({ sessions: [], hasLoaded: true }))
  },
  setSessions: (updater) => set((state) => ({ sessions: updater(state.sessions) }))
}))
