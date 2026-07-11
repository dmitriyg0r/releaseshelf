import { describe, expect, it } from "vitest";
import { selectBestAsset } from "./catalog";

describe("selectBestAsset", () => {
  const assets = [
    "Release-x64.dmg",
    "Release-arm64.dmg",
    "Release-universal.dmg",
    "Release.AppImage",
    "Release_1.0.0_amd64.deb",
  ];

  it("prefers a macOS ARM64 DMG on Apple Silicon", () => {
    expect(selectBestAsset(assets, { os: "macos", arch: "arm64" })).toBe(
      "Release-arm64.dmg",
    );
  });

  it("prefers AppImage over a distro-specific Linux package", () => {
    expect(selectBestAsset(assets, { os: "linux", arch: "x64" })).toBe(
      "Release.AppImage",
    );
  });

  it("returns null when no supported asset exists", () => {
    expect(
      selectBestAsset(["checksums.txt", "source.zip"], {
        os: "macos",
        arch: "arm64",
      }),
    ).toBeNull();
  });
});
