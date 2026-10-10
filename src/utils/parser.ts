import type { Question, QuestionOption, ParseError, ParseResult } from "../types";

/**
 * Step 1: Normalize Markdown & Whitespace
 */
function normalizeMarkdown(raw: string): string {
  if (!raw) return "";
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/^\uFEFF/, "");
}

/**
 * Strips outer enclosing bold `**` markers if the entire string was wrapped,
 * while preserving inner bold, code, and italic formatting.
 */
function cleanOuterBold(text: string): string {
  let cleaned = text.trim();
  if (
    cleaned.startsWith("**") &&
    cleaned.endsWith("**") &&
    cleaned.length >= 4 &&
    cleaned.indexOf("**", 2) === cleaned.length - 2
  ) {
    cleaned = cleaned.slice(2, -2).trim();
  }
  return cleaned;
}

/**
 * Check if a line is a horizontal separator (e.g. ---, ***, ___)
 */
function isHorizontalRule(line: string): boolean {
  return /^\s*(?:-{3,}|\*{3,}|_{3,})\s*$/.test(line);
}

/**
 * Check if a line is a non-question section header or footer content that
 * must never become a question and should terminate an explanation.
 */
function isNonQuestionSection(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return false;

  // Answer Key Summary, Distribution Check, References, Notes, Tables
  if (
    /^(?:#{1,6}\s*)?(?:\*{1,2})?(?:Answer\s*Key(?:\s*Summary)?|Distribution\s*check|Answer\s*Sheet|Summary\s*of\s*Answers)\b/i.test(
      trimmed
    )
  ) {
    return true;
  }

  // Markdown table line: starts and contains pipes
  if (/^\|.*\|.*$/.test(trimmed)) {
    return true;
  }

  // Generic document headings like "# INT250", "### Hard Disks" that don't look like questions
  if (
    /^#{1,6}\s+(?!(?:Q(?:uestion)?\s*\d+|\d+[.:)]))\S+/i.test(trimmed) &&
    !/\b(?:Q\s*\d+|Question\s*\d+)\b/i.test(trimmed)
  ) {
    return true;
  }

  return false;
}

/**
 * Question Header matching:
 * Matches:
 * - ### Q1. ...
 * - ## Q1. ...
 * - Q1. ...
 * - Q1) ...
 * - Q1: ...
 * - Question 1: ...
 * - Question 1. ...
 * - 1. ...
 * - 1) ...
 * - **Q1.** ...
 * - **1.** ...
 */
interface QuestionHeaderMatch {
  qNum: number | null;
  textRemainder: string;
}

function matchQuestionHeader(line: string): QuestionHeaderMatch | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  // Don't match non-question headings or horizontal rules
  if (isNonQuestionSection(trimmed) || isHorizontalRule(trimmed)) {
    return null;
  }

  // Pattern A: Q1. / Q1) / Q1: / Question 1: / Question 1. / ### Q1. / **Q1.**
  const patternA =
    /^(?:#{1,6}\s*)?(?:\*{1,2})?\s*(?:Q|Question)\s*(\d+)\s*[.:)\-]\s*(?:\*{1,2})?\s*(.*)$/i;
  const matchA = trimmed.match(patternA);
  if (matchA) {
    return {
      qNum: parseInt(matchA[1], 10),
      textRemainder: cleanOuterBold(matchA[2]),
    };
  }

  // Pattern B: 1. ... / 1) ... / ### 1. ... / **1.** ...
  const patternB =
    /^(?:#{1,6}\s*)?(?:\*{1,2})?\s*(\d+)\s*[.:)\-]\s*(?:\*{1,2})?\s*(.*)$/;
  const matchB = trimmed.match(patternB);
  if (matchB) {
    return {
      qNum: parseInt(matchB[1], 10),
      textRemainder: cleanOuterBold(matchB[2]),
    };
  }

  return null;
}

/**
 * Option match:
 * Matches:
 * - A) ...
 * - A. ...
 * - (A) ...
 * - **A)** ...
 * - **A.** ...
 * - - A) ...
 * - * A) ...
 * - A: ...
 */
interface OptionMatch {
  label: string;
  text: string;
}

function matchOption(line: string): OptionMatch | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const optionRegex =
    /^\s*(?:[-*+]\s+)?(?:\*{1,2})?(?:\(([A-Za-z])\)|\(?([A-Za-z])\)?\s*[.:)\-])\s*(?:\*{1,2})?\s*(.*)$/;
  const match = trimmed.match(optionRegex);
  if (match) {
    const rawLabel = (match[1] || match[2]).toUpperCase();
    // Only accept single letter labels A-Z (usually A-D)
    if (/^[A-Z]$/.test(rawLabel)) {
      return {
        label: rawLabel,
        text: cleanOuterBold(match[3]),
      };
    }
  }

  return null;
}

/**
 * Answer match:
 * Matches:
 * - Answer: A
 * - **Answer: A**
 * - **Answer:** A
 * - ✅ Answer: A
 * - **✅ Answer: A**
 * - **✅ Answer:** A
 * - Correct Answer: A
 * - **Correct Answer:** A
 * - **Correct Answer: A**
 * - Answer: Option A
 * - Answer: (A)
 * - Ans: A
 * - **Ans: A**
 */
function matchAnswer(line: string): string | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const answerRegex =
    /^\s*(?:\*{1,2})?\s*(?:[✅✔️✔]\s*)?(?:Correct\s+)?(?:Answer|Ans)\s*:\s*(?:\*{1,2})?\s*(?:Option\s+)?\(?([A-Za-z0-9])\)?(?:\*{1,2})?(?:\s*.*)?$/i;
  const match = trimmed.match(answerRegex);
  if (match) {
    return match[1].toUpperCase();
  }

  return null;
}

/**
 * Explanation match:
 * Matches:
 * - Explanation: ...
 * - **Explanation:** ...
 * - **Explanation**: ...
 * - 💡 Explanation: ...
 */
function matchExplanationHeader(line: string): { isHeader: boolean; textRemainder: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const expRegex =
    /^\s*(?:\*{1,2})?\s*(?:[💡\s]*)?Explanation\s*:\s*(?:\*{1,2})?\s*(.*)$/i;
  const match = trimmed.match(expRegex);
  if (match) {
    return {
      isHeader: true,
      textRemainder: cleanOuterBold(match[1]),
    };
  }

  return null;
}

/**
 * Raw Question Block collected from document lines
 */
interface RawBlock {
  headerNum: number | null;
  lines: string[];
}

/**
 * Step 2: Detect likely question blocks
 *
 * Scans through document lines. Detects question start lines.
 * Verifies that candidate blocks contain MCQ features (options or answer)
 * to avoid misidentifying numbered lists or section headers as questions.
 */
function detectQuestionBlocks(allLines: string[]): RawBlock[] {
  // Find all line indices that look like candidate question headers
  interface Candidate {
    lineIndex: number;
    qNum: number | null;
    textRemainder: string;
  }

  const candidates: Candidate[] = [];

  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];
    const headerMatch = matchQuestionHeader(line);
    if (headerMatch) {
      candidates.push({
        lineIndex: i,
        qNum: headerMatch.qNum,
        textRemainder: headerMatch.textRemainder,
      });
    }
  }

  if (candidates.length === 0) {
    return [];
  }

  // Filter candidates: A valid question candidate MUST contain at least one option line
  // or answer line before the next candidate or section end.
  const validCandidates: Candidate[] = [];

  for (let c = 0; c < candidates.length; c++) {
    const current = candidates[c];
    const nextLineIndex =
      c + 1 < candidates.length ? candidates[c + 1].lineIndex : allLines.length;

    // Scan lines in this candidate's range
    let hasOptionOrAnswer = false;
    for (let j = current.lineIndex; j < nextLineIndex; j++) {
      const line = allLines[j];
      if (isNonQuestionSection(line)) {
        break;
      }
      if (matchOption(line) || matchAnswer(line)) {
        hasOptionOrAnswer = true;
        break;
      }
    }

    if (hasOptionOrAnswer) {
      validCandidates.push(current);
    }
  }

  if (validCandidates.length === 0) {
    return [];
  }

  // Construct raw blocks from valid candidates
  const blocks: RawBlock[] = [];

  for (let c = 0; c < validCandidates.length; c++) {
    const current = validCandidates[c];
    const nextLineIndex =
      c + 1 < validCandidates.length
        ? validCandidates[c + 1].lineIndex
        : allLines.length;

    const blockLines: string[] = [];

    for (let j = current.lineIndex; j < nextLineIndex; j++) {
      const line = allLines[j];

      // If we encounter a non-question section (like ## Answer Key Summary, table, etc.),
      // stop collecting lines for this question.
      if (isNonQuestionSection(line)) {
        break;
      }

      // If a horizontal rule is followed by a non-question section, stop here too
      if (isHorizontalRule(line)) {
        // Look ahead for non-question section
        let nextNonEmpty = "";
        for (let k = j + 1; k < nextLineIndex; k++) {
          if (allLines[k].trim()) {
            nextNonEmpty = allLines[k].trim();
            break;
          }
        }
        if (nextNonEmpty && isNonQuestionSection(nextNonEmpty)) {
          break;
        }
      }

      blockLines.push(line);
    }

    blocks.push({
      headerNum: current.qNum,
      lines: blockLines,
    });
  }

  return blocks;
}

/**
 * Parsed components of a question block
 */
interface ParsedBlockData {
  qNum: number;
  questionText: string;
  options: Map<string, string>;
  correctAnswer: string | null;
  explanation: string;
}

/**
 * Steps 3, 4, 5, 6: Extract question text, options, answer, explanation
 */
function parseBlock(block: RawBlock, fallbackIndex: number): ParsedBlockData {
  const qNum = block.headerNum ?? fallbackIndex;
  const lines = block.lines;

  let questionText = "";
  const options = new Map<string, string>();
  let currentOptionLabel: string | null = null;
  let correctAnswer: string | null = null;
  let explanation = "";

  type ParseState = "QUESTION" | "OPTIONS" | "EXPLANATION";
  let state: ParseState = "QUESTION";

  // First line is the question header line
  if (lines.length > 0) {
    const headerMatch = matchQuestionHeader(lines[0]);
    if (headerMatch && headerMatch.textRemainder) {
      questionText = headerMatch.textRemainder;
    }
  }

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // Check for answer line
    const ansMatch = matchAnswer(line);
    if (ansMatch) {
      correctAnswer = ansMatch;
      currentOptionLabel = null;
      continue;
    }

    // Check for explanation header
    const expHeader = matchExplanationHeader(line);
    if (expHeader) {
      state = "EXPLANATION";
      currentOptionLabel = null;
      if (expHeader.textRemainder) {
        explanation = expHeader.textRemainder;
      }
      continue;
    }

    // Check for option line
    const optMatch = matchOption(line);
    if (optMatch && state !== "EXPLANATION") {
      state = "OPTIONS";
      currentOptionLabel = optMatch.label;
      options.set(optMatch.label, optMatch.text);
      continue;
    }

    // Continuation handling based on state
    if (state === "QUESTION") {
      // Ignore horizontal rules and empty lines before question text starts
      if (isHorizontalRule(line)) continue;
      if (!trimmed && !questionText) continue;

      if (trimmed) {
        questionText = questionText ? `${questionText} ${cleanOuterBold(trimmed)}` : cleanOuterBold(trimmed);
      }
    } else if (state === "OPTIONS") {
      if (currentOptionLabel && trimmed && !isHorizontalRule(line)) {
        // Multi-line option continuation
        const existing = options.get(currentOptionLabel) || "";
        options.set(
          currentOptionLabel,
          existing ? `${existing} ${cleanOuterBold(trimmed)}` : cleanOuterBold(trimmed)
        );
      }
    } else if (state === "EXPLANATION") {
      if (isHorizontalRule(line)) continue;

      if (!trimmed) {
        // Preserve paragraph breaks in multi-paragraph explanations
        if (explanation && !explanation.endsWith("\n\n")) {
          explanation += "\n\n";
        }
      } else {
        if (explanation.endsWith("\n\n")) {
          explanation += cleanOuterBold(trimmed);
        } else {
          explanation = explanation ? `${explanation} ${cleanOuterBold(trimmed)}` : cleanOuterBold(trimmed);
        }
      }
    }
  }

  return {
    qNum,
    questionText: cleanOuterBold(questionText),
    options,
    correctAnswer,
    explanation: explanation.trim(),
  };
}

/**
 * Step 7: Validate the question
 *
 * Enforces:
 * - Question text is non-empty
 * - 4 options (A-D)
 * - Valid answer A-D
 * - Explanation is non-empty
 *
 * Does NOT invent missing information.
 */
function validateQuestion(
  data: ParsedBlockData
): { question: Question | null; error: ParseError | null } {
  const { qNum, questionText, options, correctAnswer, explanation } = data;

  // 1. Question text
  if (!questionText) {
    return {
      question: null,
      error: {
        questionNumber: qNum,
        message: "Missing question text",
      },
    };
  }

  // 2. Options: Exactly A, B, C, D required for V1
  const requiredLabels = ["A", "B", "C", "D"];
  const missingOptions = requiredLabels.filter((label) => !options.has(label));

  if (missingOptions.length > 0) {
    let msg: string;
    if (missingOptions.length === 1) {
      msg = `Missing option ${missingOptions[0]}`;
    } else {
      msg = `Missing options ${missingOptions.join(", ")}`;
    }
    return {
      question: null,
      error: {
        questionNumber: qNum,
        message: msg,
      },
    };
  }

  // 3. Answer
  if (!correctAnswer) {
    return {
      question: null,
      error: {
        questionNumber: qNum,
        message: "Missing answer",
      },
    };
  }

  if (!requiredLabels.includes(correctAnswer)) {
    return {
      question: null,
      error: {
        questionNumber: qNum,
        message: `Invalid answer "${correctAnswer}" (expected A, B, C, or D)`,
      },
    };
  }

  if (!options.has(correctAnswer)) {
    return {
      question: null,
      error: {
        questionNumber: qNum,
        message: `Answer "${correctAnswer}" does not match any provided option`,
      },
    };
  }

  // 4. Explanation
  if (!explanation) {
    return {
      question: null,
      error: {
        questionNumber: qNum,
        message: "Missing explanation",
      },
    };
  }

  // Construct structured Question
  const questionOptions: QuestionOption[] = requiredLabels.map((label) => ({
    label,
    text: options.get(label) || "",
  }));

  const question: Question = {
    id: qNum,
    text: questionText,
    options: questionOptions,
    correctAnswer,
    explanation,
  };

  return { question, error: null };
}

/**
 * Main parse entry point:
 * Converts standardized .md MCQ files into structured Question objects.
 */
export function parseMarkdownQuiz(content: string): ParseResult {
  const questions: Question[] = [];
  const errors: ParseError[] = [];

  if (!content || content.trim().length === 0) {
    errors.push({
      questionNumber: null,
      message: "Unable to read file: The file is empty.",
    });
    return { questions, errors, detectedCount: 0 };
  }

  // Step 1: Normalize Markdown & Whitespace
  const normalized = normalizeMarkdown(content);
  const lines = normalized.split("\n");

  // Step 2: Detect likely question blocks
  const blocks = detectQuestionBlocks(lines);

  if (blocks.length === 0) {
    errors.push({
      questionNumber: null,
      message: "Unable to read file: No quiz questions were detected in the document.",
    });
    return { questions, errors, detectedCount: 0 };
  }

  const detectedCount = blocks.length;

  // Steps 3-7: Parse and validate each block
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    const data = parseBlock(block, i + 1);
    const result = validateQuestion(data);

    if (result.error) {
      errors.push(result.error);
    }
    if (result.question) {
      questions.push(result.question);
    }
  }

  // If questions were detected but ZERO were valid
  if (questions.length === 0 && errors.length > 0) {
    // Keep the specific errors so the user can diagnose why
    const hasZeroValidNotice = errors.some((e) => e.questionNumber === null);
    if (!hasZeroValidNotice) {
      errors.unshift({
        questionNumber: null,
        message: `Unable to read file: Found ${detectedCount} potential question(s), but none could be parsed as valid MCQs.`,
      });
    }
  }

  return { questions, errors, detectedCount };
}
