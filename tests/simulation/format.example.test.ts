import { describe, expect, it } from "vitest";
import { formatSimTime } from "../../src/simulation/format";

describe("formatSimTime", () => {
  it("formats 14.2 s as 00:00:14.200", () => {
    expect(formatSimTime(14.2)).toBe("00:00:14.200");
  });

  it("formats t = 0 as 00:00:00.000", () => {
    expect(formatSimTime(0)).toBe("00:00:00.000");
  });
});
