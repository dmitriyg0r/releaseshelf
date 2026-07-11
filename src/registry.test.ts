import { describe, expect, it } from "vitest";
import { getDownloadAsset, getMarketplaceApps, marketplaceRegistry } from "./registry";

describe("getMarketplaceApps", () => {
  it("returns only applications compatible with the selected platform", () => {
    const results = getMarketplaceApps({ os: "linux", arch: "x64" });

    expect(results.map((app) => app.slug)).toContain("appflowy");
    expect(results.map((app) => app.slug)).not.toContain("alacritty");
  });

  it("returns the direct GitHub release download URL for the preferred asset", () => {
    const appFlowy = marketplaceRegistry.find((app) => app.slug === "appflowy");

    expect(appFlowy).toBeDefined();
    expect(getDownloadAsset(appFlowy!, { os: "macos", arch: "arm64" })).toMatchObject({
      name: expect.stringMatching(/macos-arm64\.dmg$/i),
      url: expect.stringMatching(/^https:\/\/github\.com\/AppFlowy-IO\/AppFlowy\/releases\/download\//),
    });
  });
});
