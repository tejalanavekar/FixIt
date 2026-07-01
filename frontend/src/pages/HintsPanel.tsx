import { useState } from "react";
import { useThemeStore } from "../store/themeStore";
import { Lock, Eye, AlertTriangle, ClipboardCopy, Check } from 'lucide-react';

interface HintsPanelProps {
  hints: string[];
  explanation: string;
  solutionCode: string;
  showSolution: boolean;
  language: string;
  onUseSolution: () => void;
}

type Tab = "hints" | "explanation" | "solution";

export default function HintsPanel({
  hints,
  explanation,
  solutionCode,
  showSolution,
  onUseSolution,
}: HintsPanelProps) {
  const { isDark } = useThemeStore();

  const [activeTab, setActiveTab] = useState<Tab>("hints");
  const [revealedHints, setRevealedHints] = useState<number[]>([]);
  const [justCopied, setJustCopied] = useState(false);

  const handleUseSolution = () => {
    onUseSolution();
    setJustCopied(true);
    setTimeout(() => setJustCopied(false), 1500);
  };

  const revealHint = (index: number) => {
    if (!revealedHints.includes(index)) {
      setRevealedHints([...revealedHints, index]);
    }
  };

  return (
    <div
      className={`h-full border-l flex flex-col ${
        isDark
          ? "border-[#1e1e1e] bg-[#111]"
          : "border-gray-200 bg-white"
      }`}
    >
      <div
        className={`flex border-b ${
          isDark ? "border-[#1e1e1e]" : "border-gray-200"
        }`}
      >
        {(["hints", "explanation", "solution"] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            disabled={tab === "solution" && !showSolution}
            className={`flex-1 py-3 text-sm font-medium capitalize transition
              ${
                activeTab === tab
                  ? "text-blue-500 border-b-2 border-blue-500"
                  : isDark
                  ? "text-gray-400 hover:text-gray-300"
                  : "text-gray-500 hover:text-gray-700"
              }
              ${
                tab === "solution" && !showSolution
                  ? "opacity-40 cursor-not-allowed"
                  : ""
              }
            `}
          >
            {tab === "solution" && !showSolution ? <><Lock size={13} className="inline-block" />{' '}</> : null}
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "hints" && (
          <div className="space-y-3">
            <p
              className={`text-xs mb-4 ${
                isDark ? "text-gray-400" : "text-gray-600"
              }`}
            >
              Reveal hints one by one when you're stuck.
            </p>

            {hints.map((hint, index) => (
              <div
                key={index}
                className={`border rounded-lg p-3 ${
                  isDark
                    ? "border-[#2a2a2a] bg-transparent"
                    : "border-gray-300 bg-white"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className={`text-sm font-medium ${
                      isDark ? "text-gray-400" : "text-gray-700"
                    }`}
                  >
                    Hint {index + 1}
                  </span>

                  {!revealedHints.includes(index) && (
                    <button
                      onClick={() => revealHint(index)}
                      className={`text-sm transition ${
                        isDark
                          ? "text-blue-300 hover:text-blue-200"
                          : "text-blue-600 hover:text-blue-700"
                      }`}
                    >
                      <Eye size={14} /> Reveal
                    </button>
                  )}
                </div>

                {revealedHints.includes(index) ? (
                  <p
                    className={`text-sm leading-relaxed ${
                      isDark ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    {hint}
                  </p>
                ) : (
                  <div className="space-y-1">
                    <div
                      className={`h-2 rounded blur-sm ${
                        isDark ? "bg-[#2a2a2a]" : "bg-gray-300"
                      }`}
                    />
                    <div
                      className={`h-2 rounded blur-sm w-3/4 ${
                        isDark ? "bg-[#2a2a2a]" : "bg-gray-300"
                      }`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === "explanation" && (
          <p
            className={`text-sm leading-relaxed ${
              isDark ? "text-gray-300" : "text-gray-700"
            }`}
          >
            {explanation}
          </p>
        )}

        {activeTab === "solution" && showSolution && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-yellow-500 text-sm">
                <AlertTriangle size={14} className="inline-block mr-1" /> Try to solve it yourself first!
              </p>
              <button
                onClick={handleUseSolution}
                className={`text-xs font-semibold px-2 py-1 rounded transition ${
                  isDark
                    ? "text-blue-300 hover:bg-[#2a2a2a]"
                    : "text-blue-600 hover:bg-gray-100"
                }`}
              >
                {justCopied ? <Check size={14} /> : <ClipboardCopy size={14} />} {justCopied ? "Added to editor" : "Use this code"}
              </button>
            </div>

            <pre
              className={`text-sm font-mono p-3 rounded-lg overflow-x-auto whitespace-pre-wrap ${
                isDark
                  ? "bg-[#1a1a1a] text-green-300"
                  : "bg-gray-100 text-green-700"
              }`}
            >
              {solutionCode}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}