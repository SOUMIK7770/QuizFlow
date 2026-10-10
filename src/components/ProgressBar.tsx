interface ProgressBarProps {
  /** Current question number (1-based, e.g. 7) */
  current?: number;
  /** Total number of questions (e.g. 100) */
  total?: number;
  /** Number of answered questions so far (e.g. 6) */
  answered?: number;
  /** Direct percentage 0-100 fallback */
  percent?: number;
  /** Optional custom label */
  label?: string;
}

export function ProgressBar({
  current,
  total,
  answered,
  percent,
  label,
}: ProgressBarProps) {
  // If current & total are provided, calculate progress based on question position
  const effectivePercent =
    current !== undefined && total !== undefined && total > 0
      ? Math.min(100, Math.max(0, (current / total) * 100))
      : Math.min(100, Math.max(0, percent ?? 0));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5 text-xs font-medium text-text-muted">
        <span>
          {current !== undefined && total !== undefined ? (
            <>
              Question <span className="text-text font-semibold">{current}</span> of{" "}
              <span className="text-text font-semibold">{total}</span>
            </>
          ) : (
            label || "Progress"
          )}
        </span>
        <div className="flex items-center gap-2">
          {answered !== undefined && total !== undefined && (
            <span className="text-text-muted text-[11px]">
              {answered}/{total} answered
            </span>
          )}
          <span className="tabular-nums font-mono text-text font-semibold">
            {Math.round(effectivePercent)}%
          </span>
        </div>
      </div>

      <div className="w-full h-2 bg-surface rounded-full overflow-hidden relative">
        {/* Optional subtle secondary track for completed/answered questions */}
        {answered !== undefined && total !== undefined && answered > 0 && (
          <div
            className="absolute top-0 left-0 h-full bg-primary/25 rounded-full transition-all duration-300 pointer-events-none"
            style={{ width: `${Math.min(100, (answered / total) * 100)}%` }}
          />
        )}
        {/* Main active question progress bar */}
        <div
          className="h-full bg-primary rounded-full transition-all duration-300 ease-out shadow-[0_0_8px_var(--color-primary-glow)] relative z-10"
          style={{ width: `${effectivePercent}%` }}
        />
      </div>
    </div>
  );
}
