import { useState, useCallback } from "react";
import type { Question, ParseError } from "../types";

interface QuizSetupProps {
  questions: Question[];
  title: string;
  warnings?: ParseError[];
  onStart: (timerSetting: number | null) => void;
  onBack: () => void;
}

const TIMER_PRESETS = [
  { label: "Off", value: null },
  { label: "15s", value: 15 },
  { label: "30s", value: 30 },
  { label: "60s", value: 60 },
  { label: "Custom", value: -1 },
] as const;

export function QuizSetup({ questions, title, warnings, onStart, onBack }: QuizSetupProps) {
  const [selectedPreset, setSelectedPreset] = useState<number | null>(30);
  const [customSeconds, setCustomSeconds] = useState(45);
  const isCustom = selectedPreset === -1;
  const effectiveTimer = isCustom ? customSeconds : selectedPreset;

  const handleStart = useCallback(() => {
    onStart(effectiveTimer);
  }, [effectiveTimer, onStart]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-scale-in">
        {/* Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/15 mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-text mb-1">
              Ready to begin?
            </h2>
            <p className="text-sm text-text-muted truncate">{title}</p>
          </div>

          {/* Quiz info */}
          <div className="flex items-center justify-center gap-6 mb-8">
            <div className="text-center">
              <span className="block text-2xl font-bold text-primary">
                {questions.length}
              </span>
              <span className="text-xs text-text-muted">Questions</span>
            </div>
            <div className="w-px h-10 bg-border" />
            <div className="text-center">
              <span className="block text-2xl font-bold text-text">
                {effectiveTimer !== null ? `${effectiveTimer}s` : "∞"}
              </span>
              <span className="text-xs text-text-muted">Per Question</span>
            </div>
          </div>

          {/* Parse warnings if any */}
          {warnings && warnings.length > 0 && (
            <div className="mb-6 rounded-xl border border-error-border bg-error-bg p-3.5 text-left">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-sm">⚠️</span>
                <h4 className="text-xs font-semibold text-error">
                  {warnings.length} question{warnings.length > 1 ? "s" : ""} skipped due to formatting issues
                </h4>
              </div>
              <ul className="space-y-1 max-h-32 overflow-y-auto pr-1">
                {warnings.map((err, i) => (
                  <li key={i} className="text-[11px] text-text-secondary leading-snug flex items-start gap-1.5">
                    <span className="text-error font-bold mt-0.5">•</span>
                    <span>
                      {err.questionNumber !== null && (
                        <span className="font-semibold text-error mr-1">
                          Q{err.questionNumber} —
                        </span>
                      )}
                      {err.message}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Timer presets */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wider mb-3">
              Timer per question
            </label>
            <div className="grid grid-cols-5 gap-2">
              {TIMER_PRESETS.map((preset) => {
                const isActive =
                  preset.value === selectedPreset;
                return (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => setSelectedPreset(preset.value)}
                    className={`py-2.5 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200
                      ${
                        isActive
                          ? "bg-primary text-primary-text shadow-lg shadow-primary/20"
                          : "bg-surface-hover text-text-secondary hover:bg-surface-hover hover:text-text border border-border"
                      }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>

            {/* Custom input */}
            {isCustom && (
              <div className="mt-3 animate-slide-up">
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={5}
                    max={300}
                    value={customSeconds}
                    onChange={(e) =>
                      setCustomSeconds(
                        Math.max(5, Math.min(300, Number(e.target.value) || 5))
                      )
                    }
                    className="flex-1 px-4 py-2.5 rounded-lg bg-bg border border-border text-text text-sm
                      font-mono text-center focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary/50
                      transition-all duration-200"
                    aria-label="Custom timer duration in seconds"
                  />
                  <span className="text-sm text-text-muted">seconds</span>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={handleStart}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-text text-base font-semibold
                hover:bg-primary-hover active:scale-[0.98] transition-all duration-200
                shadow-lg shadow-primary/25"
            >
              Start Quiz ⚡
            </button>
            <button
              type="button"
              onClick={onBack}
              className="w-full py-2.5 rounded-xl border border-border bg-transparent text-text-muted text-sm font-medium
                hover:bg-surface-hover hover:text-text transition-all duration-200"
            >
              ← Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
