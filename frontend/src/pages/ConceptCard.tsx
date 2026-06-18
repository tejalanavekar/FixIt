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
      className={`flex items-center justify-between px-6 py-3 border-b ${
        isDark
          ? "border-[#1e1e1e] bg-[#111]"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`text-sm font-medium ${
            isDark ? "text-white" : "text-gray-900"
          }`}
        >
          {sandbox.concept}
        </span>

        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            difficultyColor[sandbox.difficulty]
          }`}
        >
          {sandbox.difficulty}
        </span>

        <span className={`text-xs ${isDark ? "text-gray-300" : "text-gray-600"}`}>
          {sandbox.estimatedMinutes} min
        </span>

        <div className="flex gap-1">
          {sandbox.skills &&
            sandbox.skills.map((skill) => (
              <span
                key={skill}
                className={`text-xs px-2 py-0.5 rounded border ${
                  isDark
                    ? "text-gray-300 bg-[#1a1a1a] border-gray-500"
                    : "text-gray-700 bg-gray-100 border-gray-300"
                }`}
              >
                {skill}
              </span>
            ))}
        </div>
      </div>

      <button
        onClick={onLearnMore}
        className={`flex items-center gap-1 text-xs transition border px-3 py-1 rounded-lg ${
          isDark
            ? "text-blue-400 hover:text-blue-300 border-blue-500/30"
            : "text-blue-600 hover:text-blue-700 border-blue-300"
        }`}
      >
        <span>?</span>
        <span>Learn More</span>
      </button>
    </div>
  );
}