import { useSidebarStore } from '../../store/sideBarStore'
import { useThemeStore } from '../../store/themeStore'

export default function MiniSidebar() {
  const { toggleSidebar } = useSidebarStore()
  const { isDark } = useThemeStore()

  return (
    <div className={`w-12 border-r flex flex-col items-center py-4 ${isDark ? 'bg-[#111] border-[#1e1e1e]'
      : 'bg-white border-gray-200'}`}>

      <button
    onClick={toggleSidebar}
    className={`text-2xl transition-colors ${
      isDark
        ? 'text-gray-400 hover:text-white'
        : 'text-gray-600 hover:text-black'
    }`}
  >
    ☰
  </button>

    </div>
  )
}
