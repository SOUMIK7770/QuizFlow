// ─── Question & Parsing ────────────────────────────────────────────

export interface QuestionOption {
  label: string; // "A" | "B" | "C" | "D"
  text: string;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
  correctAnswer: string; // "A" | "B" | "C" | "D"
  explanation: string;
}

export interface ParseError {
  questionNumber: number | null; // null for file-level errors
  message: string;
}

export interface ParseResult {
  questions: Question[];
  errors: ParseError[];
  detectedCount?: number;
}

// ─── Quiz State ────────────────────────────────────────────────────

export interface QuizState {
  questions: Question[];
  currentIndex: number;
  answers: Record<number, string>; // questionId → selected label
  timerSetting: number | null; // seconds, null = off
  isCompleted: boolean;
  quizTitle: string;
  startedAt: string; // ISO timestamp
}

// ─── App Routing ───────────────────────────────────────────────────

export type Screen = "home" | "setup" | "quiz" | "results" | "review";
