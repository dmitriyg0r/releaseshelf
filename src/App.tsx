import { useEffect, useMemo, useState } from "react";
import { loadCatalog, type CatalogSource } from "./catalog-client";
import { type PlatformTarget } from "./catalog";
import { getDownloadAsset, getMarketplaceApps, marketplaceRegistry, type MarketplaceApp, type ReleaseAsset } from "./registry";
import "./App.css";

const targetOptions: Array<{ label: string; value: string; target: PlatformTarget }> = [
  { label: "macOS / Apple Silicon", value: "macos:arm64", target: { os: "macos", arch: "arm64" } },
  { label: "macOS / Intel", value: "macos:x64", target: { os: "macos", arch: "x64" } },
  { label: "Linux / x64", value: "linux:x64", target: { os: "linux", arch: "x64" } },
  { label: "Linux / ARM64", value: "linux:arm64", target: { os: "linux", arch: "arm64" } },
];

function packageLabel(asset: ReleaseAsset | null): string {
  if (!asset) return "No compatible package";
  const name = asset.name.toLocaleLowerCase();
  if (name.endsWith(".dmg")) return "macOS disk image";
  if (name.endsWith(".appimage")) return "Linux AppImage";
  if (name.endsWith(".deb")) return "Debian package";
  if (name.endsWith(".rpm")) return "RPM package";
  return "Release asset";
}

function verificationLabel(verification: MarketplaceApp["verification"]): string {
  return verification === "verified"
    ? "Verified"
    : verification === "community"
      ? "Community"
      : "Discovered";
}

function App() {
  const [query, setQuery] = useState("");
  const [target, setTarget] = useState<PlatformTarget>(targetOptions[0].target);
  const [catalogApps, setCatalogApps] = useState<MarketplaceApp[]>(marketplaceRegistry);
  const [catalogSource, setCatalogSource] = useState<CatalogSource>("bundled");
  const [selectedSlug, setSelectedSlug] = useState(marketplaceRegistry[0].slug);

  useEffect(() => {
    let active = true;
    void loadCatalog().then(({ document, source }) => {
      if (!active) return;
      setCatalogApps(document.apps);
      setCatalogSource(source);
    }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  const apps = useMemo(() => getMarketplaceApps(target, query, catalogApps), [target, query, catalogApps]);
  const selected = apps.find((app) => app.slug === selectedSlug) ?? apps[0];
  const featured = apps.filter((app) => app.featured).slice(0, 3);
  const selectedAsset = selected ? getDownloadAsset(selected, target) : null;

  return (
    <div className="shell">
      <header className="site-header">
        <div className="header-inner">
          <div className="brand" aria-label="ReleaseShelf home">
            <span className="brand-mark" aria-hidden="true">⌘</span>
            <span>ReleaseShelf</span>
          </div>
          <div className="global-search" role="search">
            <span aria-hidden="true">⌕</span>
            <input
              aria-label="Search applications"
              placeholder="Search marketplace"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
            />
          </div>
          <button className="submit-button" type="button">Submit an app</button>
        </div>
      </header>

      <div className="workspace">
        <aside className="sidebar" aria-label="Marketplace navigation">
          <nav>
            <a className="nav-item active" href="#marketplace">⌂ <span>Marketplace</span></a>
            <a className="nav-item" href="#featured">◈ <span>Featured</span></a>
            <a className="nav-item" href="#categories">▦ <span>Categories</span></a>
            <a className="nav-item" href="#updates">↻ <span>Updates</span></a>
          </nav>
          <div className="sidebar-rule" />
          <p className="sidebar-title">PLATFORM</p>
          <select
            aria-label="Target platform"
            value={`${target.os}:${target.arch}`}
            onChange={(event) => {
              const option = targetOptions.find((item) => item.value === event.currentTarget.value);
              if (option) setTarget(option.target);
            }}
          >
            {targetOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <p className="sidebar-copy">All catalog applications are shown. Your platform selects the preferred download when one is available.</p>
        </aside>

        <main className="content" id="marketplace">
          <div className="title-row">
            <div>
              <p className="eyebrow">RELEASESHELF / EXPLORE</p>
              <h1>Marketplace</h1>
              <p className="lead">Curated open-source desktop software, sourced from published releases.</p>
            </div>
            <span className="result-count">{apps.length} apps · {catalogSource === "remote" ? "remote catalog" : "bundled catalog"}</span>
          </div>

          <section id="featured" aria-labelledby="featured-heading">
            <div className="section-heading"><h2 id="featured-heading">Featured desktop apps</h2><a href="#categories">Browse categories →</a></div>
            <div className="featured-grid">
              {featured.map((app) => <AppCard app={app} key={app.slug} selected={selected?.slug === app.slug} onSelect={setSelectedSlug} />)}
            </div>
          </section>

          <section className="list-section" id="updates" aria-labelledby="updates-heading">
            <div className="section-heading"><h2 id="updates-heading">Recently updated</h2><span>Verified sources prioritized</span></div>
            <div className="app-list">
              {apps.map((app) => <AppRow app={app} key={app.slug} selected={selected?.slug === app.slug} onSelect={setSelectedSlug} />)}
              {apps.length === 0 && <div className="empty-state">No applications match this platform and search. Try another platform or a broader query.</div>}
            </div>
          </section>
        </main>

        <aside className="release-panel" aria-label="Selected application release">
          {selected ? <ReleaseDetails app={selected} asset={selectedAsset} /> : <div className="empty-state">Select an app to inspect its published release.</div>}
        </aside>
      </div>
    </div>
  );
}

function AppCard({ app, selected, onSelect }: { app: MarketplaceApp; selected: boolean; onSelect: (slug: string) => void }) {
  return <button className={`featured-card ${selected ? "selected" : ""}`} onClick={() => onSelect(app.slug)} type="button">
    <span className="app-avatar" style={{ backgroundColor: app.accent }}>{app.name.slice(0, 1)}</span>
    <span className="card-copy"><strong>{app.name}</strong><span>{app.description}</span></span>
    <span className={`verification ${app.verification}`}>● {verificationLabel(app.verification)}</span>
  </button>;
}

function AppRow({ app, selected, onSelect }: { app: MarketplaceApp; selected: boolean; onSelect: (slug: string) => void }) {
  return <button className={`app-row ${selected ? "selected" : ""}`} onClick={() => onSelect(app.slug)} type="button">
    <span className="app-avatar small" style={{ backgroundColor: app.accent }}>{app.name.slice(0, 1)}</span>
    <span className="row-main"><strong>{app.name}</strong><span>{app.description}</span></span>
    <span className="row-category">{app.category}</span>
    <span className={`verification ${app.verification}`}>● {verificationLabel(app.verification)}</span>
    <span className="row-updated">{app.updatedAt}</span>
  </button>;
}

function ReleaseDetails({ app, asset }: { app: MarketplaceApp; asset: ReleaseAsset | null }) {
  return <>
    <div className="panel-header"><span className="app-avatar" style={{ backgroundColor: app.accent }}>{app.name.slice(0, 1)}</span><div><h2>{app.name}</h2><span className="release-version">Latest release {app.release}</span></div></div>
    <p className="panel-description">{app.description}</p>
    <div className="package-box"><span className="package-icon">▣</span><div><strong>{packageLabel(asset)}</strong><code>{asset?.name ?? "No compatible asset"}</code></div></div>
    {asset ? <a className="download-action" href={asset.url} rel="noreferrer" target="_blank"><span>Download {packageLabel(asset)}</span> ↓</a> : <span className="download-action disabled">No compatible download</span>}
    <a className="repository-link" href={app.repositoryUrl} rel="noreferrer" target="_blank">View source repository ↗</a>
    <div className="trust-box"><strong>◉ {verificationLabel(app.verification)} source</strong><p>The download button points directly to the publisher’s GitHub release asset. Installation is not automated in this build.</p></div>
    <dl className="metadata"><div><dt>Category</dt><dd>{app.category}</dd></div><div><dt>Updated</dt><dd>{app.updatedAt}</dd></div><div><dt>Repository</dt><dd>GitHub</dd></div></dl>
  </>;
}

export default App;
