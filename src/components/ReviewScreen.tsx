import { useState, useCallback } from "react";
import type { QuizState } from "../types";
import { sanitize } from "../utils/sanitize";

interface ReviewScreenProps {
  state: QuizState;
  onBack: () => void;
}

export function ReviewScreen({ state, onBack }: ReviewScreenProps) {
  const { questions, answers } = state;
  const [filter, setFilter] = useState<"all" | "correct" | "incorrect" | "unanswered">("all");
  const [jumpToIndex, setJumpToIndex] = useState<number | null>(null);

  const filteredQuestions = questions.filter((q) => {
    const userAnswer = answers[q.id];
    const isTimeout = userAnswer === "__TIMEOUT__";
    const isCorrect = userAnswer === q.correctAnswer;
    const isAnswered = userAnswer !== undefined && !isTimeout;

    switch (filter) {
      case "correct":
        return isAnswered && isCorrect;
      case "incorrect":
        return isAnswered && !isCorrect;
      case "unanswered":
        return !isAnswered;
      default:
        return true;
    }
  });

  const scrollToQuestion = useCallback((index: number) => {
    setJumpToIndex(index);
    setTimeout(() => {
      const el = document.getElementById(`review-q-${index}`);
      el?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  }, []);

  const correctCount = questions.filter(
    (q) => answers[q.id] && answers[q.id] !== "__TIMEOUT__" && answers[q.id] === q.correctAnswer
  ).length;
  const incorrectCount = questions.filter(
    (q) => answers[q.id] && answers[q.id] !== "__TIMEOUT__" && answers[q.id] !== q.correctAnswer
  ).length;
  const unansweredCount = questions.length - correctCount - incorrectCount;

  return (
    <div className="min-h-dvh bg-bg">
      {/* Sticky header */}
      <header className="sticky top-0 z-10 bg-bg/80 backdrop-blur-md border-b border-border px-4 sm:px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-text-muted hover:text-text transition-colors"
            >
              <span>←</span>
              <span>Back to Results</span>
            </button>
            <h1 className="text-sm font-semibold text-text">Review Answers</h1>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-2">
            {([
              { key: "all" as const, label: "All", count: questions.length },
              { key: "correct" as const, label: "Correct", count: correctCount },
              { key: "incorrect" as const, label: "Incorrect", count: incorrectCount },
              { key: "unanswered" as const, label: "Unanswered", count: unansweredCount },
            ]).map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setFilter(tab.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
                  ${
                    filter === tab.key
                      ? "bg-primary text-primary-text"
                      : "bg-surface text-text-muted hover:text-text hover:bg-surface-hover"
                  }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Question number quick-nav */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap gap-1.5 mb-6">
          {questions.map((q, i) => {
            const userAnswer = answers[q.id];
            const isTimeout = userAnswer === "__TIMEOUT__";
            const isCorrect = userAnswer === q.correctAnswer;
            const isAnswered = userAnswer !== undefined && !isTimeout;

            let dotColor = "bg-surface-hover text-text-muted border-border";
            if (isAnswered && isCorrect) dotColor = "bg-success/20 text-success border-success/30";
            else if (isAnswered && !isCorrect) dotColor = "bg-error/20 text-error border-error/30";

            return (
              <button
                key={q.id}
                type="button"
                onClick={() => scrollToQuestion(i)}
                className={`w-8 h-8 rounded-lg border text-[10px] font-semibold flex items-center justify-center
                  transition-all duration-150 hover:scale-110 ${dotColor}
                  ${jumpToIndex === i ? "ring-2 ring-primary" : ""}`}
                aria-label={`Jump to question ${i + 1}`}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        {/* Filtered questions */}
        <div className="space-y-4">
          {filteredQuestions.map((q) => {
            const qIndex = questions.indexOf(q);
            const userAnswer = answers[q.id];
            const isTimeout = userAnswer === "__TIMEOUT__";
            const isCorrect = userAnswer === q.correctAnswer;
            const isAnswered = userAnswer !== undefined && !isTimeout;

            return (
              <div
                key={q.id}
                id={`review-q-${qIndex}`}
                className="rounded-xl border border-border bg-surface p-5 animate-fade-in"
              >
                {/* Question header */}
                <div className="flex items-start gap-3 mb-4">
                  <span
                    className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold
                    ${
                      isAnswered && isCorrect
                        ? "bg-success/20 text-success"
                        : isAnswered && !isCorrect
                          ? "bg-error/20 text-error"
                          : "bg-surface-hover text-text-muted"
                    }`}
                  >
                    {qIndex + 1}
                  </span>
                  <h3
                    className="text-sm sm:text-base font-medium text-text leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: sanitize(q.text) }}
                  />
                </div>

                {/* Options */}
                <div className="space-y-2 mb-4 pl-11">
                  {q.options.map((opt) => {
                    const isSelectedOption = userAnswer === opt.label;
                    const isCorrectOption = opt.label === q.correctAnswer;

                    let optClasses =
                      "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm ";

                    if (isCorrectOption) {
                      optClasses += "bg-success-bg border border-success-border text-success";
                    } else if (isSelectedOption && !isCorrectOption) {
                      optClasses += "bg-error-bg border border-error-border text-error line-through";
                    } else {
                      optClasses += "text-text-muted";
                    }

                    return (
                      <div key={opt.label} className={optClasses}>
                        <span className="font-semibold text-xs w-5">
                          {opt.label})
                        </span>
                        <span dangerouslySetInnerHTML={{ __html: sanitize(opt.text) }} />
                        {isCorrectOption && (
                          <span className="ml-auto text-success text-xs font-semibold">
                            ✓ Correct
                          </span>
                        )}
                        {isSelectedOption && !isCorrectOption && (
                          <span className="ml-auto text-error text-xs font-semibold">
                            ✗ Your answer
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Status + explanation */}
                <div className="pl-11">
                  {isTimeout && (
                    <div className="mb-2 text-xs text-warning font-medium">
                      ⏰ Time expired — no answer selected
                    </div>
                  )}
                  <div className="rounded-lg bg-surface-alt border border-border p-3">
                    <span className="text-xs font-semibold text-primary block mb-1">
                      💡 Explanation
                    </span>
                    <p
                      className="text-xs sm:text-sm leading-relaxed text-text-secondary"
                      dangerouslySetInnerHTML={{ __html: sanitize(q.explanation) }}
                    />
                  </div>
                </div>
              </div>
            );
          })}

          {filteredQuestions.length === 0 && (
            <div className="text-center py-12 text-text-muted text-sm">
              No questions match this filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
