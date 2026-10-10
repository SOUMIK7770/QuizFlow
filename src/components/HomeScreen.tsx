import { useState, useCallback, useRef, type DragEvent } from "react";
import type { Question, ParseError } from "../types";
import { parseMarkdownQuiz } from "../utils/parser";
import { loadQuizState } from "../utils/storage";
import { SAMPLE_QUIZ_MD } from "../data/sampleQuiz";

interface HomeScreenProps {
  onFileLoaded: (questions: Question[], title: string, warnings?: ParseError[]) => void;
  onResumeQuiz: () => void;
}

export function HomeScreen({ onFileLoaded, onResumeQuiz }: HomeScreenProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [errors, setErrors] = useState<ParseError[]>([]);
  const [parseInfo, setParseInfo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingFile, setPendingFile] = useState<{
    questions: Question[];
    title: string;
    warnings?: ParseError[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const savedState = loadQuizState();
  const hasActiveQuiz = savedState !== null && !savedState.isCompleted;

  const processTextContent = useCallback(
    (content: string, title: string) => {
      setIsLoading(true);
      setErrors([]);
      setParseInfo(null);

      const result = parseMarkdownQuiz(content);
      setIsLoading(false);

      if (result.questions.length === 0) {
        setErrors(
          result.errors.length > 0
            ? result.errors
            : [
                {
                  questionNumber: null,
                  message: "No valid questions found in the file.",
                },
              ]
        );
        return;
      }

      if (result.errors.length > 0) {
        setErrors(result.errors);
      }

      if (result.detectedCount && result.detectedCount > result.questions.length) {
        setParseInfo(
          `${result.detectedCount} questions detected — ${result.questions.length} valid, ${result.errors.length} error${result.errors.length > 1 ? "s" : ""}`
        );
      } else {
        setParseInfo(
          `Loaded ${result.questions.length} question${
            result.questions.length !== 1 ? "s" : ""
          }`
        );
      }

      if (hasActiveQuiz) {
        setPendingFile({ questions: result.questions, title, warnings: result.errors });
        setShowConfirm(true);
      } else {
        onFileLoaded(result.questions, title, result.errors);
      }
    },
    [hasActiveQuiz, onFileLoaded]
  );

  const processFile = useCallback(
    (file: File) => {
      if (!file.name.toLowerCase().endsWith(".md")) {
        setErrors([
          { questionNumber: null, message: "Only standardized .md files are supported." },
        ]);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const content = (e.target?.result as string) || "";
        const title = file.name.replace(/\.md$/i, "");
        processTextContent(content, title);
      };

      reader.onerror = () => {
        setIsLoading(false);
        setErrors([
          { questionNumber: null, message: "Failed to read the selected file." },
        ]);
      };

      reader.readAsText(file);
    },
    [processTextContent]
  );

  const handleLoadSample = useCallback(() => {
    processTextContent(SAMPLE_QUIZ_MD, "JavaScript Fundamentals (Demo)");
  }, [processTextContent]);

  // Drag & drop handlers
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = "";
    },
    [processFile]
  );

  const handleConfirmReplace = useCallback(() => {
    if (pendingFile) {
      setShowConfirm(false);
      onFileLoaded(pendingFile.questions, pendingFile.title, pendingFile.warnings);
      setPendingFile(null);
    }
  }, [pendingFile, onFileLoaded]);

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-4 py-8 relative">
      {/* Brand Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/15 border border-primary/20 mb-4 shadow-[0_0_25px_var(--color-primary-glow)]">
          <span className="text-3xl">⚡</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-text tracking-tight mb-2">
          Quiz<span className="text-primary">Flow</span>
        </h1>
        <p className="text-text-secondary text-sm sm:text-base max-w-md mx-auto">
          Convert standardized Markdown MCQ files into interactive, distraction-free practice tests.
        </p>
      </div>

      {/* Resume active quiz card */}
      {hasActiveQuiz && savedState && (
        <div className="w-full max-w-md mb-6 animate-slide-up">
          <div className="rounded-2xl border border-primary/40 bg-surface p-5 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center gap-3.5 mb-3">
              <div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-lg">
                📝
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider">
                  Active Session
                </span>
                <h3 className="text-sm font-bold text-text truncate">
                  {savedState.quizTitle}
                </h3>
                <p className="text-xs text-text-muted mt-0.5">
                  Question {savedState.currentIndex + 1} of {savedState.questions.length} •{" "}
                  {Object.keys(savedState.answers).length} answered
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onResumeQuiz}
              className="w-full py-2.5 rounded-xl bg-primary text-primary-text text-sm font-semibold
                hover:bg-primary-hover transition-all duration-200 active:scale-[0.98] shadow-md shadow-primary/25"
            >
              Resume Practice Test →
            </button>
          </div>
        </div>
      )}

      {/* Main Upload Zone */}
      <div
        className="w-full max-w-md animate-slide-up"
        style={{ animationDelay: hasActiveQuiz ? "0.08s" : "0s" }}
      >
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          aria-label="Upload markdown quiz file"
          className={`relative rounded-2xl border-2 border-dashed p-8 sm:p-10 text-center cursor-pointer
            transition-all duration-300 group
            ${
              isDragging
                ? "border-primary bg-primary/10 scale-[1.02] shadow-[0_0_35px_var(--color-primary-glow)]"
                : "border-border bg-surface hover:border-primary/60 hover:bg-surface-hover shadow-lg"
            }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".md"
            onChange={handleFileInput}
            className="hidden"
            aria-hidden="true"
          />

          <div
            className={`mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300
            ${isDragging ? "bg-primary/25 scale-110" : "bg-surface-alt group-hover:bg-primary/20 border border-border group-hover:border-primary/40"}`}
          >
            <span className="text-2xl transition-transform duration-300 group-hover:scale-110">
              {isLoading ? "⏳" : isDragging ? "📥" : "📄"}
            </span>
          </div>

          <p className="text-sm font-semibold text-text mb-1 group-hover:text-primary transition-colors">
            {isDragging ? "Drop your file to parse" : "Drag & drop your .md quiz file"}
          </p>
          <p className="text-xs text-text-muted mb-4">
            Standardized MCQ Markdown (Q1., Options A-D, Answer & Explanation)
          </p>

          <span className="inline-flex items-center px-4 py-2 rounded-xl bg-surface-alt border border-border text-xs font-medium text-text-secondary group-hover:text-text group-hover:border-primary/40 transition-colors">
            Browse File
          </span>
        </div>

        {/* Try Demo Quiz Button */}
        <div className="mt-4 flex items-center justify-center">
          <button
            type="button"
            onClick={handleLoadSample}
            className="text-xs font-medium text-primary hover:text-primary-hover transition-colors flex items-center gap-1.5 py-1.5 px-3 rounded-lg hover:bg-primary/10"
          >
            <span>⚡</span>
            <span>Or load 10-question demo quiz</span>
          </button>
        </div>
      </div>

      {/* Parse Status / Success info */}
      {parseInfo && (
        <div className="mt-4 px-4 py-2.5 rounded-xl bg-success-bg border border-success-border text-success text-sm font-medium animate-fade-in flex items-center gap-2">
          <span>✓</span>
          <span>{parseInfo}</span>
        </div>
      )}

      {/* Parse Warnings / Errors */}
      {errors.length > 0 && (
        <div className="w-full max-w-md mt-4 animate-slide-up">
          <div className="rounded-xl border border-error-border bg-error-bg p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-base">⚠️</span>
              <h3 className="text-sm font-semibold text-error">
                {errors.some((e) => e.questionNumber === null) ? "Parse Error" : "Validation Warnings"}
              </h3>
            </div>
            <ul className="space-y-1.5 max-h-44 overflow-y-auto pr-1">
              {errors.map((err, i) => (
                <li key={i} className="text-xs text-text-secondary leading-relaxed flex items-start gap-1.5">
                  <span className="text-error font-bold mt-0.5">•</span>
                  <span>
                    {err.questionNumber !== null && (
                      <span className="font-semibold text-error mr-1">
                        Q{err.questionNumber} —
                      </span>
                    )}
                    {err.message}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Confirmation modal for replacing active quiz */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in px-4">
          <div className="bg-surface border border-border rounded-2xl p-6 max-w-sm w-full animate-scale-in shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-error/15 border border-error/30 text-error flex items-center justify-center text-xl mb-4">
              ⚠️
            </div>
            <h3 className="text-lg font-bold text-text mb-1">
              Replace Active Quiz?
            </h3>
            <p className="text-xs sm:text-sm text-text-muted mb-6 leading-relaxed">
              You have an unfinished practice test in progress. Starting a new quiz will overwrite your saved progress.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowConfirm(false);
                  setPendingFile(null);
                }}
                className="flex-1 py-2.5 rounded-xl border border-border bg-surface text-text-secondary text-sm font-medium
                  hover:bg-surface-hover hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmReplace}
                className="flex-1 py-2.5 rounded-xl bg-error text-white text-sm font-semibold
                  hover:bg-error/90 transition-colors shadow-lg shadow-error/25"
              >
                Replace & Start
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
