import type { SandboxResponse } from "../types"

interface ConceptDrawerProps {
  sandbox: SandboxResponse
  isOpen: boolean
  onClose: () => void
}

export default function ConceptDrawer({ sandbox, isOpen, onClose }: ConceptDrawerProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-96 bg-[#111] border-l border-[#1e1e1e] z-50 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#1e1e1e]">
          <h2 className="text-white font-semibold">{sandbox.concept}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition text-xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Overview */}
          <div>
            <h3 className="text-blue-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Overview
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {sandbox.conceptOverview}
            </p>
          </div>

          {/* Real World Analogy */}
          <div>
            <h3 className="text-purple-400 text-xs font-semibold uppercase tracking-wider mb-2">
              Real World Analogy
            </h3>
            <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-4">
              <p className="text-gray-300 text-sm leading-relaxed">
                {sandbox.realWorldAnalogy}
              </p>
            </div>
          </div>

          {/* Request Flow */}
          <div>
            <h3 className="text-green-400 text-xs font-semibold uppercase tracking-wider mb-2">
              How It Works
            </h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {sandbox.requestFlow}
            </p>
          </div>

          {/* Syntax Breakdown */}
          <div>
            <h3 className="text-yellow-400 text-xs font-semibold uppercase tracking-wider mb-3">
              Syntax Breakdown
            </h3>
            <div className="space-y-3">
              {sandbox.syntaxBreakdown.map((item, index) => (
                <div
                  key={index}
                  className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-3"
                >
                  <code className="text-blue-300 text-xs font-mono block mb-1">
                    {item.syntax}
                  </code>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    {item.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </>
  )
}