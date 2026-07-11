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
    const dmgAssets = assets.filter((asset) => hasExtension(asset, ".dmg"));
    return (
      dmgAssets.find((asset) => includesArchitecture(asset, target.arch)) ??
      dmgAssets.find((asset) => asset.toLocaleLowerCase().includes("universal")) ??
      null
    );
  }

  return (
    assets.find((asset) => hasExtension(asset, ".appimage")) ??
    assets.find((asset) => hasExtension(asset, ".deb")) ??
    assets.find((asset) => hasExtension(asset, ".rpm")) ??
    null
  );
}
