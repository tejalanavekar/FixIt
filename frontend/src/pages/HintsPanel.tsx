import { useState } from "react";

//interface -> to define the shape of the object 
interface HintsPanelProps {
  hints: string[]
  explanation: string
  solutionCode: string
  showSolution: boolean
  language: string
}

type Tab = 'hints' | 'explanation' | 'solution'

export default function HintsPanel({hints, explanation, solutionCode, showSolution, language}: HintsPanelProps){
    const [activeTab, setActiveTab] = useState<Tab>('hints')
  const [revealedHints, setRevealedHints] = useState<number[]>([])

  const revealHint = (index: number) => {
    if (!revealedHints.includes(index)) {
      setRevealedHints([...revealedHints, index])
    }
  }

  return (
    <div className="w-80 border-l border-[#1e1e1e] flex flex-col">

      {/* Tabs */}
      <div className="flex border-b border-[#1e1e1e]">
        {(['hints', 'explanation', 'solution'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={tab === 'solution' && !showSolution}
            className={`flex-1 py-3 text-xs font-medium capitalize transition
              ${activeTab === tab
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-500 hover:text-gray-300'
              }
              ${tab === 'solution' && !showSolution ? 'opacity-40 cursor-not-allowed' : ''}
            `}
          >
            {tab === 'solution' && !showSolution ? '🔒 ' : ''}
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4">

        {/* Hints Tab */}
        {activeTab === 'hints' && (
          <div className="space-y-3">
            <p className="text-gray-500 text-xs mb-4">
              Reveal hints one by one when you're stuck.
            </p>
            {hints.map((hint: string, index: number) => (
              <div
                key={index}
                className="border border-[#2a2a2a] rounded-lg p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-xs font-medium">
                    Hint {index + 1}
                  </span>
                  {!revealedHints.includes(index) && (
                    <button
                      onClick={() => revealHint(index)}
                      className="text-blue-400 text-xs hover:text-blue-300 transition"
                    >
                      👁 Reveal
                    </button>
                  )}
                </div>
                {revealedHints.includes(index) ? (
                  <p className="text-gray-300 text-xs leading-relaxed">
                    {hint}
                  </p>
                ) : (
                  <div className="space-y-1">
                    <div className="h-2 bg-[#2a2a2a] rounded blur-sm" />
                    <div className="h-2 bg-[#2a2a2a] rounded blur-sm w-3/4" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Explanation Tab */}
        {activeTab === 'explanation' && (
          <div>
            <p className="text-gray-300 text-sm leading-relaxed">
              {explanation}
            </p>
          </div>
        )}

        {/* Solution Tab */}
        {activeTab === 'solution' && showSolution && (
          <div>
            <p className="text-yellow-400 text-xs mb-3">
              ⚠️ Try to solve it yourself first!
            </p>
            <pre className="text-green-300 text-xs font-mono bg-[#1a1a1a] p-3 rounded-lg overflow-x-auto whitespace-pre-wrap">
              {solutionCode}
            </pre>
          </div>
        )}

      </div>
    </div>
  )
}
