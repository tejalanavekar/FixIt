import type { SandboxResponse } from "../types";
interface ConceptCardProps {
  sandbox: SandboxResponse
  onLearnMore: () => void
}

const difficultyColor = {
    beginner: 'text-green-400 bg-green-400/10',
    intermediate: 'text-yellow-400 bg-yellow-400/10',
    advanced: 'text-red-400 bg-red-400/10'
}

export default function ConceptCard({ sandbox, onLearnMore} : ConceptCardProps) {
    return (
    <div className="flex items-center justify-between px-6 py-3 border-b border-[#1e1e1e] bg-[#111]">
      
      <div className="flex items-center gap-3">
        {/* Concept name */}
        <span className="text-white text-sm font-medium">
          {sandbox.concept}
        </span>

        {/* Difficulty badge */}
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${difficultyColor[sandbox.difficulty]}`}>
          {sandbox.difficulty}
        </span>

        {/* Time */}
        <span className="text-gray-500 text-xs">
          {sandbox.estimatedMinutes} min
        </span>

        {/* Skills */}
        <div className="flex gap-1">
          {sandbox.skills && sandbox.skills.map((skill) => (
            <span
              key={skill}
              className="text-xs text-gray-500 bg-[#1a1a1a] border border-[#2a2a2a] px-2 py-0.5 rounded"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Learn More button */}
      <button
        onClick={onLearnMore}
        className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs transition border border-blue-500/30 px-3 py-1 rounded-lg"
      >
        <span>?</span>
        <span>Learn More</span>
      </button>

    </div>
  )
}