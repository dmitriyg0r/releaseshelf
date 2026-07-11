import { selectBestAsset, type PlatformTarget } from "./catalog";

export type Verification = "verified" | "community" | "discovered";

export interface MarketplaceApp {
  slug: string;
  name: string;
  description: string;
  category: string;
  repositoryUrl: string;
  release: string;
  updatedAt: string;
  verification: Verification;
  assets: string[];
  accent: string;
  featured?: boolean;
}

export const marketplaceRegistry: MarketplaceApp[] = [
  {
    slug: "obsidian",
    name: "Obsidian",
    description: "A private, flexible knowledge base that works on local Markdown files.",
    category: "Productivity",
    repositoryUrl: "https://github.com/obsidianmd/obsidian-releases",
    release: "v1.10.6",
    updatedAt: "Updated 2 days ago",
    verification: "verified",
    assets: ["Obsidian-1.10.6-universal.dmg", "Obsidian-1.10.6.AppImage"],
    accent: "#8957e5",
    featured: true,
  },
  {
    slug: "signal-desktop",
    name: "Signal Desktop",
    description: "Private messaging with end-to-end encryption for desktop.",
    category: "Communication",
    repositoryUrl: "https://github.com/signalapp/Signal-Desktop",
    release: "v7.83.0",
    updatedAt: "Updated yesterday",
    verification: "verified",
    assets: ["signal-desktop-mac-arm64.dmg", "signal-desktop-mac-x64.dmg", "signal-desktop-x64.deb"],
    accent: "#3a76f0",
    featured: true,
  },
  {
    slug: "gimp",
    name: "GIMP",
    description: "A cross-platform image editor for creative and technical work.",
    category: "Creative",
    repositoryUrl: "https://github.com/GNOME/gimp",
    release: "v3.0.8",
    updatedAt: "Updated 4 days ago",
    verification: "verified",
    assets: ["GIMP-3.0.8-arm64.dmg", "GIMP-3.0.8-x86_64.AppImage"],
    accent: "#df8a37",
    featured: true,
  },
  {
    slug: "keepassxc",
    name: "KeePassXC",
    description: "A modern, secure password manager stored under your control.",
    category: "Security",
    repositoryUrl: "https://github.com/keepassxreboot/keepassxc",
    release: "v2.7.10",
    updatedAt: "Updated 6 days ago",
    verification: "verified",
    assets: ["KeePassXC-2.7.10-arm64.dmg", "KeePassXC-2.7.10-x86_64.AppImage"],
    accent: "#4f8dbe",
  },
  {
    slug: "zed",
    name: "Zed",
    description: "A high-performance multiplayer code editor from the creators of Atom.",
    category: "Developer tools",
    repositoryUrl: "https://github.com/zed-industries/zed",
    release: "v0.210.3",
    updatedAt: "Updated 8 days ago",
    verification: "community",
    assets: ["zed-macos-aarch64.dmg", "zed-linux-x86_64.AppImage"],
    accent: "#4ea7ff",
  },
  {
    slug: "mac-only-example",
    name: "Native Preview",
    description: "A placeholder demonstrating platform-specific marketplace entries.",
    category: "Utilities",
    repositoryUrl: "https://github.com",
    release: "v1.0.0",
    updatedAt: "Updated 10 days ago",
    verification: "discovered",
    assets: ["native-preview-arm64.dmg"],
    accent: "#6e7681",
  },
];

export function getMarketplaceApps(
  target: PlatformTarget,
  query = "",
): MarketplaceApp[] {
  const needle = query.trim().toLocaleLowerCase();

  return marketplaceRegistry.filter((app) => {
    const isCompatible = selectBestAsset(app.assets, target) !== null;
    const haystack = `${app.name} ${app.description} ${app.category}`.toLocaleLowerCase();
    return isCompatible && (!needle || haystack.includes(needle));
  });
}
