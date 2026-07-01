import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import type { Session } from '@supabase/supabase-js'
import { useThemeStore } from '../../store/themeStore'
import { useSidebarStore } from '../../store/sideBarStore'
import { useSessionsStore } from '../../store/sessionsStore'
import { useSettingsStore } from '../../store/settingsStore'
import { updateSession, deleteSession, type SessionRow } from '../../services/session.service'
import { User, Settings, LogOut, Pin, Pencil, Trash2 } from 'lucide-react'

function groupSessions(sessions: SessionRow[]) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)

  const groups: { today: SessionRow[]; yesterday: SessionRow[]; thisWeek: SessionRow[]; older: SessionRow[] } = {
    today: [],
    yesterday: [],
    thisWeek: [],
    older: []
  }

  for (const s of sessions) {
    const created = new Date(s.created_at)
    if (created >= today) groups.today.push(s)
    else if (created >= yesterday) groups.yesterday.push(s)
    else if (created >= weekAgo) groups.thisWeek.push(s)
    else groups.older.push(s)
  }
  return groups
}

//component for sidebar, at start session is null as user not logged in
export default function Sidebar() {
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null>(null)
  const { sessions, loadSessions, setSessions } = useSessionsStore()
  const { closeSidebar } = useSidebarStore()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [openRowMenuId, setOpenRowMenuId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const editInputRef = useRef<HTMLInputElement>(null)
  const { isDark } = useThemeStore()
  const { toggleSidebar } = useSidebarStore()
  const openSettings = useSettingsStore((s) => s.open)

  useEffect(() => {
    const getSesssion = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      setSession(session)
    }
    getSesssion()
    loadSessions()
  }, [])

  useEffect(() => {
    if (editingId) editInputRef.current?.focus()
  }, [editingId])

  //Logout function, returns back to the signin page
  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/signin')
  }

  //to get the initial values
  const getInitials = (email: string) => {
    return email.charAt(0).toUpperCase()
  }

  const closeOnMobile = () => { if (window.innerWidth < 768) closeSidebar() }

  const openSession = (s: SessionRow) => {
    navigate('/playground', { state: { userInput: s.user_input, sessionId: s.id } })
    closeOnMobile()
  }

  const startRename = (s: SessionRow) => {
    setOpenRowMenuId(null)
    setEditingId(s.id)
    setEditValue(s.title)
  }

  const commitRename = async (s: SessionRow) => {
    const newTitle = editValue.trim()
    setEditingId(null)
    if (!newTitle || newTitle === s.title) return
    try {
      const updated = await updateSession(s.id, { title: newTitle })
      setSessions((prev) => prev.map((row) => (row.id === s.id ? { ...row, title: updated.title } : row)))
    } catch {
      // best-effort — leave the title as-is if the rename fails
    }
  }

  const handleTogglePin = async (s: SessionRow) => {
    setOpenRowMenuId(null)
    try {
      const updated = await updateSession(s.id, { bookmarked: !s.bookmarked })
      setSessions((prev) => prev.map((row) => (row.id === s.id ? { ...row, bookmarked: updated.bookmarked } : row)))
    } catch {
      // best-effort
    }
  }

  const handleDelete = async (s: SessionRow) => {
    setOpenRowMenuId(null)
    if (!window.confirm(`Delete "${s.title}"? This can't be undone.`)) return
    try {
      await deleteSession(s.id)
      setSessions((prev) => prev.filter((row) => row.id !== s.id))
    } catch {
      // best-effort
    }
  }

  const groups = groupSessions(sessions)
  const bookmarks = sessions.filter((s) => s.bookmarked)

  const renderSessionGroup = (label: string, rows: SessionRow[]) => {
    if (rows.length === 0) return null
    return (
      <div className="mb-4">
        <p className="text-[#555] text-xs font-medium uppercase tracking-wider mb-2 px-2">{label}</p>
        {rows.map((s) => (
          <div key={s.id} className="relative group">
            {editingId === s.id ? (
              <input
                ref={editInputRef}
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={() => commitRename(s)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') e.currentTarget.blur()
                  if (e.key === 'Escape') setEditingId(null)
                }}
                className={`w-full pl-2 pr-7 py-1.5 rounded-lg text-sm border outline-none
                  ${isDark ? 'bg-[#1a1a1a] text-white border-blue-500' : 'bg-white text-black border-blue-500'}`}
              />
            ) : (
              <button
                onClick={() => openSession(s)}
                className={`w-full text-left pl-2 pr-7 py-1.5 rounded-lg transition text-sm truncate flex items-center gap-1
                  ${isDark ? 'text-white hover:text-white hover:bg-[#1a1a1a]' : 'text-black hover:text-black hover:bg-gray-100'}`}
              >
                {s.bookmarked && <Pin size={12} className="flex-shrink-0" />}
                <span className="truncate">{s.title}</span>
              </button>
            )}

            {editingId !== s.id && (
            <button
              onClick={(e) => { e.stopPropagation(); setOpenRowMenuId(openRowMenuId === s.id ? null : s.id) }}
              className={`absolute right-1 top-1/2 -translate-y-1/2 px-1.5 rounded opacity-0 group-hover:opacity-100 transition text-sm
                ${isDark ? 'text-gray-400 hover:text-white hover:bg-[#2a2a2a]' : 'text-gray-500 hover:text-black hover:bg-gray-200'}`}
              aria-label="Session options"
            >
              ⋯
            </button>
            )}

            {openRowMenuId === s.id && (
              <>
                <button
                  className="fixed inset-0 z-10 cursor-default"
                  onClick={() => setOpenRowMenuId(null)}
                  aria-label="Close menu"
                />
                <div className={`absolute right-1 top-full mt-1 w-36 rounded-lg border shadow-lg z-20 overflow-hidden
                  ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
                  <button
                    onClick={() => handleTogglePin(s)}
                    className={`w-full text-left px-3 py-2 text-sm transition flex items-center gap-2 ${isDark ? 'text-white hover:bg-[#2a2a2a]' : 'text-gray-900 hover:bg-gray-100'}`}
                  >
                    <Pin size={13} /> {s.bookmarked ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => startRename(s)}
                    className={`w-full text-left px-3 py-2 text-sm transition flex items-center gap-2 ${isDark ? 'text-white hover:bg-[#2a2a2a]' : 'text-gray-900 hover:bg-gray-100'}`}
                  >
                    <Pencil size={13} /> Rename
                  </button>
                  <button
                    onClick={() => handleDelete(s)}
                    className={`w-full text-left px-3 py-2 text-sm transition flex items-center gap-2 text-red-400 ${isDark ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-100'}`}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    )
  }

  return (
    <aside className={`w-72 h-screen border-r flex flex-col ${
      isDark ? 'bg-[#111] border-[#1e1e1e]' : 'bg-white border-gray-200'
    }`}>

      {/* Logo */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-sm">⚡</span>
          </div>
          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>FixIt</span>
        </div>

        <button
          onClick={toggleSidebar}
          className={`text-2xl font-bold transition ${
            isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'
          }`}
        >
          ←
        </button>
      </div>

      {/*New Session Button */}
      <div className="p-3 pt-1 pb-3">
        <button
          onClick={() => { navigate('/home'); closeOnMobile() }}
          className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg border transition text-sm
            ${isDark
              ? 'border-gray-300 text-white hover:text-white hover:bg-[#1a1a1a] hover:border-[#3a3a3a]'
              : 'border-gray-500 text-black hover:text-black hover:bg-gray-100 hover:border-gray-400'
            }`}
        >
          <span>+</span>
          <span>New Session</span>
        </button>
      </div>

      {/* Session History List — scrolls independently of the footer below */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        {renderSessionGroup('Today', groups.today)}
        {renderSessionGroup('Yesterday', groups.yesterday)}
        {renderSessionGroup('This Week', groups.thisWeek)}
        {renderSessionGroup('Older', groups.older)}
        {bookmarks.length > 0 && renderSessionGroup('Bookmarks', bookmarks)}
      </div>

      {/* Footer — fixed at the bottom, never scrolls with the session list */}
      <div className="p-3 border-t border-[#1e1e1e] flex-shrink-0">
        {/* User Avatar — opens Profile/Settings/Logout menu */}
        <div className="relative">
          {isMenuOpen && (
            <>
              <button
                className="fixed inset-0 z-10 cursor-default"
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
              />
              <div className={`absolute bottom-full left-0 mb-2 w-full rounded-lg border shadow-lg z-20 overflow-hidden
                ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a]' : 'bg-white border-gray-200'}`}>
                <button
                  onClick={() => { setIsMenuOpen(false); navigate('/profile'); closeOnMobile() }}
                  className={`w-full text-left px-3 py-2 text-sm transition flex items-center gap-2 ${isDark ? 'text-white hover:bg-[#2a2a2a]' : 'text-gray-900 hover:bg-gray-100'}`}
                >
                  <User size={14} /> Profile
                </button>
                <button
                  onClick={() => { setIsMenuOpen(false); openSettings() }}
                  className={`w-full text-left px-3 py-2 text-sm transition flex items-center gap-2 ${isDark ? 'text-white hover:bg-[#2a2a2a]' : 'text-gray-900 hover:bg-gray-100'}`}
                >
                  <Settings size={14} /> Settings
                </button>
                <button
                  onClick={handleLogout}
                  className={`w-full text-left px-3 py-2 text-sm transition flex items-center gap-2 text-red-400 ${isDark ? 'hover:bg-[#2a2a2a]' : 'hover:bg-gray-100'}`}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            </>
          )}

          <button
            onClick={() => setIsMenuOpen((open) => !open)}
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-lg transition
              ${isDark ? 'hover:bg-[#1a1a1a]' : 'hover:bg-gray-100'}`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {session?.user?.email ? getInitials(session.user.email) : '?'}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className={`text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {session?.user?.email || 'Loading...'}
              </p>
            </div>
          </button>
        </div>
      </div>
    </aside>
  )
}
