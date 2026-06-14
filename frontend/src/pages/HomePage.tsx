import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'

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

  const handleGenerate = () => {
    if (!input.trim()) return
    navigate('/playground', { state: { userInput: input } })
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
    <div className="flex flex-col items-center justify-center h-full px-8">

      {/* Heading */}
      <h1 className="text-white text-4xl font-bold text-center mb-3">
        What are you trying to understand today?
      </h1>
      <p className="text-gray-500 text-center mb-8">
        Paste an error, describe a bug, or ask how something works
      </p>

      {/* Input Area */}
      <div className="w-full max-w-3xl">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g. TypeError: Cannot read properties of undefined..."
          className="w-full h-36 bg-[#1a1a1a] border border-[#2a2a2a] focus:border-blue-500 text-white placeholder-gray-600 rounded-xl px-5 py-4 text-sm font-mono resize-none focus:outline-none transition"
        />

        {/* Example Chips */}
        <div className="flex flex-wrap gap-2 mt-3">
          {exampleChips.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipClick(chip)}
              className="px-3 py-1.5 rounded-full border border-[#2a2a2a] text-gray-400 hover:text-white hover:border-[#3a3a3a] text-xs transition"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!input.trim()}
          className="w-full mt-4 flex items-center justify-center gap-2 bg-[#1a1a1a] hover:bg-[#222] disabled:opacity-40 border border-[#2a2a2a] text-gray-300 py-3 rounded-xl transition"
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