import { useReducer, useCallback, useEffect, useRef } from "react";
import type { Question, QuizState } from "../types";
import { saveQuizState, clearQuizState } from "../utils/storage";

// ─── Actions ────────────────────────────────────────────────────────

type Action =
  | { type: "LOAD_SAVED"; state: QuizState }
  | {
      type: "START_QUIZ";
      questions: Question[];
      timerSetting: number | null;
      title: string;
    }
  | { type: "ANSWER"; questionId: number; selectedLabel: string }
  | { type: "NAVIGATE"; index: number }
  | { type: "COMPLETE" }
  | { type: "RETRY" }
  | { type: "RESET" };

// ─── Reducer ────────────────────────────────────────────────────────

function quizReducer(state: QuizState | null, action: Action): QuizState | null {
  switch (action.type) {
    case "LOAD_SAVED":
      return action.state;

    case "START_QUIZ":
      return {
        questions: action.questions,
        currentIndex: 0,
        answers: {},
        timerSetting: action.timerSetting,
        isCompleted: false,
        quizTitle: action.title,
        startedAt: new Date().toISOString(),
      };

    case "ANSWER":
      if (!state) return state;
      // Don't overwrite existing answer
      if (state.answers[action.questionId] !== undefined) return state;
      return {
        ...state,
        answers: {
          ...state.answers,
          [action.questionId]: action.selectedLabel,
        },
      };

    case "NAVIGATE":
      if (!state) return state;
      return {
        ...state,
        currentIndex: Math.max(
          0,
          Math.min(action.index, state.questions.length - 1)
        ),
      };

    case "COMPLETE":
      if (!state) return state;
      return { ...state, isCompleted: true };

    case "RETRY":
      if (!state) return state;
      return {
        ...state,
        currentIndex: 0,
        answers: {},
        isCompleted: false,
        startedAt: new Date().toISOString(),
      };

    case "RESET":
      return null;

    default:
      return state;
  }
}

// ─── Hook ───────────────────────────────────────────────────────────

export interface QuizActions {
  loadSaved: (state: QuizState) => void;
  startQuiz: (
    questions: Question[],
    timerSetting: number | null,
    title: string
  ) => void;
  answer: (questionId: number, selectedLabel: string) => void;
  navigate: (index: number) => void;
  goNext: () => void;
  goPrev: () => void;
  complete: () => void;
  retry: () => void;
  reset: () => void;
}

export interface QuizDerived {
  score: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  totalQuestions: number;
  progressPercent: number;
  answeredCount: number;
  answeredPercent: number;
  currentQuestion: Question | null;
  isCurrentAnswered: boolean;
  allAnswered: boolean;
}

export function useQuizState(): {
  state: QuizState | null;
  actions: QuizActions;
  derived: QuizDerived;
} {
  const [state, dispatch] = useReducer(quizReducer, null);

  // Track previous state to avoid redundant saves
  const prevStateRef = useRef<QuizState | null>(null);

  // Persist to localStorage on every meaningful state change
  useEffect(() => {
    if (state && state !== prevStateRef.current) {
      saveQuizState(state);
      prevStateRef.current = state;
    }
    if (state === null && prevStateRef.current !== null) {
      clearQuizState();
      prevStateRef.current = null;
    }
  }, [state]);

  // ─── Actions ──────────────────────────────────────────────

  const loadSaved = useCallback((s: QuizState) => {
    dispatch({ type: "LOAD_SAVED", state: s });
  }, []);

  const startQuiz = useCallback(
    (questions: Question[], timerSetting: number | null, title: string) => {
      dispatch({ type: "START_QUIZ", questions, timerSetting, title });
    },
    []
  );

  const answer = useCallback((questionId: number, selectedLabel: string) => {
    dispatch({ type: "ANSWER", questionId, selectedLabel });
  }, []);

  const navigate = useCallback((index: number) => {
    dispatch({ type: "NAVIGATE", index });
  }, []);

  const goNext = useCallback(() => {
    if (!state) return;
    dispatch({ type: "NAVIGATE", index: state.currentIndex + 1 });
  }, [state]);

  const goPrev = useCallback(() => {
    if (!state) return;
    dispatch({ type: "NAVIGATE", index: state.currentIndex - 1 });
  }, [state]);

  const complete = useCallback(() => {
    dispatch({ type: "COMPLETE" });
  }, []);

  const retry = useCallback(() => {
    dispatch({ type: "RETRY" });
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: "RESET" });
  }, []);

  // ─── Derived Values ──────────────────────────────────────

  const totalQuestions = state?.questions.length ?? 0;
  const answeredEntries = state ? Object.entries(state.answers) : [];

  const correctCount = state
    ? answeredEntries.filter(([qId, label]) => {
        const q = state.questions.find((q) => q.id === Number(qId));
        return q && q.correctAnswer === label;
      }).length
    : 0;

  const incorrectCount = answeredEntries.length - correctCount;
  const unansweredCount = totalQuestions - answeredEntries.length;
  const score =
    totalQuestions > 0
      ? Math.round((correctCount / totalQuestions) * 100)
      : 0;

  const answeredCount = answeredEntries.length;
  const answeredPercent =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;
  const progressPercent =
    state && totalQuestions > 0
      ? Math.round(((state.currentIndex + 1) / totalQuestions) * 100)
      : 0;

  const currentQuestion =
    state && state.questions[state.currentIndex]
      ? state.questions[state.currentIndex]
      : null;

  const isCurrentAnswered =
    currentQuestion !== null &&
    state !== null &&
    state.answers[currentQuestion.id] !== undefined;

  const allAnswered =
    totalQuestions > 0 && answeredEntries.length === totalQuestions;

  return {
    state,
    actions: {
      loadSaved,
      startQuiz,
      answer,
      navigate,
      goNext,
      goPrev,
      complete,
      retry,
      reset,
    },
    derived: {
      score,
      correctCount,
      incorrectCount,
      unansweredCount,
      totalQuestions,
      progressPercent,
      answeredCount,
      answeredPercent,
      currentQuestion,
      isCurrentAnswered,
      allAnswered,
    },
  };
}
