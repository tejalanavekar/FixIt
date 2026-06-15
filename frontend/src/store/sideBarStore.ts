import { create } from 'zustand'

interface SidebarState {
  isSidebarOpen: boolean
  toggleSidebar: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isSidebarOpen: true,
  toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
}))

// So basically at start the sidebar will be open and then user can swittch tthe value of sidebaropen to false by clicking the toggle button.