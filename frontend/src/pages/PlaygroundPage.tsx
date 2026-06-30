import { useState, useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { SandboxResponse } from '../types'
import { generateSandbox, retryQuiz } from '../services/sandbox.service'
import { createSession, updateSession, updateSandbox as persistSandbox, submitAttempt, getSessionDetail, sandboxRowToResponse } from '../services/session.service'
import AppLayout from '../components/layout/AppLayout'
import { useThemeStore } from '../store/themeStore'
import ConceptCard from './ConceptCard'
import CodeEditor from './CodeEditor'
import HintsPanel from './HintsPanel'
import ConceptDrawer from './ConceptDrawer'

export default function PlaygroundPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const userInput = location.state?.userInput as string
    const resumedSessionId = location.state?.sessionId as string | undefined
    const { isDark } = useThemeStore()
    const [sandbox, setSandbox] = useState<SandboxResponse | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [userCode, setUserCode] = useState('')
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)
    const [isSolved, setIsSolved] = useState(false)
    const [showQuiz, setShowQuiz] = useState(false)
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
    const [showSolution, setShowSolution] = useState(false)
    const [leftWidth, setLeftWidth] = useState(70)
    const [isDragging, setIsDragging] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(resumedSessionId ?? null)
    const [isQuizCorrect, setIsQuizCorrect] = useState<boolean | null>(null)
    const [isRetryingQuiz, setIsRetryingQuiz] = useState(false)
    // Tracks which navigation (session id, or a fresh prompt) this component last loaded.
    // The same /playground route instance is reused across sidebar clicks (no remount),
    // so without this every other session would keep showing the first one's content.
    // Comparing against the key also absorbs React StrictMode's double-invoke in dev,
    // which would otherwise call fetchSandbox twice and create two sessions per prompt.
    const loadedKeyRef = useRef<string | null>(null)

    useEffect(() => {
        if (!userInput && !resumedSessionId) {
      navigate('/home')
      return
    }
    const key = resumedSessionId ?? `new:${userInput}`
    if (loadedKeyRef.current === key) return
    loadedKeyRef.current = key

    if (resumedSessionId) {
      resumeSession(resumedSessionId)
      return
    }
    fetchSandbox()
    }, [resumedSessionId, userInput])

    const resetQuizState = () => {
      setSelectedAnswer(null)
      setIsQuizCorrect(null)
      setShowSolution(false)
      setIsSolved(false)
      setShowQuiz(false)
    }

    const resumeSession = async (id: string) => {
    try {
      setIsLoading(true)
      setError(null)
      resetQuizState()
      const { session, sandbox: sandboxRow } = await getSessionDetail(id)
      const data = sandboxRowToResponse(sandboxRow, session.title)
      setSandbox(data)
      setSessionId(session.id)
      setUserCode(sandboxRow.current_code || sandboxRow.broken_code)
      if (sandboxRow.progress >= 50) {
        setIsSolved(true)
        setShowQuiz(true)
      }
      if (sandboxRow.is_solved) {
        setSelectedAnswer(sandboxRow.quiz_correct_index)
        setIsQuizCorrect(true)
      }
    } catch {
      setError('Failed to load session. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoHome = async () => {
    if (sessionId) {
      try {
        await persistSandbox(sessionId, { currentCode: userCode })
      } catch {
        // best-effort save — don't block navigation on it
      }
    }
    navigate('/home')
  }

    useEffect(() => {
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return

    const newWidth =
      (e.clientX / window.innerWidth) * 100

    if (newWidth > 40 && newWidth < 85) {
      setLeftWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
  }
}, [isDragging])

useEffect(() => {
  if (isDragging) {
    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'col-resize'
  } else {
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }

  return () => {
    document.body.style.userSelect = ''
    document.body.style.cursor = ''
  }
}, [isDragging])

    const fetchSandbox = async () => {
    try {
      setIsLoading(true)
      setError(null)
      resetQuizState()
      setSessionId(null)
      const data = await generateSandbox(userInput)
      setSandbox(data)
      setUserCode(data.brokenCode)
      const { session } = await createSession(data.title, userInput, data)
      setSessionId(session.id)
    } catch (err) {
      setError('Failed to generate sandbox. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    setIsSolved(true)
    setShowQuiz(true)
    if (sessionId) persistSandbox(sessionId, { progress: 50 }).catch(() => {})
  }

  const handleAnswerSelect = async (index: number) => {
    if (!sandbox || selectedAnswer !== null) return
    setSelectedAnswer(index)
    const correct = index === sandbox.quizCorrectIndex
    setIsQuizCorrect(correct)

    if (sessionId) {
      submitAttempt(sessionId, userCode, correct).catch(() => {})
      if (correct) {
        updateSession(sessionId, { status: 'completed' }).catch(() => {})
        persistSandbox(sessionId, { isSolved: true, progress: 100 }).catch(() => {})
      } else {
        persistSandbox(sessionId, { progress: 75 }).catch(() => {})
      }
    }
  }

  const handleRetryQuiz = async () => {
    if (!sandbox) return
    try {
      setIsRetryingQuiz(true)
      const newQuiz = await retryQuiz(sandbox.concept, sandbox.quizQuestion)
      const updatedSandbox = { ...sandbox, ...newQuiz }
      setSandbox(updatedSandbox)
      setSelectedAnswer(null)
      setIsQuizCorrect(null)
      if (sessionId) persistSandbox(sessionId, newQuiz).catch(() => {})
    } catch {
      setError('Failed to generate a new question. Please try again.')
    } finally {
      setIsRetryingQuiz(false)
    }
  }

  if (isLoading) {
    return (
        <AppLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 text-sm">Generating your sandbox...</p>
        </div>
      </AppLayout>
    )
  }
  if (error) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center h-full gap-4">
          <p className="text-red-400">{error}</p>
          <button
            onClick={() => (resumedSessionId ? resumeSession(resumedSessionId) : fetchSandbox())}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      </AppLayout>
    )
  }
  if (!sandbox) return null
  return (
    <AppLayout>
      <div className="flex flex-col h-full">

        {/* Top Bar */}
        <div className={`flex items-center justify-between px-6 py-3 border-b ${
  isDark ? 'border-gray-500' : 'border-gray-200'
}`}>
          <span className={`text-sm font-mono ${
    isDark ? 'text-gray-200' : 'text-gray-800'
  }`}>{userInput}</span>
          <div className="flex items-center gap-4">
            <button
              onClick={handleGoHome}
              className={`flex items-center gap-1 text-sm font-bold transition ${
  isDark
    ? 'text-gray-400 hover:text-white'
    : 'text-gray-700 hover:text-gray-900'
}`}
            >
              🏠 Home
            </button>
            <button
              onClick={handleGoHome}
              className={`flex items-center gap-1 text-sm font-bold transition ${
  isDark
    ? 'text-gray-400 hover:text-white'
    : 'text-gray-700 hover:text-gray-900'
}`}
            >
              ✏️ Edit
            </button>
          </div>
        </div>

        {/* Concept Card — always visible */}
        <div
  className={`border-b ${
    isDark ? 'border-gray-500' : 'border-gray-200'
  }`}
>
        <ConceptCard
          sandbox={sandbox}
          onLearnMore={() => setIsDrawerOpen(true)}
        />
        </div>

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left — Code Editor */}
          <div className="flex flex-col overflow-hidden" style={{ width: `${leftWidth}%` }}>

            {/* Editor Header */}
            <div className={`flex items-center justify-between px-4 py-2 border-b ${
  isDark ? 'border-[#1e1e1e]' : 'border-gray-200 bg-gray-50'
}`}>
              <span className={`text-sm font-mono uppercase ${
    isDark ? 'text-gray-300' : 'text-gray-800'
  }`}>
                {sandbox.language}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(userCode)}
                className={`text-xs transition ${
  isDark
    ? 'text-gray-300 hover:text-white'
    : 'text-gray-700 hover:text-gray-900'
}`}
              >
                Copy
              </button>
            </div>

            {/* Monaco Editor */}
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                value={userCode}
                language={sandbox.language}
                onChange={(val) => setUserCode(val || '')}
              />
            </div>

            {/* Task Card */}
            {!showQuiz && (
              <div className={`m-4 p-4 border rounded-xl ${
  isDark
    ? 'border-blue-500/30 bg-blue-500/5'
    : 'border-blue-200 bg-blue-50'
}`}>
                <p className="text-blue-400 text-sm font-semibold mb-1">
                  📌 Your task
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{sandbox.task}</p>
              </div>
            )}

            {/* Quiz Section */}
            {showQuiz && (
              <div className={`m-4 p-4 border rounded-xl ${
  isDark
    ? 'border-purple-500/30 bg-purple-500/5'
    : 'border-purple-200 bg-purple-50'
}`}>
                <p className="text-purple-400 text-xs font-semibold mb-3">
                  ✅ Nice fix! Quick check:
                </p>
                <p className={`text-sm mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {sandbox.quizQuestion}
                </p>
                <div className="space-y-2">
                  {sandbox.quizOptions.map((option, index) => (
                    <button
                      key={index}
                      onClick={() => handleAnswerSelect(index)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition border
                        ${selectedAnswer === null
                          ? isDark
    ? 'border-[#2a2a2a] text-gray-300 hover:border-blue-500'
    : 'border-gray-300 text-gray-700 hover:border-blue-500 bg-white'
                          : selectedAnswer === index
                            ? index === sandbox.quizCorrectIndex
                              ? 'border-green-500 bg-green-500/10 text-green-400'
                              : 'border-red-500 bg-red-500/10 text-red-400'
                            : index === sandbox.quizCorrectIndex && selectedAnswer !== null
                              ? 'border-green-500 bg-green-500/10 text-green-400'
                              : 'border-[#2a2a2a] text-gray-500'
                        }`}
                    >
                      {String.fromCharCode(65 + index)}. {option}
                    </button>
                  ))}
                </div>

                {selectedAnswer !== null && isQuizCorrect === false && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-red-400 text-xs">Not quite — want another shot?</span>
                    <button
                      onClick={handleRetryQuiz}
                      disabled={isRetryingQuiz}
                      className="text-xs font-semibold text-purple-400 hover:text-purple-300 disabled:opacity-50 transition"
                    >
                      {isRetryingQuiz ? 'Loading new question…' : 'Try a different question →'}
                    </button>
                  </div>
                )}

                {selectedAnswer !== null && isQuizCorrect === true && (
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-green-400 text-xs">Nailed it! 🎉</span>
                    <button
                      onClick={handleGoHome}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 transition"
                    >
                      🏠 Home
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Bottom Actions */}
            <div className={`flex items-center justify-between px-4 py-3 border-t ${
  isDark ? 'border-[#1e1e1e]' : 'border-gray-200'
}`}>
              <button
                onClick={handleSubmit}
                disabled={isSolved}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-lg text-sm font-semibold transition"
              >
                {isSolved ? '✅ Submitted' : 'Submit Fix'}
              </button>
              {!showSolution && (
                <button
                  onClick={() => setShowSolution(true)}
                  className={`text-sm transition ${
  isDark
    ? 'text-gray-300 hover:text-white'
    : 'text-gray-700 hover:text-gray-900'
}`}
                >
                  I give up, show solution
                </button>
              )}
              {showSolution && (
                <span className="text-yellow-500 text-xs">
                  Solution revealed in Hints tab
                </span>
              )}
            </div>

          </div>

          <div
  onMouseDown={() => setIsDragging(true)}
  className="
    w-2
    relative
    cursor-col-resize
    hover:bg-blue-500/10
    transition
    flex-shrink-0
  "
>
  <div
    className="
      absolute
      left-1/2
      top-0
      -translate-x-1/2
      h-full
      w-[1px]
      bg-[#2a2a2a]
    "
  />
</div>

          {/* Right — Hints Panel */}
          <div
  style={{
    width: `${100 - leftWidth}%`,
  }}
  className="overflow-hidden"
>
  <HintsPanel
    hints={sandbox.hints}
    explanation={sandbox.conceptOverview}
    solutionCode={sandbox.solutionCode}
    showSolution={showSolution}
    language={sandbox.language}
    onUseSolution={() => setUserCode(sandbox.solutionCode)}
  />
</div>

        </div>

        {/* Concept Drawer */}
        <ConceptDrawer
          sandbox={sandbox}
          isOpen={isDrawerOpen}
          onClose={() => setIsDrawerOpen(false)}
        />

      </div>
    </AppLayout>
  )
}
