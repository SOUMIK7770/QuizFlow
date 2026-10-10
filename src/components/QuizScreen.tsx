import { useEffect, useCallback, useRef, useState } from "react";
import type { QuizState } from "../types";
import type { QuizActions, QuizDerived } from "../hooks/useQuizState";
import { useTimer } from "../hooks/useTimer";
import { QuestionCard } from "./QuestionCard";
import { ProgressBar } from "./ProgressBar";
import { TimerBar } from "./TimerBar";

interface QuizScreenProps {
  state: QuizState;
  actions: QuizActions;
  derived: QuizDerived;
  onShowResults: () => void;
}

export function QuizScreen({
  state,
  actions,
  derived,
  onShowResults,
}: QuizScreenProps) {
  const { currentIndex, questions, answers, timerSetting } = state;
  const question = questions[currentIndex];
  const selectedAnswer = question ? answers[question.id] : undefined;
  const isRevealed = selectedAnswer !== undefined;
  const isTimedOut = selectedAnswer === "__TIMEOUT__";
  const [animDirection, setAnimDirection] = useState<"left" | "right" | "none">("none");
  const [showNavGrid, setShowNavGrid] = useState(false);
  const prevIndexRef = useRef(currentIndex);

  // Handle timer expiry — auto-reveal correct answer as timeout
  const handleTimerExpire = useCallback(() => {
    if (question && !isRevealed) {
      actions.answer(question.id, "__TIMEOUT__");
    }
  }, [question, isRevealed, actions]);

  const timer = useTimer(timerSetting, handleTimerExpire);

  // Reset or pause timer when question or answer status changes
  useEffect(() => {
    if (timerSetting !== null && !isRevealed) {
      timer.reset();
    } else {
      timer.pause();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, timerSetting, isRevealed]);

  // Track animation direction
  useEffect(() => {
    if (currentIndex > prevIndexRef.current) {
      setAnimDirection("right");
    } else if (currentIndex < prevIndexRef.current) {
      setAnimDirection("left");
    } else {
      setAnimDirection("none");
    }
    prevIndexRef.current = currentIndex;
  }, [currentIndex]);

  // Handle option selection
  const handleSelectOption = useCallback(
    (label: string) => {
      if (!question || isRevealed) return;
      actions.answer(question.id, label);
    },
    [question, isRevealed, actions]
  );

  const isLastQuestion = currentIndex === questions.length - 1;

  // Navigation
  const handleNext = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      actions.goNext();
    } else {
      actions.complete();
      onShowResults();
    }
  }, [currentIndex, questions.length, actions, onShowResults]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      actions.goPrev();
    }
  }, [currentIndex, actions]);

  // Keyboard navigation (A, B, C, D, Left, Right, Enter)
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showNavGrid) return;
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      const key = e.key.toUpperCase();

      // A/B/C/D to select option
      if (["A", "B", "C", "D"].includes(key) && !isRevealed && question) {
        const hasOption = question.options.some((o) => o.label === key);
        if (hasOption) {
          e.preventDefault();
          handleSelectOption(key);
        }
      }

      // Arrow keys for navigation
      if (e.key === "ArrowRight") {
        if (isRevealed) {
          e.preventDefault();
          handleNext();
        }
      }
      if (e.key === "ArrowLeft") {
        if (currentIndex > 0) {
          e.preventDefault();
          handlePrev();
        }
      }

      // Enter to proceed when answered
      if (e.key === "Enter" && isRevealed) {
        e.preventDefault();
        handleNext();
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isRevealed, question, showNavGrid, currentIndex, handleSelectOption, handleNext, handlePrev]);

  if (!question) return null;

  return (
    <div className="min-h-dvh flex flex-col bg-bg">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-bg/85 backdrop-blur-md border-b border-border px-4 sm:px-6 py-3">
        <div className="max-w-2xl mx-auto space-y-2.5">
          {/* Header row: title, quick-nav button, and question counter */}
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-sm font-semibold text-text-secondary truncate max-w-[55%]">
              {state.quizTitle}
            </h1>

            <div className="flex items-center gap-2">
              {/* Question list trigger button */}
              <button
                type="button"
                onClick={() => setShowNavGrid(!showNavGrid)}
                className="px-2.5 py-1 rounded-lg border border-border bg-surface text-xs font-medium text-text-muted
                  hover:bg-surface-hover hover:text-text transition-colors flex items-center gap-1.5"
                title="Overview & Jump"
                aria-label="Toggle question list overview"
              >
                <span>☰</span>
                <span className="hidden sm:inline">Overview</span>
              </button>

              {/* Question counter */}
              <div className="px-2.5 py-1 rounded-lg bg-surface border border-border text-xs font-mono font-semibold text-text tabular-nums">
                {currentIndex + 1} <span className="text-text-muted">/</span> {questions.length}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <ProgressBar
            current={currentIndex + 1}
            total={questions.length}
            answered={derived.answeredCount}
          />

          {/* Timer bar */}
          {timerSetting !== null && (
            <TimerBar
              percent={timer.percent}
              timeLeft={timer.timeLeft}
              isRunning={timer.isRunning}
              isRevealed={isRevealed}
              isTimedOut={isTimedOut}
            />
          )}
        </div>
      </header>

      {/* Main question area */}
      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-start">
        <div className="max-w-2xl w-full mx-auto">
          <QuestionCard
            question={question}
            questionIndex={currentIndex}
            totalQuestions={questions.length}
            selectedAnswer={selectedAnswer !== "__TIMEOUT__" ? selectedAnswer : undefined}
            isRevealed={isRevealed}
            isTimedOut={isTimedOut}
            onSelectOption={handleSelectOption}
            animationDirection={animDirection}
          />
        </div>
      </main>

      {/* Bottom navigation */}
      <footer className="sticky bottom-0 z-10 bg-bg/85 backdrop-blur-md border-t border-border px-4 sm:px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium
              border border-border bg-surface text-text-secondary
              hover:bg-surface-hover hover:text-text active:scale-[0.98]
              disabled:opacity-30 disabled:cursor-not-allowed
              transition-all duration-200"
            aria-label="Previous question"
          >
            <span className="text-base">←</span>
            <span className="hidden sm:inline">Previous</span>
          </button>

          {/* Keyboard hints */}
          <div className="hidden md:flex items-center gap-2 text-text-muted text-xs">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">
                A-D
              </kbd>
              <span>select</span>
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono">
                Enter
              </kbd>
              <span>continue</span>
            </span>
          </div>

          <button
            type="button"
            onClick={handleNext}
            disabled={!isRevealed}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold
              transition-all duration-200 active:scale-[0.98]
              ${
                isLastQuestion
                  ? "bg-success text-white hover:bg-success/90 shadow-lg shadow-success/20"
                  : "bg-primary text-primary-text hover:bg-primary-hover shadow-lg shadow-primary/20"
              }
              disabled:opacity-30 disabled:cursor-not-allowed`}
            aria-label={isLastQuestion ? "See results" : "Next question"}
          >
            <span>{isLastQuestion ? "See Results" : "Next"}</span>
            <span className="text-base">{isLastQuestion ? "🏁" : "→"}</span>
          </button>
        </div>
      </footer>

      {/* Question Overview Modal / Drawer */}
      {showNavGrid && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowNavGrid(false)}
        >
          <div
            className="bg-surface border border-border rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col p-6 shadow-2xl animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-border mb-4">
              <div>
                <h3 className="text-base font-semibold text-text">Questions Overview</h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Click any question to jump to it directly
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNavGrid(false)}
                className="w-8 h-8 rounded-lg border border-border text-text-muted hover:text-text hover:bg-surface-hover flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-text-muted mb-4 pb-2 border-b border-border/50">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-success"></span> Correct
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-error"></span> Incorrect
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-warning"></span> Timed out
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-primary ring-2 ring-primary/40"></span> Current
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-surface-hover border border-border"></span> Unanswered
              </span>
            </div>

            {/* Grid */}
            <div className="overflow-y-auto pr-1 flex-1">
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {questions.map((q, idx) => {
                  const ans = answers[q.id];
                  const isCurrent = idx === currentIndex;
                  const isAnsweredQ = ans !== undefined;
                  const isTimed = ans === "__TIMEOUT__";
                  const isRight = isAnsweredQ && !isTimed && ans === q.correctAnswer;
                  const isWrong = isAnsweredQ && !isTimed && ans !== q.correctAnswer;

                  let btnStyle = "bg-surface-hover text-text-muted border-border hover:border-primary/50";
                  if (isCurrent) {
                    btnStyle = "bg-primary text-white border-primary ring-2 ring-primary/40 font-bold";
                  } else if (isRight) {
                    btnStyle = "bg-success-bg text-success border-success-border font-semibold";
                  } else if (isWrong) {
                    btnStyle = "bg-error-bg text-error border-error-border font-semibold";
                  } else if (isTimed) {
                    btnStyle = "bg-warning-bg text-warning border-warning/40 font-semibold";
                  }

                  return (
                    <button
                      key={q.id}
                      type="button"
                      onClick={() => {
                        actions.navigate(idx);
                        setShowNavGrid(false);
                      }}
                      className={`h-10 rounded-xl border text-xs flex items-center justify-center transition-all duration-150 ${btnStyle}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-border flex justify-end">
              <button
                type="button"
                onClick={() => setShowNavGrid(false)}
                className="px-4 py-2 rounded-xl bg-surface-hover border border-border text-sm font-medium text-text hover:bg-surface-hover/80"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
