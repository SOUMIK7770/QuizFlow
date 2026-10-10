import type { QuizState } from "../types";

const STORAGE_KEY = "quizflow_state";

/**
 * Save the complete quiz state to localStorage.
 */
export function saveQuizState(state: QuizState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    console.warn("QuizFlow: Failed to save state to localStorage.");
  }
}

/**
 * Load a previously saved quiz state from localStorage.
 * Returns null if nothing is saved or the data is corrupt.
 */
export function loadQuizState(): QuizState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuizState;

    // Basic shape validation
    if (
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0 ||
      typeof parsed.currentIndex !== "number" ||
      typeof parsed.answers !== "object"
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/**
 * Remove saved quiz state.
 */
export function clearQuizState(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Silently ignore
  }
}

/**
 * Check whether there is an active (unfinished) quiz in storage.
 */
export function hasActiveQuiz(): boolean {
  const state = loadQuizState();
  return state !== null && !state.isCompleted;
}
