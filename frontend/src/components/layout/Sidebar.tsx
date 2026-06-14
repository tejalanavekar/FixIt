import { useState, useEffect } from 'react'
import {  useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { useThemeStore } from '../../store/themeStore'


const todaySessions = [
  { id: '1', title: 'CORS Policy Error' },
  { id: '2', title: 'SQL LEFT JOIN confusion' },
  { id: '3', title: 'TypeScript generics' },
]

const yesterdaySessions = [
  { id: '4', title: 'React useEffect loop' },
  { id: '5', title: 'JWT token expiry' },
]

const thisWeekSessions = [
  { id: '6', title: 'CSS flexbox alignment' },
  { id: '7', title: 'Promise chaining' },
  { id: '8', title: 'Postgres indexing' },
]

const bookmarks = [
  { id: '1', title: 'How OAuth 2.0 works' },
  { id: '2', title: 'Big O notation' },
]

//component for sidebar, at start session is null as user not logged in 
export default function Sidebar(){
    const navigate = useNavigate()
    const [session, setSession] = useState<Session | null>(null)
    const { isDark, toggleTheme } = useThemeStore()

    useEffect(() => {
        const getSesssion = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setSession(session)
        }
        getSesssion()
    }, [])

    //Logout function, returns back to the signin page 
    const handleLogout = async () =>{
        await supabase.auth.signOut()
        navigate('/signin')
    }


    //to get the initial values
    const getInitials = (email : string) => {
        return email.charAt(0).toUpperCase()
    }

    return (
        <aside className=" w-64
  h-screen
  bg-white
  dark:bg-[#111]
  border-r
  border-gray-200
  dark:border-[#1e1e1e] flex flex-col">

      {/* Logo */}
      <div className="p-4 border-b border-[#1e1e1e]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">⚡</span>
          </div>
          <span className="text-white dark:text-white font-semibold">FixIt</span>
        </div>
      </div>

      {/*New Session Button */}
      <div className="p-3">
        <button
          onClick={() => navigate('/home')}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg border border-[#2a2a2a] text-gray-400 hover:text-white dark:hover:bg-[#1a1a1a]  hover:border-[#3a3a3a] transition text-sm"
        >
          <span>+</span>
          <span>New Session</span>
        </button>
      </div>

      {/* Session History List*/}
      {/* map is to create array of the list */}
      <div className="flex-1 overflow-y-auto px-3 py-2">

        {/* Today */}
        <div className="mb-4">
          <p className="text-[#555] text-xs font-medium uppercase tracking-wider mb-2 px-2">
            Today
          </p>
          {todaySessions.map((s) => (
            <button
              key={s.id}
              className="w-full text-left px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition text-sm truncate"
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* Yesterday */}
        <div className="mb-4">
          <p className="text-[#555] text-xs font-medium uppercase tracking-wider mb-2 px-2">
            Yesterday
          </p>
          {yesterdaySessions.map((s) => (
            <button
              key={s.id}
              className="w-full text-left px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition text-sm truncate"
            >
              {s.title}
            </button>
          ))}
        </div>

        {/* This Week */}
        <div className="mb-4">
          <p className="text-[#555] text-xs font-medium uppercase tracking-wider mb-2 px-2">
            This Week
          </p>
          {thisWeekSessions.map((s) => (
            <button
              key={s.id}
              className="w-full text-left px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition text-sm truncate"
            >
              {s.title}
            </button>
          ))}
        </div>
        {/* Bookmarks */}
        <div className="mb-4">
          <p className="text-[#555] text-xs font-medium uppercase tracking-wider mb-2 px-2">
            Bookmarks
          </p>
          {bookmarks.map((b) => (
            <button
              key={b.id}
              className="w-full text-left px-2 py-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1a] transition text-sm truncate"
            >
              {b.title}
            </button>
          ))}
        </div>

        {/* User Avatar — pinned to bottom */}
      <div className="p-3 border-t border-[#1e1e1e] space-y-2">
        {/* Theme Toggle */}
  <button
    onClick={toggleTheme}
    className="w-full flex items-center justify-between px-2 py-2 rounded-lg hover:bg-[#1a1a1a] transition"
  >
    <span className="flex items-center gap-2 text-sm text-gray-300">
      {isDark ? '🌙' : '☀️'}
      {isDark ? 'Dark Mode' : 'Light Mode'}
    </span>

    <div
      className={`w-8 h-4 rounded-full transition ${
        isDark ? 'bg-blue-600' : 'bg-gray-600'
      }`}
    >
      <div
        className={`w-3 h-3 bg-white rounded-full mt-0.5 transition-transform ${
          isDark ? 'translate-x-4' : 'translate-x-1'
        }`}
      />
    </div>
  </button>

  {/* User Avatar */}
  <button
    onClick={handleLogout}
    className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#1a1a1a] transition"
  >
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
      <span className="text-white text-sm font-medium">
        {session?.user?.email ? getInitials(session.user.email) : '?'}
      </span>
    </div>
        {/* For email */}
    <div className="flex-1 min-w-0 text-left">
      <p className="text-white text-sm truncate">
        {session?.user?.email || 'Loading...'}
      </p>
    </div>
  </button>

      </div>
</div>
    </aside>
    )
 }