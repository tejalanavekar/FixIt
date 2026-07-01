import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'
import { useThemeStore, type ThemeChoice } from '../../store/themeStore'
import { useSettingsStore } from '../../store/settingsStore'
import { useEditorSettingsStore } from '../../store/editorSettingsStore'
import { useAppearanceStore, ACCENT_HEX, type AccentColor } from '../../store/appearanceStore'

type NavItem = 'account' | 'appearance' | 'notifications' | 'editor' | 'privacy' | 'billing'

const NAV: { id: NavItem; label: string; icon: string }[] = [
  { id: 'account', label: 'Account', icon: '👤' },
  { id: 'appearance', label: 'Appearance', icon: '🎨' },
  { id: 'notifications', label: 'Notifications', icon: '🔔' },
  { id: 'editor', label: 'Editor', icon: '⌨️' },
  { id: 'privacy', label: 'Privacy', icon: '🔒' },
  { id: 'billing', label: 'Billing', icon: '💳' },
]

// Reusable toggle button
function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${on ? 'bg-blue-600' : 'bg-gray-600'}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  )
}

const selectCls = 'bg-[#1a1a1a] border border-[#2a2a2a] text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-blue-500 cursor-pointer'

export default function SettingsModal() {
  const { isDark, theme, setTheme } = useThemeStore()
  const { accent, setAccent } = useAppearanceStore()
  const { isOpen, close } = useSettingsStore()
  const editorStore = useEditorSettingsStore()
  const [activeTab, setActiveTab] = useState<NavItem>('account')

  // ── Account ──
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [showPasswordSection, setShowPasswordSection] = useState(false)
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [retypePassword, setRetypePassword] = useState('')
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; ok: boolean } | null>(null)
  const [isSavingPw, setIsSavingPw] = useState(false)

  // ── Notifications ──
  const [notifs, setNotifs] = useState({
    sessionReminders: true,
    weeklyDigest: true,
    streakAlerts: true,
    productUpdates: false,
    emailNotifications: true,
  })
  const [notifSaved, setNotifSaved] = useState(false)

  // ── Privacy ──
  const [privacy, setPrivacy] = useState({
    publicProfile: false,
    shareActivity: true,
    usageAnalytics: true,
  })
  const [privacySaved, setPrivacySaved] = useState(false)

  // ── Editor local draft (so "Save changes" is explicit) ──
  const [editorDraft, setEditorDraft] = useState({
    fontFamily: editorStore.fontFamily,
    fontSize: editorStore.fontSize,
    tabSize: editorStore.tabSize,
    lineNumbers: editorStore.lineNumbers,
    wordWrap: editorStore.wordWrap,
    minimap: editorStore.minimap,
  })
  const [editorSaved, setEditorSaved] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      setEmail(user.email ?? '')
      setFullName(user.user_metadata?.full_name ?? '')
      const { data } = await supabase.from('users').select('username').eq('auth_id', user.id).maybeSingle()
      setUsername(data?.username ?? '')
    }
    load()
    // sync editor draft with stored values each open
    setEditorDraft({
      fontFamily: editorStore.fontFamily,
      fontSize: editorStore.fontSize,
      tabSize: editorStore.tabSize,
      lineNumbers: editorStore.lineNumbers,
      wordWrap: editorStore.wordWrap,
      minimap: editorStore.minimap,
    })
  }, [isOpen])

  if (!isOpen) return null

  // ── Account handlers ──
  const handleSaveAccount = async () => {
    setIsSaving(true)
    setSaveMsg(null)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error()
      await supabase.auth.updateUser({ data: { full_name: fullName } })
      await supabase.from('users').update({ username }).eq('auth_id', user.id)
      setSaveMsg('Changes saved.')
    } catch {
      setSaveMsg('Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordMsg(null)
    if (newPassword !== retypePassword) {
      setPasswordMsg({ text: 'New passwords do not match.', ok: false }); return
    }
    if (newPassword.length < 6) {
      setPasswordMsg({ text: 'Password must be at least 6 characters.', ok: false }); return
    }
    setIsSavingPw(true)
    try {
      const { error: authErr } = await supabase.auth.signInWithPassword({ email, password: oldPassword })
      if (authErr) { setPasswordMsg({ text: 'Old password is incorrect.', ok: false }); return }
      const { error } = await supabase.auth.updateUser({ password: newPassword })
      if (error) throw error
      setPasswordMsg({ text: 'Password updated successfully.', ok: true })
      setOldPassword(''); setNewPassword(''); setRetypePassword('')
      setShowPasswordSection(false)
    } catch {
      setPasswordMsg({ text: 'Failed to update password.', ok: false })
    } finally {
      setIsSavingPw(false)
    }
  }

  const handleSaveEditor = () => {
    editorStore.setFontFamily(editorDraft.fontFamily)
    editorStore.setFontSize(editorDraft.fontSize)
    editorStore.setTabSize(editorDraft.tabSize)
    editorStore.setLineNumbers(editorDraft.lineNumbers)
    editorStore.setWordWrap(editorDraft.wordWrap)
    editorStore.setMinimap(editorDraft.minimap)
    setEditorSaved(true)
    setTimeout(() => setEditorSaved(false), 2000)
  }

  const handleDeleteAccount = async () => {
    if (!window.confirm('Delete your account permanently? All sessions and data will be lost. This cannot be undone.')) return
    await supabase.auth.signOut()
    close()
    window.location.href = '/signin'
  }

  const inputCls = `w-56 px-3 py-2 rounded-lg border text-sm outline-none focus:border-blue-500 transition
    ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`

  const initial = email ? email.charAt(0).toUpperCase() : '?'
  const border = isDark ? 'border-[#2a2a2a]' : 'border-gray-200'
  const bg = isDark ? 'bg-[#111]' : 'bg-white'
  const text = isDark ? 'text-white' : 'text-gray-900'
  const muted = isDark ? 'text-gray-400' : 'text-gray-500'
  const rowCls = `flex items-center justify-between py-4 border-b ${border}`

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={close} />

      <div className="fixed z-50 inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`relative flex w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden pointer-events-auto ${bg} ${border}`}
          style={{ maxHeight: '85vh', minHeight: 480 }}
        >

          {/* Left nav */}
          <div className={`w-48 flex flex-col flex-shrink-0 border-r ${border} ${isDark ? 'bg-[#0f0f0f]' : 'bg-gray-50'} p-4`}>
            <h2 className={`text-sm font-semibold mb-4 ${text}`}>Settings</h2>
            <nav className="flex-1 space-y-0.5">
              {NAV.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition text-left
                    ${activeTab === item.id
                      ? isDark ? 'bg-[#1a1a1a] text-white font-medium' : 'bg-white text-gray-900 font-medium shadow-sm'
                      : isDark ? `${muted} hover:bg-[#1a1a1a] hover:text-white` : `${muted} hover:bg-white hover:text-gray-900`
                    }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </nav>

            <button
              onClick={async () => { await supabase.auth.signOut(); close(); window.location.href = '/signin' }}
              className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-sm text-red-400 hover:bg-red-500/10 transition mt-2"
            >
              🚪 Sign out
            </button>
          </div>

          {/* Right content */}
          <div className="flex-1 overflow-y-auto p-6">
            <button
              onClick={close}
              className={`absolute top-4 right-4 w-7 h-7 flex items-center justify-center rounded-full text-sm transition ${isDark ? `${muted} hover:bg-[#2a2a2a]` : `${muted} hover:bg-gray-100`}`}
            >
              ✕
            </button>

            {/* ── ACCOUNT ── */}
            {activeTab === 'account' && (
              <div>
                <h3 className={`text-base font-semibold mb-0.5 ${text}`}>Account</h3>
                <p className={`text-xs mb-5 ${muted}`}>Manage your personal information.</p>

                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-xl font-semibold text-white flex-shrink-0">
                    {initial}
                  </div>
                  <p className={`text-xs ${muted}`}>JPG, PNG or GIF · max 2MB<br/>(Avatar upload coming soon)</p>
                </div>

                <div className={`${rowCls}`}>
                  <p className={`text-sm font-medium ${text}`}>Full name</p>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} placeholder="Your full name" />
                </div>

                <div className={`${rowCls}`}>
                  <div>
                    <p className={`text-sm font-medium ${text}`}>Username</p>
                    <p className={`text-xs ${muted}`}>Your public handle on FixIt.</p>
                  </div>
                  <input value={username} onChange={(e) => setUsername(e.target.value)} className={inputCls} placeholder="username" />
                </div>

                <div className={`${rowCls}`}>
                  <div>
                    <p className={`text-sm font-medium ${text}`}>Email address</p>
                    <p className={`text-xs ${muted}`}>Used for login and notifications.</p>
                  </div>
                  <input value={email} readOnly className={`${inputCls} opacity-60 cursor-not-allowed`} />
                </div>

                <div className={`py-4 border-b ${border} mb-5`}>
                  <div className="flex items-center justify-between">
                    <p className={`text-sm font-medium ${text}`}>Password</p>
                    <button
                      onClick={() => { setShowPasswordSection((v) => !v); setPasswordMsg(null) }}
                      className={`text-sm px-3 py-1.5 rounded-lg border transition ${isDark ? `border-[#2a2a2a] ${text} hover:bg-[#1a1a1a]` : `border-gray-300 ${text} hover:bg-gray-100`}`}
                    >
                      {showPasswordSection ? 'Cancel' : 'Change password'}
                    </button>
                  </div>
                  {showPasswordSection && (
                    <div className="mt-4 space-y-3">
                      {(['Old password', 'New password', 'Retype new password'] as const).map((ph, i) => (
                        <input
                          key={ph}
                          type="password"
                          placeholder={ph}
                          value={[oldPassword, newPassword, retypePassword][i]}
                          onChange={(e) => [setOldPassword, setNewPassword, setRetypePassword][i](e.target.value)}
                          className={`w-full px-3 py-2 rounded-lg border text-sm outline-none focus:border-blue-500 transition ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                        />
                      ))}
                      {passwordMsg && <p className={`text-xs ${passwordMsg.ok ? 'text-green-400' : 'text-red-400'}`}>{passwordMsg.text}</p>}
                      <button
                        onClick={handleChangePassword}
                        disabled={isSavingPw || !oldPassword || !newPassword || !retypePassword}
                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition"
                      >
                        {isSavingPw ? 'Saving…' : 'Update password'}
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={handleSaveAccount} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
                    {isSaving ? 'Saving…' : 'Save changes'}
                  </button>
                  {saveMsg && <p className={`text-xs ${muted}`}>{saveMsg}</p>}
                </div>
              </div>
            )}

            {/* ── APPEARANCE ── */}
            {activeTab === 'appearance' && (
              <div>
                <h3 className={`text-base font-semibold mb-0.5 ${text}`}>Appearance</h3>
                <p className={`text-xs mb-5 ${muted}`}>Customize how FixIt looks for you.</p>

                <div className={rowCls}>
                  <div>
                    <p className={`text-sm font-medium ${text}`}>Theme</p>
                    <p className={`text-xs ${muted}`}>Choose your preferred color scheme.</p>
                  </div>
                  <div className={`flex rounded-lg overflow-hidden border ${isDark ? 'border-[#2a2a2a]' : 'border-gray-300'}`}>
                    {(['light', 'dark', 'system'] as ThemeChoice[]).map((t) => (
                      <button
                        key={t}
                        onClick={() => setTheme(t)}
                        className={`px-3 py-1.5 text-sm transition capitalize ${theme === t ? 'bg-blue-600 text-white' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                      >
                        {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'} {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={rowCls}>
                  <div>
                    <p className={`text-sm font-medium ${text}`}>Accent color</p>
                    <p className={`text-xs ${muted}`}>Used for buttons and highlights.</p>
                  </div>
                  <div className="flex gap-2">
                    {(Object.keys(ACCENT_HEX) as AccentColor[]).map((id) => (
                      <button
                        key={id}
                        onClick={() => setAccent(id)}
                        style={{ background: ACCENT_HEX[id].base }}
                        className={`w-8 h-8 rounded-full transition ${accent === id ? 'ring-2 ring-offset-2 ring-offset-[#111] ring-white' : 'opacity-70 hover:opacity-100'}`}
                      />
                    ))}
                  </div>
                </div>

                <div className={`${rowCls} mb-5`}>
                  <div>
                    <p className={`text-sm font-medium ${text}`}>Density</p>
                    <p className={`text-xs ${muted}`}>Controls the spacing of UI elements.</p>
                  </div>
                  <select className={selectCls} defaultValue="comfortable">
                    <option value="compact">Compact</option>
                    <option value="comfortable">Comfortable</option>
                    <option value="spacious">Spacious</option>
                  </select>
                </div>

                <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
                  Save changes
                </button>
              </div>
            )}

            {/* ── NOTIFICATIONS ── */}
            {activeTab === 'notifications' && (
              <div>
                <h3 className={`text-base font-semibold mb-0.5 ${text}`}>Notifications</h3>
                <p className={`text-xs mb-5 ${muted}`}>Control what FixIt sends you.</p>

                {(
                  [
                    { key: 'sessionReminders', label: 'Session reminders', sub: "Get reminded if you haven't started a session today." },
                    { key: 'weeklyDigest', label: 'Weekly digest', sub: 'A summary of your progress every Monday.' },
                    { key: 'streakAlerts', label: 'Streak alerts', sub: 'Notify me before my streak is about to break.' },
                    { key: 'productUpdates', label: 'Product updates', sub: 'New features, improvements, and announcements.' },
                    { key: 'emailNotifications', label: 'Email notifications', sub: 'Receive all notifications via email as well.' },
                  ] as { key: keyof typeof notifs; label: string; sub: string }[]
                ).map(({ key, label, sub }) => (
                  <div key={key} className={rowCls}>
                    <div>
                      <p className={`text-sm font-medium ${text}`}>{label}</p>
                      <p className={`text-xs ${muted}`}>{sub}</p>
                    </div>
                    <Toggle on={notifs[key]} onChange={(v) => setNotifs((prev) => ({ ...prev, [key]: v }))} />
                  </div>
                ))}

                <div className="flex items-center gap-3 mt-5">
                  <button
                    onClick={() => { setNotifSaved(true); setTimeout(() => setNotifSaved(false), 2000) }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Save changes
                  </button>
                  {notifSaved && <p className={`text-xs ${muted}`}>Saved.</p>}
                </div>
              </div>
            )}

            {/* ── EDITOR ── */}
            {activeTab === 'editor' && (
              <div>
                <h3 className={`text-base font-semibold mb-0.5 ${text}`}>Editor</h3>
                <p className={`text-xs mb-5 ${muted}`}>Configure the code editor experience.</p>

                <div className={rowCls}>
                  <p className={`text-sm font-medium ${text}`}>Font family</p>
                  <select
                    className={selectCls}
                    value={editorDraft.fontFamily}
                    onChange={(e) => setEditorDraft((d) => ({ ...d, fontFamily: e.target.value }))}
                  >
                    {['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace'].map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>

                <div className={rowCls}>
                  <div>
                    <p className={`text-sm font-medium ${text}`}>Font size</p>
                    <p className={`text-xs ${muted}`}>Editor font size in pixels.</p>
                  </div>
                  <select
                    className={selectCls}
                    value={editorDraft.fontSize}
                    onChange={(e) => setEditorDraft((d) => ({ ...d, fontSize: Number(e.target.value) }))}
                  >
                    {[11, 12, 13, 14, 15, 16, 18].map((s) => (
                      <option key={s} value={s}>{s}px</option>
                    ))}
                  </select>
                </div>

                <div className={rowCls}>
                  <p className={`text-sm font-medium ${text}`}>Tab size</p>
                  <select
                    className={selectCls}
                    value={editorDraft.tabSize}
                    onChange={(e) => setEditorDraft((d) => ({ ...d, tabSize: Number(e.target.value) }))}
                  >
                    <option value={2}>2 spaces</option>
                    <option value={4}>4 spaces</option>
                    <option value={8}>8 spaces</option>
                  </select>
                </div>

                <div className={rowCls}>
                  <div>
                    <p className={`text-sm font-medium ${text}`}>Line numbers</p>
                    <p className={`text-xs ${muted}`}>Show line numbers in the editor gutter.</p>
                  </div>
                  <Toggle on={editorDraft.lineNumbers} onChange={(v) => setEditorDraft((d) => ({ ...d, lineNumbers: v }))} />
                </div>

                <div className={rowCls}>
                  <div>
                    <p className={`text-sm font-medium ${text}`}>Word wrap</p>
                    <p className={`text-xs ${muted}`}>Wrap long lines instead of scrolling horizontally.</p>
                  </div>
                  <Toggle on={editorDraft.wordWrap} onChange={(v) => setEditorDraft((d) => ({ ...d, wordWrap: v }))} />
                </div>

                <div className={`${rowCls} mb-5`}>
                  <div>
                    <p className={`text-sm font-medium ${text}`}>Minimap</p>
                    <p className={`text-xs ${muted}`}>Show a minimap overview on the right side.</p>
                  </div>
                  <Toggle on={editorDraft.minimap} onChange={(v) => setEditorDraft((d) => ({ ...d, minimap: v }))} />
                </div>

                <div className="flex items-center gap-3">
                  <button onClick={handleSaveEditor} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition">
                    Save changes
                  </button>
                  {editorSaved && <p className={`text-xs ${muted}`}>Saved — editor updated.</p>}
                </div>
              </div>
            )}

            {/* ── PRIVACY ── */}
            {activeTab === 'privacy' && (
              <div>
                <h3 className={`text-base font-semibold mb-0.5 ${text}`}>Privacy</h3>
                <p className={`text-xs mb-5 ${muted}`}>Manage your data and visibility settings.</p>

                {(
                  [
                    { key: 'publicProfile', label: 'Public profile', sub: 'Allow others to view your profile and stats.' },
                    { key: 'shareActivity', label: 'Share activity', sub: 'Include your sessions in anonymous usage analytics.' },
                    { key: 'usageAnalytics', label: 'Usage analytics', sub: 'Help improve FixIt by sending crash reports and usage data.' },
                  ] as { key: keyof typeof privacy; label: string; sub: string }[]
                ).map(({ key, label, sub }) => (
                  <div key={key} className={rowCls}>
                    <div>
                      <p className={`text-sm font-medium ${text}`}>{label}</p>
                      <p className={`text-xs ${muted}`}>{sub}</p>
                    </div>
                    <Toggle on={privacy[key]} onChange={(v) => setPrivacy((prev) => ({ ...prev, [key]: v }))} />
                  </div>
                ))}

                <div className="flex items-center gap-3 mt-5 mb-8">
                  <button
                    onClick={() => { setPrivacySaved(true); setTimeout(() => setPrivacySaved(false), 2000) }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition"
                  >
                    Save changes
                  </button>
                  {privacySaved && <p className={`text-xs ${muted}`}>Saved.</p>}
                </div>

                <div className={`border-t ${border} pt-5`}>
                  <p className={`text-sm font-semibold mb-1 ${text}`}>Danger zone</p>
                  <p className={`text-xs mb-4 ${muted}`}>These actions are permanent and cannot be undone.</p>
                  <div className="flex gap-3">
                    <button className={`text-sm px-4 py-2 rounded-lg border transition ${isDark ? `border-[#2a2a2a] ${text} hover:bg-[#1a1a1a]` : `border-gray-300 ${text} hover:bg-gray-100`}`}>
                      Export my data
                    </button>
                    <button
                      onClick={handleDeleteAccount}
                      className="text-sm px-4 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 transition"
                    >
                      Delete account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* ── BILLING ── */}
            {activeTab === 'billing' && (
              <div>
                <h3 className={`text-base font-semibold mb-0.5 ${text}`}>Billing</h3>
                <p className={`text-xs mb-5 ${muted}`}>Manage your plan and payment details.</p>

                {/* Current plan */}
                <div className={`rounded-xl border p-4 mb-5 flex items-center justify-between ${isDark ? 'border-[#2a2a2a] bg-[#0f0f0f]' : 'border-gray-200 bg-gray-50'}`}>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-semibold ${text}`}>Free plan</span>
                      <span className="text-xs bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded-full font-medium">Active</span>
                    </div>
                    <p className={`text-xs ${muted}`}>10 sessions/month · Community support · Core features</p>
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition">
                    Upgrade
                  </button>
                </div>

                {/* Plan cards */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { name: 'Pro', price: '$12', features: ['Unlimited sessions', 'AI hints', 'Priority support', 'Export history'] },
                    { name: 'Team', price: '$29', features: ['Everything in Pro', '5 seats', 'Shared sessions', 'Admin dashboard'] },
                  ].map((plan) => (
                    <div key={plan.name} className={`rounded-xl border p-4 ${isDark ? 'border-[#2a2a2a] bg-[#0f0f0f]' : 'border-gray-200 bg-gray-50'}`}>
                      <div className="flex items-baseline justify-between mb-3">
                        <span className={`text-xl font-bold ${text}`}>{plan.price}<span className={`text-xs font-normal ${muted}`}>/mo</span></span>
                        <span className={`text-sm font-semibold ${text}`}>{plan.name}</span>
                      </div>
                      <ul className="space-y-1.5">
                        {plan.features.map((f) => (
                          <li key={f} className={`flex items-center gap-2 text-xs ${muted}`}>
                            <span className="text-blue-400">✓</span>{f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className={`${rowCls}`}>
                  <div>
                    <p className={`text-sm font-medium text-red-400`}>Payment method</p>
                    <p className={`text-xs ${muted}`}>No payment method on file.</p>
                  </div>
                  <button className={`text-sm px-3 py-1.5 rounded-lg border transition ${isDark ? `border-[#2a2a2a] ${text} hover:bg-[#1a1a1a]` : `border-gray-300 ${text} hover:bg-gray-100`}`}>
                    Add card
                  </button>
                </div>

                <div className={`${rowCls}`}>
                  <div>
                    <p className={`text-sm font-medium text-red-400`}>Billing email</p>
                    <p className={`text-xs ${muted}`}>Invoices will be sent here.</p>
                  </div>
                  <input
                    defaultValue={email}
                    className={`w-48 px-3 py-2 rounded-lg border text-sm outline-none focus:border-blue-500 transition ${isDark ? 'bg-[#1a1a1a] border-[#2a2a2a] text-white' : 'bg-gray-50 border-gray-300 text-gray-900'}`}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
