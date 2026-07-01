import Sidebar from '../layout/Sidebar'
import MiniSidebar from './MiniSidebar'
import SettingsModal from './SettingsModal'
import { useThemeStore } from '../../store/themeStore'
import { useSidebarStore } from '../../store/sideBarStore'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  const { isDark } = useThemeStore()
  const { isSidebarOpen, toggleSidebar, closeSidebar } = useSidebarStore()

  return (
    <div className={`flex h-screen overflow-hidden ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'}`}>

      {/* ── Desktop sidebar (inline in flex row) ── */}
      <div className="hidden md:block flex-shrink-0">
        {isSidebarOpen ? <Sidebar /> : <MiniSidebar />}
      </div>

      {/* ── Mobile sidebar (fixed overlay drawer) ── */}
      {isSidebarOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={closeSidebar}
          />
          <div className="fixed inset-y-0 left-0 z-40 md:hidden">
            <Sidebar />
          </div>
        </>
      )}

      {/* ── Main content (always full width on mobile) ── */}
      <main className="flex-1 overflow-y-auto min-w-0 flex flex-col">

        {/* Mobile top bar */}
        <div className={`md:hidden flex items-center gap-3 px-4 py-3 border-b flex-shrink-0
          ${isDark ? 'bg-[#111] border-[#1e1e1e]' : 'bg-white border-gray-200'}`}>
          <button
            onClick={toggleSidebar}
            className={`text-xl ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
            aria-label="Open menu"
          >
            ☰
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-xs">⚡</span>
            </div>
            <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>FixIt</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      <SettingsModal />
    </div>
  )
}
