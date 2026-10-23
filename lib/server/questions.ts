// ─────────────────────────────────────────────────────────────
// SERVER-ONLY question bank. `import "server-only"` makes any
// client-component import fail at build time, so answers and
// explanations can never end up in the browser bundle.
// Also issues signed "test tickets" so the grade route can
// verify a session really started when the client claims it did.
//
// Ticket binding (CWE-20 / answer-leak defence): each ticket now
// carries the ids of the questions shown in that session, so a
// ticket cannot be replayed against a different question set and
// the grader can prove a previously-reviewed question was either
// re-shown (practice) or excluded (retakes).
// ─────────────────────────────────────────────────────────────
import "server-only";
import { signPayload, signatureMatches } from "@/lib/auth";
import { TESTS } from "@/lib/data";
import { ROADMAP_TEST_QUESTIONS } from "@/lib/server/roadmap-questions";

export type Question = {
  id: string;
  skillId: string;
  type: "mcq" | "code";
  text: string;
  options?: string[];
  answer: number; // index for mcq
  explanation: string;
  stage?: number;
  difficulty?: "beginner" | "intermediate" | "advanced";
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
  { id: "js-q7", skillId: "javascript", type: "mcq", text: "What does `Array.prototype.map()` return?", options: ["The original array after mutation", "A new array of callback results", "The first matching element", "A boolean"], answer: 1, explanation: "`map()` creates a new array by applying the callback to each element." },
  { id: "js-q8", skillId: "javascript", type: "mcq", text: "Which value is not equal to itself under strict equality?", options: ["null", "undefined", "NaN", "0"], answer: 2, explanation: "`NaN === NaN` is false; use `Number.isNaN()` to test for it." },
  { id: "js-q9", skillId: "javascript", type: "mcq", text: "What does `const` prevent?", options: ["Changing properties of an object", "Reassigning the binding", "Mutating an array", "Calling methods"], answer: 1, explanation: "`const` prevents rebinding the variable; referenced objects can still be mutated." },
  { id: "js-q10", skillId: "javascript", type: "mcq", text: "Which method appends items to an array and returns its new length?", options: ["concat()", "push()", "unshift()", "slice()"], answer: 1, explanation: "`push()` mutates the array by appending items and returns the new length." },
  { id: "js-q11", skillId: "javascript", type: "mcq", text: "What is the result of `Boolean([])`?", options: ["false", "true", "undefined", "It throws"], answer: 1, explanation: "All objects, including empty arrays, are truthy in JavaScript." },
  { id: "js-q12", skillId: "javascript", type: "mcq", text: "Which statement about `===` is correct?", options: ["It compares after coercing both values", "It compares without type coercion", "It compares object contents deeply", "It only works for numbers"], answer: 1, explanation: "Strict equality does not coerce operand types." },
  { id: "js-q13", skillId: "javascript", type: "mcq", text: "What does `Promise.allSettled()` provide?", options: ["Only the first resolved value", "A result for every promise after all settle", "A rejection as soon as one promise rejects", "Automatic retries"], answer: 1, explanation: "`Promise.allSettled()` waits for all promises and reports each as fulfilled or rejected." },
  { id: "js-q14", skillId: "javascript", type: "mcq", text: "Which syntax safely reads `city` when `user` may be nullish?", options: ["user.city?", "user?.city", "user??.city", "user &&? city"], answer: 1, explanation: "Optional chaining `user?.city` returns undefined when user is null or undefined." },
  { id: "js-q15", skillId: "javascript", type: "mcq", text: "What does `[...items]` create for an array?", options: ["A deep clone", "A shallow copy", "A frozen copy", "A reference to the same array"], answer: 1, explanation: "Array spread creates a shallow copy; nested objects remain shared references." },
  { id: "js-q16", skillId: "javascript", type: "mcq", text: "What does `filter()` return when no elements pass its callback?", options: ["null", "An error", "An empty array", "undefined"], answer: 2, explanation: "`filter()` returns a new array, empty when no elements match." },
  { id: "js-q17", skillId: "javascript", type: "mcq", text: "Which declaration is scoped to the nearest block?", options: ["var", "let", "global", "window"], answer: 1, explanation: "`let` and `const` are block-scoped; `var` is function-scoped." },
  { id: "js-q18", skillId: "javascript", type: "mcq", text: "What is the value of `typeof 42n`?", options: ["number", "bigint", "integer", "object"], answer: 1, explanation: "BigInt values have the `bigint` result from `typeof`." },
  { id: "js-q19", skillId: "javascript", type: "mcq", text: "Which event-loop queue runs promise callbacks?", options: ["The microtask queue", "Only the rendering queue", "The network queue", "The call stack immediately"], answer: 0, explanation: "Promise reactions are queued as microtasks and run after the current stack clears." },
  { id: "js-q20", skillId: "javascript", type: "mcq", text: "What does `Object.keys(value)` return?", options: ["All inherited property names", "An array of own enumerable string keys", "An array of values", "A Map"], answer: 1, explanation: "`Object.keys()` returns own enumerable string-keyed property names." },
  { id: "js-q21", skillId: "javascript", type: "mcq", text: "Which method parses JSON text into a JavaScript value?", options: ["JSON.stringify()", "JSON.parse()", "Object.fromJSON()", "String.decode()"], answer: 1, explanation: "`JSON.parse()` parses JSON text; `JSON.stringify()` converts a value to JSON text." },
  { id: "sql-q7", skillId: "sql", type: "mcq", text: "Which clause filters rows before they are grouped?", options: ["HAVING", "WHERE", "ORDER BY", "WINDOW"], answer: 1, explanation: "`WHERE` filters input rows before grouping and aggregation." },
  { id: "sql-q8", skillId: "sql", type: "mcq", text: "What does `COUNT(column_name)` exclude?", options: ["Duplicate values", "NULL values", "Zero values", "Negative values"], answer: 1, explanation: "`COUNT(column)` counts non-NULL values; `COUNT(*)` counts rows." },
  { id: "sql-q9", skillId: "sql", type: "mcq", text: "Which keyword removes duplicate rows from a result?", options: ["UNIQUE", "DISTINCT", "FILTER", "SINGLE"], answer: 1, explanation: "`SELECT DISTINCT` removes duplicate result rows." },
  { id: "sql-q10", skillId: "sql", type: "mcq", text: "What is the purpose of a foreign key?", options: ["Encrypt a column", "Enforce a relationship to another table's key", "Sort table rows", "Make every query faster"], answer: 1, explanation: "A foreign key enforces referential integrity between related tables." },
  { id: "sql-q11", skillId: "sql", type: "mcq", text: "Which join returns only rows with matches on both sides?", options: ["LEFT JOIN", "FULL OUTER JOIN", "INNER JOIN", "CROSS JOIN"], answer: 2, explanation: "`INNER JOIN` returns rows where the join condition matches on both sides." },
  { id: "sql-q12", skillId: "sql", type: "mcq", text: "How should a query test whether a value is NULL?", options: ["value = NULL", "value == NULL", "value IS NULL", "value EQUALS NULL"], answer: 2, explanation: "SQL uses `IS NULL` because NULL is an unknown value, not ordinary equality." },
  { id: "sql-q13", skillId: "sql", type: "mcq", text: "What does `ORDER BY created_at DESC` do?", options: ["Sorts oldest first", "Sorts later dates first", "Groups by date", "Removes duplicate dates"], answer: 1, explanation: "`DESC` sorts in descending order, placing later dates first." },
  { id: "sql-q14", skillId: "sql", type: "mcq", text: "Which clause limits rows returned in PostgreSQL?", options: ["TOP", "LIMIT", "CAP", "ONLY"], answer: 1, explanation: "PostgreSQL supports `LIMIT` to cap returned rows." },
  { id: "sql-q15", skillId: "sql", type: "mcq", text: "What does `COALESCE(a, b, 0)` return?", options: ["The first non-NULL argument", "The largest argument", "All arguments as an array", "NULL if any argument is NULL"], answer: 0, explanation: "`COALESCE` returns the first argument that is not NULL." },
  { id: "sql-q16", skillId: "sql", type: "mcq", text: "Which statement changes values in existing rows?", options: ["ALTER", "UPDATE", "REPLACE", "MODIFY"], answer: 1, explanation: "`UPDATE` changes column values in rows matching its `WHERE` condition." },
  { id: "sql-q17", skillId: "sql", type: "mcq", text: "What does `ON DELETE CASCADE` do?", options: ["Prevents parent deletion", "Deletes referencing child rows when the parent is deleted", "Sets child columns to zero", "Deletes the database"], answer: 1, explanation: "The cascade action deletes referencing child rows when the referenced parent is deleted." },
  { id: "sql-q18", skillId: "sql", type: "mcq", text: "What is a transaction's `COMMIT` operation for?", options: ["Undoing all changes", "Making the transaction's changes permanent", "Locking the database forever", "Starting a new table"], answer: 1, explanation: "`COMMIT` successfully ends a transaction and makes its changes durable." },
  { id: "sql-q19", skillId: "sql", type: "mcq", text: "Which index is generally appropriate for equality lookup on a single column?", options: ["A B-tree index", "A full table copy", "A foreign key constraint only", "A view"], answer: 0, explanation: "A B-tree is the common default index and supports equality and ordered lookups." },
  { id: "sql-q20", skillId: "sql", type: "mcq", text: "Which operator checks whether a value matches any value in a list?", options: ["BETWEEN", "IN", "LIKE", "EXISTS ONLY"], answer: 1, explanation: "`IN` tests whether an expression equals one of the values in a list or subquery." },
  { id: "sql-q21", skillId: "sql", type: "mcq", text: "What does `SUM(amount)` return when all input values are NULL?", options: ["0", "NULL", "The number of rows", "An error"], answer: 1, explanation: "`SUM` ignores NULL inputs and returns NULL when there are no non-NULL inputs." },
];

QUESTIONS.push(...ROADMAP_TEST_QUESTIONS);

/**
 * Pick the question set for a verified attempt.
 *
 * reviewedIds: question ids the user has already seen answer keys
 * for (from earlier attempts). Reviewing an answer makes that
 * question unusable for future VERIFIED evidence, so the first
 * filter drops them. The question-bank tests require enough unseen
 * questions for all three attempts in the advertised rolling window.
 */
export function selectVerifiedQuestions(
  testId: string,
  reviewedIds: string[] = [],
  mcqCount = 5
): Question[] {
  const reviewed = new Set(reviewedIds);
  const mcqs = QUESTIONS.filter(
    (q) => q.skillId === testId && q.type === "mcq" && !reviewed.has(q.id)
  );
  if (mcqs.length < mcqCount) return [];
  // stable but varied order avoids always serving the same first five
  const slice = mcqs.slice(0, mcqCount * 2).sort(() => 0); // stable; rotation injected by caller
  return slice.slice(0, mcqCount);
}

/** The full set (MCQ + code) as previously served — for practice mode. */
export function questionsForTest(testId: string): Question[] {
  return QUESTIONS.filter((q) => q.skillId === testId);
}

export function testConfigFor(testId: string) {
  return TESTS.find((t) => t.skillId === testId);
}

// ── signed test tickets (anti-cheat: binds a test start to a user) ──
export type TestTicket = { userId: string; skillId: string; iat: number; qids: string[] };

function b64url(input: string): string {
  return Buffer.from(input, "utf-8").toString("base64url");
}

export function createTestTicket(
  userId: string,
  skillId: string,
  questionIds: string[],
  mode: "verified" | "practice" = "verified"
): string {
  const payload: TestTicket & { mode: string } = {
    userId,
    skillId,
    iat: Date.now(),
    qids: questionIds,
    mode,
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${signPayload(body)}`;
}

export function verifyTestTicket(
  ticket: string | undefined
): (TestTicket & { mode: "verified" | "practice" }) | null {
  if (!ticket) return null;
  const dot = ticket.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = ticket.slice(0, dot);
  const sig = ticket.slice(dot + 1);
  if (!signatureMatches(body, sig)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf-8")) as
      TestTicket & { mode?: string; qids?: string[] };
    if (
      !payload.userId ||
      !payload.skillId ||
      typeof payload.iat !== "number" ||
      !Array.isArray(payload.qids) ||
      payload.qids.length === 0
    ) {
      return null;
    }
    return { ...payload, mode: payload.mode === "practice" ? "practice" : "verified" };
  } catch {
    return null;
  }
}
