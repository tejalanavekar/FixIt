import AppLayout from '../components/layout/AppLayout'
import { useThemeStore } from '../store/themeStore'

export default function SettingsPage() {
  const { isDark } = useThemeStore()

  return (
    <AppLayout>
      <div className={`flex flex-col items-center justify-center h-full gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <h1 className="text-2xl font-semibold">Settings</h1>
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>🚧 Still under construction.</p>
      </div>
    </AppLayout>
  )
}
