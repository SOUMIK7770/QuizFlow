import { useState, useEffect, useCallback, useRef } from "react";

interface UseTimerReturn {
  /** Seconds remaining (float for smooth bar) */
  timeLeft: number;
  /** Percentage remaining 0-100 */
  percent: number;
  /** Whether the timer is currently counting down */
  isRunning: boolean;
  /** Reset and start the timer */
  reset: () => void;
  /** Pause the timer */
  pause: () => void;
}

/**
 * Countdown timer hook using drift-free interval for smooth, lightweight animation.
 *
 * @param durationSeconds - Total duration in seconds, or null for no timer
 * @param onExpire - Callback when timer hits zero
 */
export function useTimer(
  durationSeconds: number | null,
  onExpire: () => void
): UseTimerReturn {
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds ?? 0);
  const [isRunning, setIsRunning] = useState(false);
  const timerIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const durationRef = useRef(durationSeconds);
  const onExpireRef = useRef(onExpire);

  onExpireRef.current = onExpire;
  durationRef.current = durationSeconds;

  // When durationSeconds changes (e.g. setup preset change)
  useEffect(() => {
    setTimeLeft(durationSeconds ?? 0);
  }, [durationSeconds]);

  const stopTimer = useCallback(() => {
    if (timerIdRef.current !== null) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    stopTimer();
    if (durationRef.current === null || durationRef.current <= 0) {
      setTimeLeft(0);
      return;
    }

    const total = durationRef.current;
    setTimeLeft(total);
    startTimeRef.current = performance.now();
    setIsRunning(true);

    timerIdRef.current = window.setInterval(() => {
      if (durationRef.current === null) return;

      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      const remaining = Math.max(0, durationRef.current - elapsed);

      setTimeLeft(remaining);

      if (remaining <= 0) {
        if (timerIdRef.current !== null) {
          clearInterval(timerIdRef.current);
          timerIdRef.current = null;
        }
        setIsRunning(false);
        onExpireRef.current();
      }
    }, 100);
  }, [stopTimer]);

  const pause = useCallback(() => {
    stopTimer();
  }, [stopTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIdRef.current !== null) {
        clearInterval(timerIdRef.current);
      }
    };
  }, []);

  const percent =
    durationSeconds && durationSeconds > 0
      ? (timeLeft / durationSeconds) * 100
      : 100;

  return { timeLeft, percent, isRunning, reset, pause };
}
