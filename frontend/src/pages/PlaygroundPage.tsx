import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { SandboxResponse } from '../types'
import { generateSandbox } from '../services/sandbox.service'
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

    useEffect(() => {
        if (!userInput) {
      navigate('/home')
      return
    }
    fetchSandbox()
    }, [])

    const fetchSandbox = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await generateSandbox(userInput)
      setSandbox(data)
      setUserCode(data.brokenCode)
    } catch (err) {
      setError('Failed to generate sandbox. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = () => {
    setIsSolved(true)
    setShowQuiz(true)
  }
  const handleAnswerSelect = (index: number) => {
    setSelectedAnswer(index)
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
            onClick={fetchSandbox}
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
  isDark ? 'border-[#1e1e1e]' : 'border-gray-200'
}`}>
          <span className={`text-sm font-mono ${
    isDark ? 'text-gray-400' : 'text-gray-600'
  }`}>{userInput}</span>
          <button
            onClick={() => navigate('/home')}
            className="flex items-center gap-1 text-gray-400 hover:text-white text-sm transition"
          >
            ✏️ Edit
          </button>
        </div>

        {/* Concept Card — always visible */}
        <ConceptCard
          sandbox={sandbox}
          onLearnMore={() => setIsDrawerOpen(true)}
        />

        {/* Main Content */}
        <div className="flex flex-1 overflow-hidden">

          {/* Left — Code Editor */}
          <div className="flex flex-col flex-1 overflow-hidden">

            {/* Editor Header */}
            <div className={`flex items-center justify-between px-4 py-2 border-b ${
  isDark ? 'border-[#1e1e1e]' : 'border-gray-200 bg-gray-50'
}`}>
              <span className={`text-xs font-mono uppercase ${
    isDark ? 'text-gray-500' : 'text-gray-400'
  }`}>
                {sandbox.language}
              </span>
              <button
                onClick={() => navigator.clipboard.writeText(userCode)}
                className="text-gray-500 hover:text-white text-xs transition"
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
                <p className="text-blue-400 text-xs font-semibold mb-1">
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
                          ? 'border-[#2a2a2a] text-gray-300 hover:border-blue-500'
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
                  className="text-gray-500 hover:text-gray-400 text-sm transition"
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

          {/* Right — Hints Panel */}
          <HintsPanel
            hints={sandbox.hints}
            explanation={sandbox.conceptOverview}
            solutionCode={sandbox.solutionCode}
            showSolution={showSolution}
            language={sandbox.language}
          />

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
