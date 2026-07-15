import { useSidebarStore } from '../../store/sideBarStore'
import { useThemeStore } from '../../store/themeStore'

export default function MiniSidebar() {
  const { toggleSidebar } = useSidebarStore()
  const { isDark } = useThemeStore()

  return (
    <button
      onClick={toggleSidebar}
      className={`absolute top-4 left-4 z-10 text-2xl transition-colors ${
        isDark
          ? 'text-gray-400 hover:text-white'
          : 'text-gray-600 hover:text-black'
      }`}
    >
      ☰
    </button>
  )
}
