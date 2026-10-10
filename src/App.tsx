import { useState, useCallback, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import type { Question, Screen, ParseError } from "./types";
import { useQuizState } from "./hooks/useQuizState";
import { loadQuizState, clearQuizState } from "./utils/storage";
import { HomeScreen } from "./components/HomeScreen";
import { QuizSetup } from "./components/QuizSetup";
import { QuizScreen } from "./components/QuizScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { ReviewScreen } from "./components/ReviewScreen";

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [pendingQuestions, setPendingQuestions] = useState<Question[]>([]);
  const [pendingTitle, setPendingTitle] = useState("");
  const [pendingWarnings, setPendingWarnings] = useState<ParseError[]>([]);
  const { state, actions, derived } = useQuizState();

  // On mount: check for saved state and resume
  useEffect(() => {
    const saved = loadQuizState();
    if (saved) {
      actions.loadSaved(saved);
      if (saved.isCompleted) {
        setScreen("results");
      } else {
        setScreen("quiz");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── Navigation callbacks ─────────────────────────────────

  const handleFileLoaded = useCallback(
    (questions: Question[], title: string, warnings?: ParseError[]) => {
      setPendingQuestions(questions);
      setPendingTitle(title);
      setPendingWarnings(warnings || []);
      setScreen("setup");
    },
    []
  );

  const handleResumeQuiz = useCallback(() => {
    const saved = loadQuizState();
    if (saved) {
      actions.loadSaved(saved);
      if (saved.isCompleted) {
        setScreen("results");
      } else {
        setScreen("quiz");
      }
    }
  }, [actions]);

  const handleStartQuiz = useCallback(
    (timerSetting: number | null) => {
      actions.startQuiz(pendingQuestions, timerSetting, pendingTitle);
      setScreen("quiz");
    },
    [pendingQuestions, pendingTitle, actions]
  );

  const handleSetupBack = useCallback(() => {
    setScreen("home");
  }, []);

  const handleShowResults = useCallback(() => {
    setScreen("results");
  }, []);

  const handleReview = useCallback(() => {
    setScreen("review");
  }, []);

  const handleRetry = useCallback(() => {
    actions.retry();
    setScreen("quiz");
  }, [actions]);

  const handleHome = useCallback(() => {
    actions.reset();
    clearQuizState();
    setScreen("home");
  }, [actions]);

  const handleReviewBack = useCallback(() => {
    setScreen("results");
  }, []);

  // ─── Render ───────────────────────────────────────────────

  return (
    <>
      {screen === "home" && (
        <HomeScreen
          onFileLoaded={handleFileLoaded}
          onResumeQuiz={handleResumeQuiz}
        />
      )}

      {screen === "setup" && (
        <QuizSetup
          questions={pendingQuestions}
          title={pendingTitle}
          warnings={pendingWarnings}
          onStart={handleStartQuiz}
          onBack={handleSetupBack}
        />
      )}

      {screen === "quiz" && state && (
        <QuizScreen
          state={state}
          actions={actions}
          derived={derived}
          onShowResults={handleShowResults}
        />
      )}

      {screen === "results" && state && (
        <ResultsScreen
          state={state}
          derived={derived}
          onReview={handleReview}
          onRetry={handleRetry}
          onHome={handleHome}
        />
      )}

      {screen === "review" && state && (
        <ReviewScreen state={state} onBack={handleReviewBack} />
      )}
      <Analytics />
    </>
  );
}
