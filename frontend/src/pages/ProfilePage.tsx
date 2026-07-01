import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppLayout from '../components/layout/AppLayout'
import { useThemeStore } from '../store/themeStore'
import { getProfileStats, type ProfileStats } from '../services/session.service'
import { Clock, BookOpen, Brain, Flame } from 'lucide-react'

function formatDate(iso: string) {
  const d = new Date(iso)
  const today = new Date()
  const isToday = d.toDateString() === today.toDateString()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (isToday) return 'Today'
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export default function ProfilePage() {
  const navigate = useNavigate()
  const { isDark } = useThemeStore()
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    getProfileStats()
      .then(setStats)
      .finally(() => setIsLoading(false))
  }, [])

  if (isLoading || !stats) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-full">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    )
  }

  const initial = stats.email ? stats.email.charAt(0).toUpperCase() : '?'

  return (
    <AppLayout>
      <div className={`max-w-3xl mx-auto px-4 md:px-6 py-6 md:py-10 ${isDark ? 'text-white' : 'text-gray-900'}`}>

        <button
          onClick={() => navigate('/home')}
          className={`flex items-center gap-1 text-sm font-medium mb-6 transition ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          ← Back
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-2xl font-semibold">
            {initial}
          </div>
          <div>
            <h1 className="text-xl font-semibold">{stats.username || stats.email}</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{stats.email}</p>
            {stats.memberSince && (
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Clock size={13} className="inline-block mr-1" /> Member since {new Date(stats.memberSince).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className={`rounded-xl p-4 border ${isDark ? 'border-[#2a2a2a] bg-[#111]' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center gap-2 text-2xl font-bold"><BookOpen size={22} /> {stats.totalSessions}</div>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Sessions</p>
          </div>
          <div className={`rounded-xl p-4 border ${isDark ? 'border-[#2a2a2a] bg-[#111]' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center gap-2 text-2xl font-bold"><Brain size={22} /> {stats.conceptsLearned}</div>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Concepts Learned</p>
          </div>
          <div className={`rounded-xl p-4 border ${isDark ? 'border-[#2a2a2a] bg-[#111]' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center gap-2 text-2xl font-bold"><Flame size={22} /> {stats.streakDays} {stats.streakDays === 1 ? 'day' : 'days'}</div>
            <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Current Streak</p>
          </div>
        </div>

        {/* Top Topics */}
        <div className={`rounded-xl p-5 border mb-6 ${isDark ? 'border-[#2a2a2a] bg-[#111]' : 'border-gray-200 bg-white'}`}>
          <h2 className="font-semibold mb-4">Your Top Topics</h2>
          {stats.topTopics.length === 0 && (
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No sessions yet.</p>
          )}
          <div className="space-y-3">
            {stats.topTopics.map((topic) => (
              <div key={topic.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{topic.name}</span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{topic.count} sessions</span>
                </div>
                <div className={`h-1.5 rounded-full ${isDark ? 'bg-[#2a2a2a]' : 'bg-gray-200'}`}>
                  <div
                    className="h-1.5 rounded-full bg-blue-600"
                    style={{ width: `${topic.avgProgress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Sessions */}
        <div className={`rounded-xl p-5 border ${isDark ? 'border-[#2a2a2a] bg-[#111]' : 'border-gray-200 bg-white'}`}>
          <h2 className="font-semibold mb-4">Recent Sessions</h2>
          {stats.recentSessions.length === 0 && (
            <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>No sessions yet.</p>
          )}
          <div className="space-y-1">
            {stats.recentSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3 min-w-0">
                  {s.language && (
                    <span className={`text-xs px-2 py-0.5 rounded uppercase ${isDark ? 'bg-[#1a1a1a] text-gray-400' : 'bg-gray-100 text-gray-600'}`}>
                      {s.language}
                    </span>
                  )}
                  <span className="text-sm truncate">{s.title}</span>
                </div>
                <span className={`text-xs flex-shrink-0 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {formatDate(s.created_at)}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </AppLayout>
  )
}
