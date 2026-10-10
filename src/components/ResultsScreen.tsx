import type { QuizState } from "../types";
import type { QuizDerived } from "../hooks/useQuizState";

interface ResultsScreenProps {
  state: QuizState;
  derived: QuizDerived;
  onReview: () => void;
  onRetry: () => void;
  onHome: () => void;
}

export function ResultsScreen({
  state,
  derived,
  onReview,
  onRetry,
  onHome,
}: ResultsScreenProps) {
  const { score, correctCount, incorrectCount, unansweredCount, totalQuestions } =
    derived;

  // Score grade color
  const getScoreColor = () => {
    if (score >= 80) return "text-success";
    if (score >= 60) return "text-warning";
    return "text-error";
  };

  const getScoreEmoji = () => {
    if (score >= 90) return "🏆";
    if (score >= 80) return "🌟";
    if (score >= 60) return "💪";
    if (score >= 40) return "📚";
    return "🔄";
  };

  const getMessage = () => {
    if (score >= 90) return "Outstanding performance!";
    if (score >= 80) return "Great job!";
    if (score >= 60) return "Good effort!";
    if (score >= 40) return "Keep practicing!";
    return "Don't give up!";
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8">
      <div className="w-full max-w-md animate-scale-in">
        {/* Results Card */}
        <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8 shadow-xl text-center">
          {/* Emoji + Score */}
          <div className="mb-6">
            <span className="text-5xl block mb-4 animate-count-up">
              {getScoreEmoji()}
            </span>
            <div className={`text-6xl font-extrabold ${getScoreColor()} animate-count-up`}>
              {score}%
            </div>
            <p className="text-base text-text-secondary mt-2 font-medium">
              {getMessage()}
            </p>
            <p className="text-xs text-text-muted mt-1">{state.quizTitle}</p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <div className="rounded-xl bg-success-bg border border-success-border p-4">
              <span className="block text-2xl font-bold text-success">
                {correctCount}
              </span>
              <span className="text-xs text-success/80">Correct</span>
            </div>
            <div className="rounded-xl bg-error-bg border border-error-border p-4">
              <span className="block text-2xl font-bold text-error">
                {incorrectCount}
              </span>
              <span className="text-xs text-error/80">Incorrect</span>
            </div>
            <div className="rounded-xl bg-surface-hover border border-border p-4">
              <span className="block text-2xl font-bold text-text-muted">
                {unansweredCount}
              </span>
              <span className="text-xs text-text-muted">Unanswered</span>
            </div>
          </div>

          {/* Score bar */}
          <div className="mb-8">
            <div className="w-full h-3 bg-bg rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  score >= 80
                    ? "bg-success"
                    : score >= 60
                      ? "bg-warning"
                      : "bg-error"
                }`}
                style={{ width: `${score}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-xs text-text-muted">
              <span>0%</span>
              <span>
                {correctCount} of {totalQuestions} correct
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              type="button"
              onClick={onReview}
              className="w-full py-3.5 rounded-xl bg-primary text-primary-text text-sm font-semibold
                hover:bg-primary-hover active:scale-[0.98] transition-all duration-200
                shadow-lg shadow-primary/25"
            >
              📋 Review Answers
            </button>
            <button
              type="button"
              onClick={onRetry}
              className="w-full py-3 rounded-xl border border-border bg-surface text-text text-sm font-medium
                hover:bg-surface-hover transition-all duration-200"
            >
              🔄 Retry Quiz
            </button>
            <button
              type="button"
              onClick={onHome}
              className="w-full py-2.5 rounded-xl bg-transparent text-text-muted text-sm font-medium
                hover:text-text transition-all duration-200"
            >
              ← Back Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
