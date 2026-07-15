import { describe, expect, it } from "vitest";
import { strokeSchema } from "../src/routes/digsite";
import { restoreSchema } from "../src/routes/artifacts";
import { submitSchema } from "../src/routes/lore";
import { postSchema } from "../src/routes/community";
import { generateSchema } from "../src/routes/civilization";
import { polishSchema, translateSchema, civSchema, summarySchema } from "../src/routes/ai";

describe("digsite strokeSchema", () => {
  it("accepts a valid stroke payload", () => {
    const result = strokeSchema.safeParse({ layerId: crypto.randomUUID(), toolId: "brush", clearedDelta: 0.05 });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown tool id", () => {
    const result = strokeSchema.safeParse({ layerId: crypto.randomUUID(), toolId: "laser", clearedDelta: 0.05 });
    expect(result.success).toBe(false);
  });

  it("rejects clearedDelta outside 0-1", () => {
    const result = strokeSchema.safeParse({ layerId: crypto.randomUUID(), toolId: "brush", clearedDelta: 1.5 });
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid layerId", () => {
    const result = strokeSchema.safeParse({ layerId: "not-a-uuid", toolId: "brush", clearedDelta: 0.1 });
    expect(result.success).toBe(false);
  });
});

describe("artifacts restoreSchema", () => {
  it("accepts quality deltas within +/-20", () => {
    expect(restoreSchema.safeParse({ qualityDelta: 15 }).success).toBe(true);
    expect(restoreSchema.safeParse({ qualityDelta: -20 }).success).toBe(true);
  });

  it("rejects quality deltas outside +/-20 (prevents one restoration session maxing an artifact)", () => {
    expect(restoreSchema.safeParse({ qualityDelta: 21 }).success).toBe(false);
    expect(restoreSchema.safeParse({ qualityDelta: -21 }).success).toBe(false);
  });
});

describe("lore submitSchema", () => {
  it("rejects lore bodies under 3 characters (prevents empty/spam submissions)", () => {
    expect(submitSchema.safeParse({ artifactId: crypto.randomUUID(), body: "hi" }).success).toBe(false);
  });

  it("rejects lore bodies over 1000 characters", () => {
    expect(submitSchema.safeParse({ artifactId: crypto.randomUUID(), body: "a".repeat(1001) }).success).toBe(false);
  });

  it("accepts a reasonable lore submission", () => {
    expect(
      submitSchema.safeParse({ artifactId: crypto.randomUUID(), body: "This mask likely belonged to a priest." })
        .success,
    ).toBe(true);
  });
});

describe("community postSchema", () => {
  it("allows an optional artifactId", () => {
    expect(postSchema.safeParse({ body: "Great find!" }).success).toBe(true);
  });

  it("rejects an empty body", () => {
    expect(postSchema.safeParse({ body: "" }).success).toBe(false);
  });
});

describe("civilization generateSchema", () => {
  it("requires a valid uuid seasonId", () => {
    expect(generateSchema.safeParse({ seasonId: crypto.randomUUID() }).success).toBe(true);
    expect(generateSchema.safeParse({ seasonId: "season-1" }).success).toBe(false);
  });
});

describe("ai route schemas", () => {
  it("polishSchema caps lore length at 2000 chars", () => {
    expect(polishSchema.safeParse({ text: "a".repeat(2001) }).success).toBe(false);
  });

  it("translateSchema requires a non-empty description", () => {
    expect(translateSchema.safeParse({ description: "" }).success).toBe(false);
  });

  it("civSchema caps subreddit name at 60 chars", () => {
    expect(civSchema.safeParse({ subredditName: "r/history" }).success).toBe(true);
    expect(civSchema.safeParse({ subredditName: "r/" + "a".repeat(60) }).success).toBe(false);
  });

  it("summarySchema requires all four artifact fields", () => {
    expect(
      summarySchema.safeParse({ name: "Mask", category: "mask", material: "Bronze", period: "Golden Age" }).success,
    ).toBe(true);
    expect(summarySchema.safeParse({ name: "Mask" }).success).toBe(false);
  });
});
