import { describe, expect, it, vi } from "vitest";
import { loadCatalog } from "./catalog-client";

const document = {
  version: 1,
  generatedAt: "2026-07-11T15:00:00Z",
  apps: [{
    slug: "example", name: "Example", description: "Example app", category: "Utilities",
    repositoryUrl: "https://github.com/example/example", release: "v1.0.0", verification: "verified",
    accent: "#1f6feb", assets: [{ name: "example-arm64.dmg", url: "https://github.com/example/example/releases/download/v1.0.0/example-arm64.dmg" }],
  }],
};

describe("loadCatalog", () => {
  it("uses the configured remote catalog when it is available", async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(JSON.stringify(document), { status: 200 }));
    const result = await loadCatalog(fetcher, "https://catalog.example/catalog.json");

    expect(fetcher).toHaveBeenCalledWith("https://catalog.example/catalog.json", { cache: "no-cache" });
    expect(result.source).toBe("remote");
    expect(result.document.apps[0].slug).toBe("example");
  });
});
