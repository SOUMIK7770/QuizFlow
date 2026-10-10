interface TimerBarProps {
  /** Percentage remaining 0-100 */
  percent: number;
  /** Seconds remaining */
  timeLeft: number;
  /** Whether the timer is active */
  isRunning: boolean;
  /** Whether the current question is revealed/answered */
  isRevealed?: boolean;
  /** Whether time expired on this question */
  isTimedOut?: boolean;
}

export function TimerBar({
  percent,
  timeLeft,
  isRunning,
  isRevealed = false,
  isTimedOut = false,
}: TimerBarProps) {
  const displaySeconds = Math.max(0, Math.ceil(timeLeft));
  const clampedPercent = Math.min(100, Math.max(0, percent));

  // Color transitions: primary (>50%) → warning (25-50%) → error (<=25% or timed out)
  const getColor = () => {
    if (isTimedOut) return "bg-error";
    if (isRevealed) return "bg-success";
    if (clampedPercent > 50) return "bg-primary";
    if (clampedPercent > 25) return "bg-warning";
    return "bg-error";
  };

  const getGlow = () => {
    if (!isRunning) return "";
    if (clampedPercent > 50) return "shadow-[0_0_8px_var(--color-primary-glow)]";
    if (clampedPercent > 25) return "shadow-[0_0_8px_rgba(245,158,11,0.3)]";
    return "shadow-[0_0_8px_rgba(239,68,68,0.3)]";
  };

  return (
    <div
      className="w-full pt-1"
      role="timer"
      aria-label={
        isTimedOut
          ? "Time expired"
          : isRevealed
            ? "Question answered"
            : `${displaySeconds} seconds remaining`
      }
    >
      <div className="w-full h-1.5 bg-surface-alt rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-colors duration-300 ${getColor()} ${getGlow()}`}
          style={{
            width: isTimedOut ? "0%" : `${clampedPercent}%`,
            transition: isRunning
              ? "width 0.1s linear, background-color 0.3s, box-shadow 0.3s"
              : "background-color 0.3s, box-shadow 0.3s",
          }}
        />
      </div>

      <div className="flex justify-between items-center mt-1 text-xs">
        <span className="text-[11px] text-text-muted">
          {isTimedOut ? (
            <span className="text-error font-medium flex items-center gap-1">
              <span>⏰</span>
              <span>Time expired</span>
            </span>
          ) : isRevealed ? (
            <span className="text-success font-medium flex items-center gap-1">
              <span>✓</span>
              <span>Answered</span>
            </span>
          ) : isRunning ? (
            <span className="text-text-muted">Time left</span>
          ) : (
            <span className="text-text-muted">Timer paused</span>
          )}
        </span>

        <span
          className={`font-mono font-semibold tabular-nums text-xs ${
            isTimedOut
              ? "text-error"
              : isRevealed
                ? "text-success"
                : clampedPercent <= 25
                  ? "text-error"
                  : clampedPercent <= 50
                    ? "text-warning"
                    : "text-text"
          }`}
        >
          {displaySeconds}s
        </span>
      </div>
    </div>
  );
}
