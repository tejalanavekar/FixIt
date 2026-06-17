import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { useThemeStore } from '../store/themeStore'

const exampleChips = [
  'CORS blocked by policy',
  'How does JWT work',
  'SQL LEFT JOIN',
  'TypeScript generic error',
  'React useEffect loop',
  'Promise.all vs allSettled',
]

export default function HomePage() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')
  const { isDark } = useThemeStore()



  const handleGenerate = async () => {
  if (!input.trim()) return

  navigate('/playground', {
    state: {
      userInput: input,
    },
  })
}

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleGenerate()
    }
  }

  const handleChipClick = (chip: string) => {
    setInput(chip)
  }

  return (
    <AppLayout>
      
    <div className={`flex flex-col items-center justify-center h-full px-8 ${isDark ? 'bg-[#0f0f0f]' : 'bg-[#f0f0f0]'}`}>

      {/* Heading */}
      <h1 className={`text-4xl text-center mb-3 ${isDark ? 'text-white' : 'text-black'}`}>
        What are you trying to understand today?
      </h1>
      <p className={`text-center mb-8 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
        Paste an error, describe a bug, or ask how something works
      </p>

      {/* Input Area */}
      <div className="w-full max-w-3xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. TypeError: Cannot read properties of undefined..."
          className={`w-full h-36 border rounded-xl px-5 py-4 text-sm font-mono resize-none focus:outline-none focus:border-blue-500 transition
            ${isDark
              ? 'bg-[#1a1a1a] border-gray-500 text-white placeholder-gray-300'
              : 'bg-white border-gray-600 text-black placeholder-gray-400'
            }`}
        />

        {/* Example Chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {exampleChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className={`px-3 py-1.5 rounded-full border text-xs transition
                ${isDark
                  ? 'border-[#2a2a2a] text-gray-300 hover:text-white hover:border-[#3a3a3a]'
                  : 'border-gray-600 text-black hover:text-black hover:border-gray-400'
                }`}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!input.trim()}
          className={`w-full mt-4 flex items-center justify-center gap-2 border py-3 rounded-xl transition disabled:opacity-40 ${
  isDark
    ? 'bg-blue-600 hover:bg-[#222] border-gray-500 text-white'
    : 'bg-blue-600 hover:bg-gray-50 border-gray-200 text-white'
}`}
        >
          <span>⚡</span>
          <span>Generate Sandbox</span>
          <span>→</span>
        </button>

      </div>

    </div>
    </AppLayout>
  )
}

