import type { SandboxResponse } from "../types";
import { useThemeStore } from "../store/themeStore";

interface ConceptCardProps {
  sandbox: SandboxResponse;
  onLearnMore: () => void;
}

const difficultyColor = {
  beginner: "text-green-400 bg-green-400/10",
  intermediate: "text-yellow-400 bg-yellow-400/10",
  advanced: "text-red-400 bg-red-400/10",
};

export default function ConceptCard({ sandbox, onLearnMore }: ConceptCardProps) {
  const { isDark } = useThemeStore();

  return (
    <div
      className={`flex items-center justify-between px-3 md:px-6 py-2.5 border-b gap-2 ${
        isDark ? "border-[#1e1e1e] bg-[#111]" : "border-gray-200 bg-white"
      }`}
    >
      {/* Left: concept info */}
      <div className="flex items-center gap-2 min-w-0 flex-wrap">
        <span className={`text-sm font-medium truncate ${isDark ? "text-white" : "text-gray-900"}`}>
          {sandbox.concept}
        </span>

        <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${difficultyColor[sandbox.difficulty]}`}>
          {sandbox.difficulty}
        </span>

        <span className={`text-xs flex-shrink-0 hidden sm:inline ${isDark ? "text-gray-400" : "text-gray-500"}`}>
          {sandbox.estimatedMinutes} min
        </span>

        {/* Skill tags — hidden on mobile to save space */}
        {sandbox.skills?.map((skill) => (
          <span
            key={skill}
            className={`hidden md:inline text-xs px-2 py-0.5 rounded border ${
              isDark ? "text-gray-300 bg-[#1a1a1a] border-gray-600" : "text-gray-700 bg-gray-100 border-gray-300"
            }`}
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Learn More — always visible */}
      <button
        onClick={onLearnMore}
        className={`flex items-center gap-1 text-xs transition border px-2.5 py-1 rounded-lg flex-shrink-0 ${
          isDark
            ? "text-blue-400 hover:text-blue-300 border-blue-500/30"
            : "text-blue-600 hover:text-blue-700 border-blue-300"
        }`}
      >
        <span>?</span>
        <span className="hidden sm:inline">Learn More</span>
      </button>
    </div>
  );
}
