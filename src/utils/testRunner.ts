import { JSDOM } from "jsdom";
const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>");
(global as any).window = dom.window;
(global as any).document = dom.window.document;

import { parseMarkdownQuiz } from "./parser";
import { sanitize } from "./sanitize";
import fs from "fs";

console.log("=== RUNNING QUIZFLOW LOGIC & PARSER TESTS ===");

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    console.log(`✅ PASS: ${msg}`);
    passed++;
  } else {
    console.error(`❌ FAIL: ${msg}`);
    failed++;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Required test: Uploaded sample file (INT250_sample.md)
// ─────────────────────────────────────────────────────────────────────────────
if (fs.existsSync("./INT250_sample.md")) {
  const sampleMd = fs.readFileSync("./INT250_sample.md", "utf-8");
  const sampleRes = parseMarkdownQuiz(sampleMd);

  assert(sampleRes.detectedCount === 30, "INT250: 30 questions detected");
  assert(sampleRes.questions.length === 30, "INT250: 30 questions valid");
  assert(sampleRes.errors.length === 0, "INT250: 0 errors");

  // Verify Q30 explanation does not contain Answer Key Summary table or distribution check
  const q30Exp = sampleRes.questions[29].explanation;
  assert(
    !q30Exp.includes("Answer Key Summary") &&
      !q30Exp.includes("Distribution check") &&
      !q30Exp.includes("| Q | Ans |"),
    "INT250: Q30 explanation cleanly excludes Answer Key table and Distribution check"
  );
  assert(
    q30Exp.includes("While conceptually similar"),
    "INT250: Q30 explanation contains the actual explanation text"
  );
} else {
  console.warn("⚠️ Warning: INT250_sample.md not found in workspace");
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. Standard sample-quiz.md test
// ─────────────────────────────────────────────────────────────────────────────
if (fs.existsSync("./sample-quiz.md")) {
  const sampleContent = fs.readFileSync("./sample-quiz.md", "utf-8");
  const sampleResult = parseMarkdownQuiz(sampleContent);

  assert(sampleResult.questions.length === 10, "Parsed exactly 10 questions from sample-quiz.md");
  assert(sampleResult.errors.length === 0, "No errors on valid sample-quiz.md");
  assert(sampleResult.questions[0].correctAnswer === "B", "Q1 answer is B");
  assert(sampleResult.questions[0].options.length === 4, "Q1 has 4 options");
  assert(sampleResult.questions[0].explanation.includes("legacy bug"), "Q1 explanation parsed correctly");
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. Tolerant heading variations test:
//    - ### Q1. ...
//    - ## Q1. ...
//    - Q1. ...
//    - Q1) ...
//    - Q1: ...
//    - Question 1: ...
//    - 1. ...
//    - 1) ...
//    - **Q1.** ...
//    - **1.** ...
// ─────────────────────────────────────────────────────────────────────────────
const headingVariationsMd = `
# Course Title Without Any Questions Heading
### Section Overview

### Q1. Heading with three hashes?
A) Option A
B) Option B
C) Option C
D) Option D
**✅ Answer: A**
**Explanation:** Explanation 1.

## Q2. Heading with two hashes?
A) Option A
B) Option B
C) Option C
D) Option D
**Answer: B**
Explanation: Explanation 2.

Q3. Heading with no hashes dot format?
A) Option A
B) Option B
C) Option C
D) Option D
✅ Answer: C
Explanation: Explanation 3.

Q4) Heading with parenthesis?
A) Option A
B) Option B
C) Option C
D) Option D
Answer: D
Explanation: Explanation 4.

Q5: Heading with colon?
A) Option A
B) Option B
C) Option C
D) Option D
Correct Answer: A
Explanation: Explanation 5.

Question 6: Word Question followed by colon?
A) Option A
B) Option B
C) Option C
D) Option D
**Correct Answer: B**
Explanation: Explanation 6.

7. Numbered list with dot?
A) Option A
B) Option B
C) Option C
D) Option D
**Ans: C**
Explanation: Explanation 7.

8) Numbered list with parenthesis?
A) Option A
B) Option B
C) Option C
D) Option D
**Ans: D**
Explanation: Explanation 8.

**Q9.** Bold question header?
A) Option A
B) Option B
C) Option C
D) Option D
Answer: A
Explanation: Explanation 9.

**10.** Bold numbered question header?
A) Option A
B) Option B
C) Option C
D) Option D
Answer: B
Explanation: Explanation 10.
`;

const headingsRes = parseMarkdownQuiz(headingVariationsMd);
assert(headingsRes.detectedCount === 10, "Headings: Detected 10 varied heading formats");
assert(headingsRes.questions.length === 10, "Headings: All 10 varied heading questions are valid");
assert(headingsRes.errors.length === 0, "Headings: 0 errors");
assert(headingsRes.questions[0].id === 1, "Q1 parsed");
assert(headingsRes.questions[5].id === 6, "Question 6 parsed");
assert(headingsRes.questions[6].id === 7, "7. parsed");
assert(headingsRes.questions[7].id === 8, "8) parsed");
assert(headingsRes.questions[8].id === 9, "**Q9.** parsed");
assert(headingsRes.questions[9].id === 10, "**10.** parsed");

// ─────────────────────────────────────────────────────────────────────────────
// 4. Option variations, multi-line questions, and multi-paragraph explanations
// ─────────────────────────────────────────────────────────────────────────────
const complexFormattingMd = `
### Q1. This is a multi-line question
that continues on the second line
and even on the third line?

A. Option A with period
continued on another line

(B) Option B with parenthesis
wrapped across lines

**C)** Option C in bold

- D) Option D as list bullet

**✅ Answer: B**

**Explanation:** This is the first paragraph of the explanation.

This is the second paragraph with more technical details.

And a third concluding paragraph.

---

### Q2. Horizontal separator above and varied options:
* A) Star bullet option
+ B) Plus bullet option
C: Colon option
D - Dash option
**Answer: Option A**
Explanation: Short explanation.
`;

const complexRes = parseMarkdownQuiz(complexFormattingMd);
assert(complexRes.questions.length === 2, "Complex formatting: 2 questions parsed");
assert(complexRes.errors.length === 0, "Complex formatting: 0 errors");
assert(complexRes.questions[0].text.includes("second line"), "Multi-line question text joined");
assert(complexRes.questions[0].options[0].text.includes("continued on another line"), "Multi-line option text joined");
assert(complexRes.questions[0].explanation.includes("third concluding paragraph"), "Multi-paragraph explanation preserved");
assert(complexRes.questions[0].correctAnswer === "B", "Complex Q1 answer B");
assert(complexRes.questions[1].correctAnswer === "A", "Complex Q2 answer A from 'Option A'");

// ─────────────────────────────────────────────────────────────────────────────
// 5. Partial parsing & graceful error reporting
//    Malformed questions do NOT reject the entire file.
// ─────────────────────────────────────────────────────────────────────────────
const partialParsingMd = `
### Q1. Valid question 1
A) Option A
B) Option B
C) Option C
D) Option D
**✅ Answer: A**
**Explanation:** Valid explanation.

### Q2. Malformed: missing option D
A) Option A
B) Option B
C) Option C
**✅ Answer: A**
**Explanation:** Missing option D here.

### Q3. Valid question 3
A) Option A
B) Option B
C) Option C
D) Option D
**✅ Answer: C**
**Explanation:** Valid explanation.

### Q4. Malformed: invalid answer E
A) Option A
B) Option B
C) Option C
D) Option D
**✅ Answer: E**
**Explanation:** Answer E is invalid.

### Q5. Malformed: missing explanation
A) Option A
B) Option B
C) Option C
D) Option D
**✅ Answer: B**
`;

const partialRes = parseMarkdownQuiz(partialParsingMd);
assert(partialRes.detectedCount === 5, "Partial parsing: 5 questions detected");
assert(partialRes.questions.length === 2, "Partial parsing: 2 valid questions preserved (Q1, Q3)");
assert(partialRes.errors.length === 3, "Partial parsing: 3 errors reported (Q2, Q4, Q5)");

const q2Err = partialRes.errors.find((e) => e.questionNumber === 2);
assert(q2Err !== undefined && q2Err.message.includes("Missing option D"), "Q2 reports 'Missing option D'");

const q4Err = partialRes.errors.find((e) => e.questionNumber === 4);
assert(q4Err !== undefined && q4Err.message.includes('Invalid answer "E"'), 'Q4 reports Invalid answer "E"');

const q5Err = partialRes.errors.find((e) => e.questionNumber === 5);
assert(q5Err !== undefined && q5Err.message.includes("Missing explanation"), "Q5 reports 'Missing explanation'");

// ─────────────────────────────────────────────────────────────────────────────
// 6. Non-question content ignored & zero questions error handling
// ─────────────────────────────────────────────────────────────────────────────
const nonQuestionMd = `
# Document Title: Advanced Operating Systems
## Syllabus & Objectives
This document contains general notes and syllabus outlines.

| Unit | Topic | Hours |
|---|---|---|
| 1 | File Systems | 10 |
| 2 | Kernel Memory | 12 |

## Answer Key Summary
| Q | Ans |
|---|---|
| 1 | A |

**Distribution check:** A=10, B=10
`;

const nonQuestionRes = parseMarkdownQuiz(nonQuestionMd);
assert(nonQuestionRes.questions.length === 0, "Non-question doc: 0 questions parsed");
assert(nonQuestionRes.detectedCount === 0, "Non-question doc: 0 questions detected");
assert(
  nonQuestionRes.errors.some((e) => e.message.startsWith("Unable to read file")),
  "Non-question doc: Reports 'Unable to read file' when 0 questions found"
);

// ─────────────────────────────────────────────────────────────────────────────
// 7. Scale performance test (250+ questions)
// ─────────────────────────────────────────────────────────────────────────────
let largeQuiz = "# 250 Questions Scale Test\n\n";
for (let i = 1; i <= 250; i++) {
  largeQuiz += `### Q${i}. Test question number ${i} with \`code\` snippet?\n\n`;
  largeQuiz += `A) Option alpha ${i}\n`;
  largeQuiz += `B) Option beta ${i}\n`;
  largeQuiz += `C) Option gamma ${i}\n`;
  largeQuiz += `D) Option delta ${i}\n\n`;
  largeQuiz += `**✅ Answer: ${["A", "B", "C", "D"][i % 4]}**\n\n`;
  largeQuiz += `**Explanation:** Detailed explanation for question ${i}.\n\n`;
}

const startTime = performance.now();
const largeResult = parseMarkdownQuiz(largeQuiz);
const parseDuration = performance.now() - startTime;

assert(largeResult.questions.length === 250, `Parsed all 250 questions successfully (took ${parseDuration.toFixed(1)}ms)`);
assert(parseDuration < 200, "250 questions parsed in under 200ms");

// ─────────────────────────────────────────────────────────────────────────────
// 8. Sanitization & XSS prevention
// ─────────────────────────────────────────────────────────────────────────────
const xssPayload =
  'Question with <script>alert("XSS")</script> and <img src="x" onerror="alert(1)"> and `const x = 10;` and **bold text**';
const sanitized = sanitize(xssPayload);
assert(!sanitized.includes("<script>"), "Script tag stripped by DOMPurify");
assert(!sanitized.includes("onerror"), "Event handler stripped by DOMPurify");
assert(sanitized.includes("<code"), "Code snippet formatted as safe <code> element");
assert(sanitized.includes("<strong"), "Bold text formatted as safe <strong> element");

console.log(`\n=== SUMMARY: ${passed} PASSED, ${failed} FAILED ===\n`);

if (failed > 0) {
  process.exit(1);
}
