import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const simulationDir = join(dirname(fileURLToPath(import.meta.url)), "../../src/simulation");

describe("simulation isolation", () => {
  it("does not import React", () => {
    const files = readdirSync(simulationDir).filter((name) => name.endsWith(".ts"));
    for (const name of files) {
      const text = readFileSync(join(simulationDir, name), "utf8");
      expect(text, name).not.toMatch(/from\s+["']react["']/);
      expect(text, name).not.toMatch(/from\s+["']react-dom["']/);
    }
  });
});
