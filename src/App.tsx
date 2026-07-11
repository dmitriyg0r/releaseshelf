import { useMemo, useState } from "react";
import { selectBestAsset, type PlatformTarget } from "./catalog";
import "./App.css";

type AppEntry = {
  name: string;
  description: string;
  category: string;
  repositoryUrl: string;
  release: string;
  assets: string[];
  accent: string;
};

const catalog: AppEntry[] = [
  {
    name: "Obsidian",
    description: "A private, flexible knowledge base that works on local Markdown files.",
    category: "Productivity",
    repositoryUrl: "https://github.com/obsidianmd/obsidian-releases",
    release: "v1.10.6",
    assets: ["Obsidian-1.10.6-universal.dmg", "Obsidian-1.10.6.AppImage"],
    accent: "#7c6cff",
  },
  {
    name: "Signal Desktop",
    description: "Private messaging with end-to-end encryption for desktop.",
    category: "Communication",
    repositoryUrl: "https://github.com/signalapp/Signal-Desktop",
    release: "v7.83.0",
    assets: ["signal-desktop-mac-arm64.dmg", "signal-desktop-x64.deb"],
    accent: "#3a76f0",
  },
  {
    name: "GIMP",
    description: "A cross-platform image editor for creative and technical work.",
    category: "Creative",
    repositoryUrl: "https://github.com/GNOME/gimp",
    release: "v3.0.8",
    assets: ["GIMP-3.0.8-arm64.dmg", "GIMP-3.0.8-x86_64.AppImage"],
    accent: "#df8a37",
  },
];

function labelForAsset(asset: string | null): string {
  if (!asset) return "No compatible release asset";
  if (asset.toLowerCase().endsWith(".dmg")) return "macOS disk image";
  if (asset.toLowerCase().endsWith(".appimage")) return "Linux AppImage";
  if (asset.toLowerCase().endsWith(".deb")) return "Debian package";
  return "Release asset";
}

function App() {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<PlatformTarget>({ os: "macos", arch: "arm64" });
  const [selected, setSelected] = useState(catalog[0]);

  const visibleApps = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase();
    if (!needle) return catalog;
    return catalog.filter((app) =>
      `${app.name} ${app.description} ${app.category}`.toLocaleLowerCase().includes(needle),
    );
  }, [query]);

  const preferredAsset = selectBestAsset(selected.assets, target);

  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="brand" aria-label="ReleaseShelf">
          <span className="brand-mark">R</span>
          <span>ReleaseShelf</span>
        </div>
        <span className="beta">MVP · curated catalog</span>
      </header>

      <section className="hero">
        <p className="eyebrow">OPEN-SOURCE DESKTOP APPS</p>
        <h1>Find trustworthy GitHub releases for your desktop.</h1>
        <p className="hero-copy">
          ReleaseShelf will always show the package type and source before you download anything.
        </p>
        <div className="toolbar">
          <input
            type="search"
            aria-label="Search applications"
            placeholder="Search applications"
            value={query}
            onChange={(event) => setQuery(event.currentTarget.value)}
          />
          <select
            aria-label="Target platform"
            value={`${target.os}:${target.arch}`}
            onChange={(event) => {
              const [os, arch] = event.currentTarget.value.split(":") as [
                PlatformTarget["os"],
                PlatformTarget["arch"],
              ];
              setTarget({ os, arch });
            }}
          >
            <option value="macos:arm64">macOS · Apple Silicon</option>
            <option value="macos:x64">macOS · Intel</option>
            <option value="linux:x64">Linux · x64</option>
            <option value="linux:arm64">Linux · ARM64</option>
          </select>
        </div>
      </section>

      <section className="catalog-layout" aria-label="Application catalog">
        <div className="app-grid">
          {visibleApps.map((app) => (
            <button
              className={`app-card ${selected.name === app.name ? "selected" : ""}`}
              key={app.name}
              onClick={() => setSelected(app)}
              type="button"
            >
              <span className="app-icon" style={{ backgroundColor: app.accent }}>
                {app.name.slice(0, 1)}
              </span>
              <span className="app-card-content">
                <span className="category">{app.category}</span>
                <strong>{app.name}</strong>
                <span>{app.description}</span>
              </span>
            </button>
          ))}
          {visibleApps.length === 0 && <p className="empty">No curated app matches this search.</p>}
        </div>

        <aside className="details-panel">
          <span className="category">LATEST RELEASE · {selected.release}</span>
          <h2>{selected.name}</h2>
          <p>{selected.description}</p>
          <div className="release-box">
            <span className="status-dot" />
            <div>
              <strong>{labelForAsset(preferredAsset)}</strong>
              <p>{preferredAsset ?? "Switch platform or open the source release."}</p>
            </div>
          </div>
          <a className="primary-action" href={selected.repositoryUrl} target="_blank" rel="noreferrer">
            Open release on GitHub ↗
          </a>
          <p className="safety-note">
            Downloads and installation are intentionally not enabled in this first build. ReleaseShelf will not bypass Gatekeeper or Linux package policies.
          </p>
        </aside>
      </section>
    </main>
  );
}

export default App;
