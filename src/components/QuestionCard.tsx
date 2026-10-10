import type { Question } from "../types";
import { OptionButton } from "./OptionButton";
import { sanitize } from "../utils/sanitize";

interface QuestionCardProps {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | undefined;
  isRevealed: boolean;
  isTimedOut?: boolean;
  onSelectOption: (label: string) => void;
  animationDirection: "left" | "right" | "none";
}

export function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  isRevealed,
  isTimedOut = false,
  onSelectOption,
  animationDirection,
}: QuestionCardProps) {
  const animClass =
    animationDirection === "right"
      ? "animate-slide-in-right"
      : animationDirection === "left"
        ? "animate-slide-in-left"
        : "animate-fade-in";

  const isCorrect = isRevealed && !isTimedOut && selectedAnswer === question.correctAnswer;
  const isWrong = isRevealed && !isTimedOut && selectedAnswer !== question.correctAnswer;

  return (
    <div className={`w-full ${animClass}`} key={question.id}>
      {/* Question header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-semibold tracking-wide">
            Question {questionIndex + 1} of {totalQuestions}
          </span>
        </div>
        <h2
          className="text-lg sm:text-xl font-semibold leading-relaxed text-text"
          dangerouslySetInnerHTML={{ __html: sanitize(question.text) }}
        />
      </div>

      {/* Answer feedback alert (shows immediately after answering or timeout) */}
      {isRevealed && (
        <div className="mb-5 animate-slide-up">
          {isCorrect && (
            <div className="px-4 py-2.5 rounded-xl bg-success-bg border border-success-border text-success text-sm font-medium flex items-center gap-2.5">
              <span className="text-base">🎉</span>
              <span>Correct! Nice job.</span>
            </div>
          )}
          {isWrong && (
            <div className="px-4 py-2.5 rounded-xl bg-error-bg border border-error-border text-error text-sm font-medium flex items-center gap-2.5">
              <span className="text-base">❌</span>
              <span>
                Incorrect. You chose{" "}
                <strong className="font-bold underline">{selectedAnswer}</strong>, the
                correct answer is{" "}
                <strong className="font-bold underline">{question.correctAnswer}</strong>.
              </span>
            </div>
          )}
          {isTimedOut && (
            <div className="px-4 py-2.5 rounded-xl bg-warning-bg border border-warning/30 text-warning text-sm font-medium flex items-center gap-2.5">
              <span className="text-base">⏰</span>
              <span>
                Time expired! The correct answer is{" "}
                <strong className="font-bold underline">{question.correctAnswer}</strong>.
              </span>
            </div>
          )}
        </div>
      )}

      {/* Options */}
      <div className="flex flex-col gap-3 mb-6">
        {question.options.map((opt) => (
          <OptionButton
            key={opt.label}
            label={opt.label}
            text={opt.text}
            isSelected={selectedAnswer === opt.label}
            isCorrect={opt.label === question.correctAnswer}
            isRevealed={isRevealed}
            isDisabled={isRevealed}
            onClick={() => onSelectOption(opt.label)}
            shortcutKey={opt.label}
          />
        ))}
      </div>

      {/* Explanation — slides in after answering */}
      {isRevealed && (
        <div className="animate-slide-up rounded-xl border border-border bg-surface-alt p-5 shadow-lg">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-primary">💡 Explanation</span>
          </div>
          <div
            className="text-sm leading-relaxed text-text-secondary"
            dangerouslySetInnerHTML={{ __html: sanitize(question.explanation) }}
          />
        </div>
      )}
    </div>
  );
}
