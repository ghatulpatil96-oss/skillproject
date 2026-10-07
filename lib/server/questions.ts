// ─────────────────────────────────────────────────────────────
// SERVER-ONLY question bank. `import "server-only"` makes any
// client-component import fail at build time, so answers and
// explanations can never end up in the browser bundle.
// Also issues signed "test tickets" so the grade route can
// verify a session really started when the client claims it did.
// ─────────────────────────────────────────────────────────────
import "server-only";
import { signPayload, signatureMatches } from "@/lib/auth";
import { TESTS } from "@/lib/data";

export type Question = {
  id: string;
  skillId: string;
  type: "mcq" | "code";
  text: string;
  options?: string[];
  answer: number; // index for mcq
  explanation: string;
};

export const QUESTIONS: Question[] = [
  {
    id: "js-q1",
    skillId: "javascript",
    type: "mcq",
    text: "What is the output of: `typeof null`?",
    options: ["\"null\"", "\"object\"", "\"undefined\"", "throws an error"],
    answer: 1,
    explanation: "typeof null returns \"object\" — a historical bug kept for backwards compatibility.",
  },
  {
    id: "js-q2",
    skillId: "javascript",
    type: "mcq",
    text: "Which method creates a new array with elements that pass a test?",
    options: ["map()", "forEach()", "filter()", "reduce()"],
    answer: 2,
    explanation: "filter() returns a new array containing only elements where the callback returns true.",
  },
  {
    id: "js-q3",
    skillId: "javascript",
    type: "mcq",
    text: "What does `Promise.all` do when one promise rejects?",
    options: [
      "Waits for all, then aggregates errors",
      "Immediately rejects with the first error",
      "Retries the failed promise",
      "Ignores the rejection",
    ],
    answer: 1,
    explanation: "Promise.all is fail-fast: it rejects immediately with the first rejection reason. (Promise.allSettled waits for all.)",
  },
  {
    id: "js-q4",
    skillId: "javascript",
    type: "mcq",
    text: "In a browser, what is `this` inside an arrow function defined at module top-level?",
    options: ["The global object", "undefined", "The module", "Depends on the caller"],
    answer: 1,
    explanation: "Arrow functions have no own `this`; at ES module top level `this` is undefined.",
  },
  {
    id: "js-q5",
    skillId: "javascript",
    type: "mcq",
    text: "Which is NOT a JavaScript primitive type?",
    options: ["symbol", "bigint", "array", "boolean"],
    answer: 2,
    explanation: "Arrays are objects. Primitives: string, number, bigint, boolean, undefined, symbol, null.",
  },
  {
    id: "js-q6",
    skillId: "javascript",
    type: "code",
    text: "Write a function `firstUnique(str)` that returns the first non-repeating character of a string (lowercase a–z input). e.g. firstUnique(\"skillbridge\") → \"k\".",
    answer: -1,
    explanation: "Two passes: count frequency in a map, then return the first char with count 1. O(n) time, O(1) space.",
  },
  {
    id: "sql-q1",
    skillId: "sql",
    type: "mcq",
    text: "Which SQL clause filters rows AFTER grouping?",
    options: ["WHERE", "HAVING", "ORDER BY", "LIMIT"],
    answer: 1,
    explanation: "WHERE filters before grouping; HAVING filters aggregate results after GROUP BY.",
  },
  {
    id: "sql-q2",
    skillId: "sql",
    type: "mcq",
    text: "What does a LEFT JOIN return?",
    options: [
      "Only matching rows from both tables",
      "All rows from the left table, matched rows from the right (NULL if no match)",
      "All rows from both tables",
      "Only rows missing in the right table",
    ],
    answer: 1,
    explanation: "LEFT JOIN keeps every left-table row; right columns become NULL when there's no match.",
  },
  {
    id: "sql-q3",
    skillId: "sql",
    type: "mcq",
    text: "An index on a column mainly improves…",
    options: ["INSERT speed", "SELECT query speed", "Disk usage", "Backup speed"],
    answer: 1,
    explanation: "Indexes speed up reads (SELECT/JOIN/ORDER BY) at the cost of slower writes and extra storage.",
  },
  {
    id: "sql-q4",
    skillId: "sql",
    type: "mcq",
    text: "Which query counts employees per department?",
    options: [
      "SELECT dept, COUNT(*) FROM employees",
      "SELECT dept, COUNT(*) FROM employees GROUP BY dept",
      "SELECT dept, SUM(*) FROM employees GROUP BY dept",
      "COUNT(dept) FROM employees",
    ],
    answer: 1,
    explanation: "Aggregates need GROUP BY for per-group counts; SUM(*) is invalid.",
  },
  {
    id: "sql-q5",
    skillId: "sql",
    type: "mcq",
    text: "Which normal form removes transitive dependencies?",
    options: ["1NF", "2NF", "3NF", "BCNF"],
    answer: 2,
    explanation: "3NF eliminates transitive dependencies (non-key → non-key).",
  },
  {
    id: "sql-q6",
    skillId: "sql",
    type: "code",
    text: "Write a query to return the 2nd highest salary from a table `employees(salary)`. Handle ties: return NULL if it doesn't exist.",
    answer: -1,
    explanation: "Classic: SELECT MAX(salary) FROM employees WHERE salary < (SELECT MAX(salary) FROM employees); or use OFFSET with DISTINCT.",
  },
];

export function questionsForTest(testId: string): Question[] {
  return QUESTIONS.filter((q) => q.skillId === testId);
}

export function testConfigFor(testId: string) {
  return TESTS.find((t) => t.skillId === testId);
}

// ── signed test tickets (anti-cheat: binds a test start to a user) ──
export type TestTicket = { userId: string; skillId: string; iat: number };

function b64url(input: string): string {
  return Buffer.from(input, "utf-8").toString("base64url");
}

export function createTestTicket(userId: string, skillId: string): string {
  const payload: TestTicket = { userId, skillId, iat: Date.now() };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${signPayload(body)}`;
}

export function verifyTestTicket(ticket: string | undefined): TestTicket | null {
  if (!ticket) return null;
  const dot = ticket.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = ticket.slice(0, dot);
  const sig = ticket.slice(dot + 1);
  if (!signatureMatches(body, sig)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as TestTicket;
    if (!payload.userId || !payload.skillId || typeof payload.iat !== "number") return null;
    return payload;
  } catch {
    return null;
  }
}
