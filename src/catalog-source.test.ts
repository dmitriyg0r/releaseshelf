import { describe, expect, it } from "vitest";
import { parseCatalogDocument } from "./catalog-source";

describe("parseCatalogDocument", () => {
  it("accepts a versioned catalog document with direct release assets", () => {
    const catalog = parseCatalogDocument({
      version: 1,
      generatedAt: "2026-07-11T15:00:00Z",
      apps: [
        {
          slug: "example",
          name: "Example",
          description: "Example desktop application",
          category: "Utilities",
          repositoryUrl: "https://github.com/example/example",
          release: "v1.0.0",
          verification: "verified",
          accent: "#1f6feb",
          assets: [{ name: "example-arm64.dmg", url: "https://github.com/example/example/releases/download/v1.0.0/example-arm64.dmg" }],
        },
      ],
    });

    expect(catalog.apps[0].assets[0].url).toContain("/releases/download/");
  });

  it("rejects an entry with no direct release asset URL", () => {
    expect(() => parseCatalogDocument({ version: 1, generatedAt: "now", apps: [{ slug: "bad" }] })).toThrow(
      /invalid catalog app/i,
    );
  });
});
