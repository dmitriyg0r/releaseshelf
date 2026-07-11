import { describe, expect, it } from "vitest";
import { getMarketplaceApps } from "./registry";

describe("getMarketplaceApps", () => {
  it("returns only applications compatible with the selected platform", () => {
    const results = getMarketplaceApps({ os: "linux", arch: "x64" });

    expect(results.map((app) => app.slug)).toContain("gimp");
    expect(results.map((app) => app.slug)).not.toContain("mac-only-example");
  });

  it("matches applications by name, category, and description", () => {
    expect(
      getMarketplaceApps({ os: "macos", arch: "arm64" }, "private messaging").map(
        (app) => app.slug,
      ),
    ).toEqual(["signal-desktop"]);
  });
});
