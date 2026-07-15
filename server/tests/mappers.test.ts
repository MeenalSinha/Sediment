import { describe, expect, it } from "vitest";
import { mapUserRow } from "../src/utils/mappers";
import type { UserRow } from "../src/db/usersRepo";

function makeRow(overrides: Partial<UserRow> = {}): UserRow {
  return {
    id: "u1",
    reddit_id: "t2_abc",
    reddit_username: "DustSeeker",
    avatar_url: null,
    flair: null,
    level: 24,
    xp: 4250,
    xp_to_next_level: 6000,
    dig_energy: 86,
    max_dig_energy: 100,
    next_energy_at: null,
    coins: "45650",
    gems: "1240",
    active_role: "archaeologist",
    created_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("mapUserRow", () => {
  it("maps snake_case DB columns to the shared camelCase API shape", () => {
    const mapped = mapUserRow(makeRow());
    expect(mapped.redditUsername).toBe("DustSeeker");
    expect(mapped.xpToNextLevel).toBe(6000);
    expect(mapped.digEnergy).toBe(86);
    expect(mapped.maxDigEnergy).toBe(100);
  });

  it("converts bigint coin/gem columns (strings from pg) to numbers", () => {
    const mapped = mapUserRow(makeRow({ coins: "999999999999", gems: "42" }));
    expect(mapped.coins).toBe(999999999999);
    expect(mapped.gems).toBe(42);
    expect(typeof mapped.coins).toBe("number");
  });

  it("defaults rank to 0 (computed separately from leaderboard queries)", () => {
    const mapped = mapUserRow(makeRow());
    expect(mapped.rank).toBe(0);
  });

  it("preserves null avatar/flair as null rather than empty string", () => {
    const mapped = mapUserRow(makeRow({ avatar_url: null, flair: null }));
    expect(mapped.avatarUrl).toBeNull();
    expect(mapped.flair).toBeNull();
  });
});
