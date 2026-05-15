import { describe, it, expect } from "vitest";
import { generateMockAnalysis } from "../lib/mockAI";

describe("mockAI", () => {
  it("generateMockAnalysis returns expected shape", () => {
    const analysis = generateMockAnalysis("I want a SIP investment for 5 years");
    expect(analysis).toHaveProperty("topic");
    expect(analysis).toHaveProperty("subTopic");
    expect(analysis).toHaveProperty("entities");
    expect(Array.isArray(analysis.entities)).toBe(true);
    expect(analysis).toHaveProperty("summary");
    expect(typeof analysis.summary).toBe("string");
  });
});
