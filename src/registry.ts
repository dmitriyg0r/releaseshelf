import { selectBestAsset, type PlatformTarget } from "./catalog";

export type Verification = "verified" | "community" | "discovered";

export interface ReleaseAsset {
  name: string;
  url: string;
}

export interface MarketplaceApp {
  slug: string;
  name: string;
  description: string;
  category: string;
  repositoryUrl: string;
  release: string;
  updatedAt?: string;
  verification: Verification;
  assets: ReleaseAsset[];
  accent: string;
  featured?: boolean;
}

const githubAsset = (repository: string, tag: string, name: string): ReleaseAsset => ({
  name,
  url: `https://github.com/${repository}/releases/download/${tag}/${name}`,
});

export const marketplaceRegistry: MarketplaceApp[] = [
  {
    slug: "appflowy",
    name: "AppFlowy",
    description: "A secure, local-first workspace for notes, tasks, and team collaboration.",
    category: "Productivity",
    repositoryUrl: "https://github.com/AppFlowy-IO/AppFlowy",
    release: "0.12.5",
    updatedAt: "Latest release 0.12.5",
    verification: "verified",
    assets: [
      githubAsset("AppFlowy-IO/AppFlowy", "0.12.5", "AppFlowy-0.12.5-macos-arm64.dmg"),
      githubAsset("AppFlowy-IO/AppFlowy", "0.12.5", "AppFlowy-0.12.5-macos-x86_64.dmg"),
      githubAsset("AppFlowy-IO/AppFlowy", "0.12.5", "AppFlowy-0.12.5-linux-x86_64.AppImage"),
      githubAsset("AppFlowy-IO/AppFlowy", "0.12.5", "AppFlowy-0.12.5-linux-x86_64.deb"),
    ],
    accent: "#7856ff",
    featured: true,
  },
  {
    slug: "localsend",
    name: "LocalSend",
    description: "Share files securely with nearby devices on your local network.",
    category: "Utilities",
    repositoryUrl: "https://github.com/localsend/localsend",
    release: "v1.17.0",
    updatedAt: "Latest release v1.17.0",
    verification: "verified",
    assets: [
      githubAsset("localsend/localsend", "v1.17.0", "LocalSend-1.17.0.dmg"),
      githubAsset("localsend/localsend", "v1.17.0", "LocalSend-1.17.0-linux-x86-64.AppImage"),
      githubAsset("localsend/localsend", "v1.17.0", "LocalSend-1.17.0-linux-x86-64.deb"),
      githubAsset("localsend/localsend", "v1.17.0", "LocalSend-1.17.0-linux-arm-64.deb"),
    ],
    accent: "#35a5e7",
    featured: true,
  },
  {
    slug: "marktext",
    name: "MarkText",
    description: "A simple and elegant Markdown editor with live preview.",
    category: "Writing",
    repositoryUrl: "https://github.com/marktext/marktext",
    release: "v0.19.1",
    updatedAt: "Latest release v0.19.1",
    verification: "verified",
    assets: [
      githubAsset("marktext/marktext", "v0.19.1", "marktext-mac-arm64-0.19.1.dmg"),
      githubAsset("marktext/marktext", "v0.19.1", "marktext-mac-x64-0.19.1.dmg"),
      githubAsset("marktext/marktext", "v0.19.1", "marktext-linux-0.19.1.AppImage"),
      githubAsset("marktext/marktext", "v0.19.1", "marktext-linux-0.19.1.deb"),
    ],
    accent: "#4a9eff",
    featured: true,
  },
  {
    slug: "zen-browser",
    name: "Zen Browser",
    description: "A fast, privacy-focused browser built on Firefox technology.",
    category: "Internet",
    repositoryUrl: "https://github.com/zen-browser/desktop",
    release: "1.21.6b",
    updatedAt: "Latest release 1.21.6b",
    verification: "community",
    assets: [
      githubAsset("zen-browser/desktop", "1.21.6b", "zen.macos-universal.dmg"),
      githubAsset("zen-browser/desktop", "1.21.6b", "zen-x86_64.AppImage"),
      githubAsset("zen-browser/desktop", "1.21.6b", "zen-aarch64.AppImage"),
    ],
    accent: "#8f6df2",
  },
  {
    slug: "alacritty",
    name: "Alacritty",
    description: "A fast, cross-platform terminal emulator accelerated by the GPU.",
    category: "Developer tools",
    repositoryUrl: "https://github.com/alacritty/alacritty",
    release: "v0.17.0",
    updatedAt: "Latest release v0.17.0",
    verification: "verified",
    assets: [githubAsset("alacritty/alacritty", "v0.17.0", "Alacritty-v0.17.0.dmg")],
    accent: "#d86c4e",
  },
  {
    slug: "bat",
    name: "bat",
    description: "A cat clone with syntax highlighting, Git integration, and paging.",
    category: "Developer tools",
    repositoryUrl: "https://github.com/sharkdp/bat",
    release: "v0.26.1",
    updatedAt: "Latest release v0.26.1",
    verification: "verified",
    assets: [
      githubAsset("sharkdp/bat", "v0.26.1", "bat-v0.26.1-aarch64-apple-darwin.tar.gz"),
      githubAsset("sharkdp/bat", "v0.26.1", "bat-v0.26.1-x86_64-apple-darwin.tar.gz"),
      githubAsset("sharkdp/bat", "v0.26.1", "bat-musl_0.26.1_musl-linux-amd64.deb"),
      githubAsset("sharkdp/bat", "v0.26.1", "bat-v0.26.1-aarch64-unknown-linux-gnu.tar.gz"),
    ],
    accent: "#4b8bbd",
  },
  {
    slug: "lazygit",
    name: "lazygit",
    description: "A simple terminal UI for Git commands and repositories.",
    category: "Developer tools",
    repositoryUrl: "https://github.com/jesseduffield/lazygit",
    release: "v0.63.0",
    updatedAt: "Latest release v0.63.0",
    verification: "verified",
    assets: [
      githubAsset("jesseduffield/lazygit", "v0.63.0", "lazygit_0.63.0_darwin_arm64.tar.gz"),
      githubAsset("jesseduffield/lazygit", "v0.63.0", "lazygit_0.63.0_darwin_x86_64.tar.gz"),
      githubAsset("jesseduffield/lazygit", "v0.63.0", "lazygit_0.63.0_linux_arm64.tar.gz"),
      githubAsset("jesseduffield/lazygit", "v0.63.0", "lazygit_0.63.0_linux_x86_64.tar.gz"),
    ],
    accent: "#8fbcbb",
  },
  {
    slug: "wezterm",
    name: "WezTerm",
    description: "A powerful GPU-accelerated terminal emulator and multiplexer.",
    category: "Developer tools",
    repositoryUrl: "https://github.com/wez/wezterm",
    release: "20240203-110809-5046fc22",
    updatedAt: "Latest published GitHub release",
    verification: "community",
    assets: [
      githubAsset("wez/wezterm", "20240203-110809-5046fc22", "WezTerm-20240203-110809-5046fc22-Ubuntu20.04.AppImage"),
      githubAsset("wez/wezterm", "20240203-110809-5046fc22", "wezterm-20240203-110809-5046fc22.Debian12.deb"),
      githubAsset("wez/wezterm", "20240203-110809-5046fc22", "wezterm-20240203-110809-5046fc22.Debian12.arm64.deb"),
    ],
    accent: "#6c71c4",
  },
  {
    slug: "fzf",
    name: "fzf",
    description: "A command-line fuzzy finder for files, history, and processes.",
    category: "Developer tools",
    repositoryUrl: "https://github.com/junegunn/fzf",
    release: "v0.74.0",
    updatedAt: "Latest release v0.74.0",
    verification: "verified",
    assets: [
      githubAsset("junegunn/fzf", "v0.74.0", "fzf-0.74.0-darwin_arm64.tar.gz"),
      githubAsset("junegunn/fzf", "v0.74.0", "fzf-0.74.0-darwin_amd64.tar.gz"),
      githubAsset("junegunn/fzf", "v0.74.0", "fzf-0.74.0-linux_amd64.tar.gz"),
      githubAsset("junegunn/fzf", "v0.74.0", "fzf-0.74.0-linux_arm64.tar.gz"),
    ],
    accent: "#ff79c6",
  },
];

export function getDownloadAsset(
  app: MarketplaceApp,
  target: PlatformTarget,
): ReleaseAsset | null {
  const assetName = selectBestAsset(app.assets.map((asset) => asset.name), target);
  return app.assets.find((asset) => asset.name === assetName) ?? null;
}

export function getMarketplaceApps(
  _target: PlatformTarget,
  query = "",
  apps: MarketplaceApp[] = marketplaceRegistry,
): MarketplaceApp[] {
  const needle = query.trim().toLocaleLowerCase();

  return apps.filter((app) => {
    const haystack = `${app.name} ${app.description} ${app.category}`.toLocaleLowerCase();
    return !needle || haystack.includes(needle);
  });
}
