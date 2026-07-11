export type SupportedOs = "macos" | "linux";
export type SupportedArch = "arm64" | "x64";

export interface PlatformTarget {
  os: SupportedOs;
  arch: SupportedArch;
}

function hasExtension(asset: string, extension: string): boolean {
  return asset.toLocaleLowerCase().endsWith(extension);
}

function includesArchitecture(asset: string, arch: SupportedArch): boolean {
  const name = asset.toLocaleLowerCase();
  return arch === "arm64"
    ? name.includes("arm64") || name.includes("aarch64")
    : name.includes("x64") || name.includes("x86_64") || name.includes("amd64");
}

export function selectBestAsset(
  assets: string[],
  target: PlatformTarget,
): string | null {
  if (target.os === "macos") {
    const macAssets = assets.filter(
      (asset) =>
        hasExtension(asset, ".dmg") ||
        hasExtension(asset, ".pkg") ||
        hasExtension(asset, ".tar.gz"),
    );
    return (
      macAssets.find((asset) => includesArchitecture(asset, target.arch)) ??
      macAssets.find((asset) => asset.toLocaleLowerCase().includes("universal")) ??
      null
    );
  }

  const linuxAssets = assets.filter(
    (asset) =>
      hasExtension(asset, ".appimage") ||
      hasExtension(asset, ".deb") ||
      hasExtension(asset, ".rpm") ||
      hasExtension(asset, ".tar.gz") ||
      hasExtension(asset, ".tar.xz"),
  );

  return (
    linuxAssets.find((asset) => hasExtension(asset, ".appimage")) ??
    linuxAssets.find((asset) => hasExtension(asset, ".deb")) ??
    linuxAssets.find((asset) => hasExtension(asset, ".rpm")) ??
    linuxAssets.find((asset) => includesArchitecture(asset, target.arch)) ??
    null
  );
}
