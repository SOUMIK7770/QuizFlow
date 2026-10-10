import { sanitize } from "../utils/sanitize";

interface OptionButtonProps {
  label: string;         // "A" | "B" | "C" | "D"
  text: string;
  isSelected: boolean;
  isCorrect: boolean;
  isRevealed: boolean;   // Whether the answer has been revealed
  isDisabled: boolean;
  onClick: () => void;
  shortcutKey: string;   // For aria hint
}

export function OptionButton({
  label,
  text,
  isSelected,
  isCorrect,
  isRevealed,
  isDisabled,
  onClick,
  shortcutKey,
}: OptionButtonProps) {
  // Determine visual state
  let containerClasses =
    "group relative w-full flex items-start gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200 cursor-pointer min-h-[56px] ";

  if (!isRevealed) {
    // Before answer is revealed — no clues!
    containerClasses +=
      "border-border bg-surface hover:border-primary hover:bg-surface-hover active:scale-[0.98]";
  } else if (isSelected && isCorrect) {
    // Selected + correct
    containerClasses +=
      "border-success-border bg-success-bg animate-pulse-success";
  } else if (isSelected && !isCorrect) {
    // Selected + incorrect
    containerClasses += "border-error-border bg-error-bg animate-shake";
  } else if (!isSelected && isCorrect) {
    // Not selected but this is the correct answer (revealed after wrong pick)
    containerClasses += "border-success-border bg-success-bg";
  } else {
    // Not selected, not correct, revealed
    containerClasses += "border-border bg-surface opacity-50";
  }

  if (isDisabled) {
    containerClasses += " cursor-default";
  }

  // Label badge
  let badgeClasses =
    "flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center text-sm font-bold transition-all duration-200 ";

  if (!isRevealed) {
    badgeClasses += "bg-surface-hover text-text-secondary group-hover:bg-primary group-hover:text-primary-text";
  } else if ((isSelected && isCorrect) || (!isSelected && isCorrect)) {
    badgeClasses += "bg-success text-white";
  } else if (isSelected && !isCorrect) {
    badgeClasses += "bg-error text-white";
  } else {
    badgeClasses += "bg-surface-hover text-text-muted";
  }

  // Icon for revealed state
  const renderIcon = () => {
    if (!isRevealed) return null;

    if ((isSelected && isCorrect) || (!isSelected && isCorrect)) {
      return (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-success text-lg">
          ✓
        </span>
      );
    }
    if (isSelected && !isCorrect) {
      return (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-error text-lg">
          ✗
        </span>
      );
    }
    return null;
  };

  return (
    <button
      type="button"
      className={containerClasses}
      onClick={isDisabled ? undefined : onClick}
      disabled={isDisabled}
      aria-label={`Option ${label}: ${text}`}
      aria-describedby={`Press ${shortcutKey} to select`}
      id={`option-${label.toLowerCase()}`}
    >
      <span className={badgeClasses}>{label}</span>
      <span
        className="flex-1 text-sm sm:text-base leading-relaxed pt-1 text-text pr-8"
        dangerouslySetInnerHTML={{ __html: sanitize(text) }}
      />
      {renderIcon()}
    </button>
  );
}
