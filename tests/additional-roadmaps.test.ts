import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { LESSONS } from "@/lib/lessons";
import { ROADMAPS, SKILLS, TESTS } from "@/lib/data";
import { QUESTIONS, questionsForTest } from "@/lib/server/questions";

const addedRoadmapIds = ["fullstack-dev", "python-dev", "java-dev", "devops-engineer"];
const addedSkillIds = ["fullstack", "python", "java", "devops"];

describe("additional learning roadmaps", () => {
  it("registers four unique roadmaps with complete topic lessons and matching tests", () => {
    expect(new Set(ROADMAPS.map((roadmap) => roadmap.id)).size).toBe(ROADMAPS.length);

    const roadmaps = addedRoadmapIds.map((id) => {
      const roadmap = ROADMAPS.find((entry) => entry.id === id);
      expect(roadmap).toBeDefined();
      return roadmap!;
    });
    const allTopicIds = ROADMAPS.flatMap((roadmap) =>
      roadmap.stages.flatMap((stage) => stage.topics.map((topic) => topic.id))
    );
    expect(new Set(allTopicIds).size).toBe(allTopicIds.length);

    for (const roadmap of roadmaps) {
      expect(roadmap.stages.length).toBeGreaterThanOrEqual(2);
      expect(roadmap.stages.length).toBeLessThanOrEqual(4);
      expect(roadmap.stages[roadmap.stages.length - 1]?.name).toBe("Job-Ready");
      expect(roadmap.stages.flatMap((stage) => stage.topics).reduce((sum, topic) => sum + topic.hours, 0))
        .toBe(roadmap.totalHours);
      expect(roadmap.skills.every((skillId) => SKILLS.some((skill) => skill.id === skillId))).toBe(true);

      for (const topic of roadmap.stages.flatMap((stage) => stage.topics)) {
        const lesson = LESSONS.find((entry) => entry.topicId === topic.id);
        expect(lesson, `lesson for ${topic.id}`).toBeDefined();
        expect(lesson?.questions, `questions for ${topic.id}`).toHaveLength(5);
        expect(lesson?.questions?.every((question) =>
          question.options.length === 4 &&
          Number.isInteger(question.answer) &&
          question.answer >= 0 &&
          question.answer < question.options.length &&
          question.options[question.answer].length > 0
        )).toBe(true);
      }
    }

    for (const skillId of addedSkillIds) {
      expect(TESTS.filter((test) => test.skillId === skillId)).toHaveLength(1);
    }
  });

  it("has 15 four-option questions per new test, spread over stages with the specified difficulty mix", () => {
    for (const skillId of addedSkillIds) {
      const bank = questionsForTest(skillId);
      expect(bank).toHaveLength(45);
      expect(bank.every((question) =>
        question.type === "mcq" &&
        question.options?.length === 4 &&
        Number.isInteger(question.answer) &&
        question.answer >= 0 &&
        question.answer < question.options.length &&
        question.options[question.answer].length > 0
      )).toBe(true);

      let unseen = bank;
      const seenIds = new Set<string>();
      for (let attempt = 0; attempt < 3; attempt++) {
        const available = unseen.filter((question) => !seenIds.has(question.id));
        const start = attempt % available.length;
        const rotated = [...available.slice(start), ...available.slice(0, start)];
        const questions = rotated.slice(0, 15);
        expect(questions).toHaveLength(15);
        expect(questions.filter((question) => question.difficulty === "beginner")).toHaveLength(5);
        expect(questions.filter((question) => question.difficulty === "intermediate")).toHaveLength(6);
        expect(questions.filter((question) => question.difficulty === "advanced")).toHaveLength(4);
        expect([1, 2, 3].map((stage) => questions.filter((question) => question.stage === stage).length))
          .toEqual([5, 6, 4]);
        expect(new Set(questions.map((question) => question.answer)).size).toBe(4);
        questions.forEach((question) => seenIds.add(question.id));
      }
      expect(seenIds.size).toBe(45);

      const config = TESTS.find((test) => test.skillId === skillId);
      expect(config).toMatchObject({ durationMin: 60, mcqCount: 15, codeCount: 0, passingScore: 70 });
      expect(Math.round((10 / 15) * 100)).toBeLessThan(config!.passingScore);
      expect(Math.round((11 / 15) * 100)).toBeGreaterThanOrEqual(config!.passingScore);
    }
  });

  it("keeps question text unique across the added topic quizzes and tests", () => {
    const addedTopicIds = ROADMAPS
      .filter((roadmap) => addedRoadmapIds.includes(roadmap.id))
      .flatMap((roadmap) => roadmap.stages.flatMap((stage) => stage.topics.map((topic) => topic.id)));
    const topicQuestions = LESSONS
      .filter((lesson) => addedTopicIds.includes(lesson.topicId))
      .flatMap((lesson) => lesson.questions ?? [])
      .map((question) => question.q);
    const testQuestions = addedSkillIds.flatMap((skillId) =>
      questionsForTest(skillId).map((question) => question.text)
    );
    const allTexts = [...topicQuestions, ...testQuestions].map((text) => text.trim().toLowerCase());

    expect(new Set(allTexts).size).toBe(allTexts.length);

    const existingTopicTexts = LESSONS
      .filter((lesson) => !addedTopicIds.includes(lesson.topicId))
      .flatMap((lesson) => lesson.questions ?? [])
      .map((question) => question.q.trim().toLowerCase());
    const mdxTopicTexts = readdirSync("content/lessons")
      .filter((file) => file.endsWith(".mdx"))
      .flatMap((file) => {
        const source = readFileSync(`content/lessons/${file}`, "utf-8");
        return [...source.matchAll(/\bq:\s*"((?:\\.|[^"\\])*)"/g)]
          .map((match) => match[1].replace(/\\"/g, "\"").trim().toLowerCase());
      });
    const existingTestTexts = QUESTIONS
      .filter((question) => !addedSkillIds.includes(question.skillId))
      .map((question) => question.text.trim().toLowerCase());
    const existingTexts = [...existingTopicTexts, ...mdxTopicTexts, ...existingTestTexts];
    expect(allTexts.some((text) => existingTexts.includes(text))).toBe(false);
  });
});
