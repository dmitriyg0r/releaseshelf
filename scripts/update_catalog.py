#!/usr/bin/env python3
"""Refresh reviewed ReleaseShelf catalog entries from GitHub Releases.

Only entries already present in catalog.json are refreshed. The script never adds
repositories automatically; editorial metadata and verification status are preserved.
"""

from __future__ import annotations

import argparse
import copy
import json
import os
import re
import sys
import tempfile
from datetime import UTC, datetime
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

PACKAGE_SUFFIXES = (".dmg", ".pkg", ".appimage", ".deb", ".rpm", ".tar.gz", ".tar.xz")
SOURCE_MARKERS = ("source code", "-source", "_source", "src.tar")


def select_release_assets(assets: list[dict]) -> list[dict[str, str]]:
    """Return usable desktop release assets, excluding generated source archives."""
    selected: list[dict[str, str]] = []
    for asset in assets:
        name = asset.get("name", "")
        url = asset.get("browser_download_url", "")
        lower_name = name.lower()
        if not isinstance(name, str) or not isinstance(url, str):
            continue
        if any(marker in lower_name for marker in SOURCE_MARKERS):
            continue
        if lower_name.endswith(PACKAGE_SUFFIXES):
            selected.append({"name": name, "url": url})
    return selected


def apply_release(app: dict, release: dict) -> dict:
    """Update only machine-derived release data while retaining marketplace metadata."""
    updated = copy.deepcopy(app)
    updated["release"] = release["tag_name"]
    updated["updatedAt"] = release["published_at"]
    updated["assets"] = select_release_assets(release.get("assets", []))
    return updated


def repository_from_url(url: str) -> str:
    match = re.fullmatch(r"https://github\.com/([^/]+/[^/]+)/?", url)
    if not match:
        raise ValueError(f"Unsupported repository URL: {url}")
    return match.group(1)


def fetch_json(url: str) -> dict:
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "ReleaseShelf-catalog-indexer"}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = Request(url, headers=headers)
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def fetch_latest_release(repository: str) -> dict:
    return fetch_json(f"https://api.github.com/repos/{repository}/releases/latest")


def search_repositories(limit: int) -> list[dict]:
    """Return a bounded candidate pool; release checks decide actual inclusion."""
    queries = (
        "topic:desktop-app archived:false",
        "topic:linux-app archived:false",
        "appimage in:readme archived:false",
        "desktop application in:description archived:false",
    )
    repositories: list[dict] = []
    seen: set[str] = set()
    for query in queries:
        encoded_query = query.replace(" ", "+").replace(":", "%3A")
        result = fetch_json(
            f"https://api.github.com/search/repositories?q={encoded_query}&sort=stars&order=desc&per_page=100"
        )
        for repository in result.get("items", []):
            name = repository.get("full_name")
            if isinstance(name, str) and name not in seen:
                seen.add(name)
                repositories.append(repository)
                if len(repositories) >= limit:
                    return repositories
    return repositories


def discover_apps(repositories: list[dict], release_fetcher, existing_repositories: set[str]) -> list[dict]:
    """Create unreviewed marketplace records only when a release ships a desktop package."""
    discovered: list[dict] = []
    for repository in repositories:
        full_name = repository.get("full_name")
        if not isinstance(full_name, str) or full_name in existing_repositories:
            continue
        try:
            release = release_fetcher(full_name)
        except (HTTPError, URLError, TimeoutError, ValueError):
            continue
        if not release:
            continue
        assets = select_release_assets(release.get("assets", []))
        if not assets:
            continue
        discovered.append({
            "slug": full_name.lower().replace("/", "--"),
            "name": repository.get("name") or full_name,
            "description": repository.get("description") or "GitHub project discovered from a desktop release.",
            "category": "Uncategorized",
            "repositoryUrl": repository.get("html_url") or f"https://github.com/{full_name}",
            "release": release["tag_name"],
            "updatedAt": release["published_at"],
            "verification": "discovered",
            "assets": assets,
            "accent": "#6e7681",
        })
    return discovered


def refresh_catalog(catalog: dict, discover: bool = False, discovery_limit: int = 100) -> tuple[dict, list[str]]:
    refreshed = copy.deepcopy(catalog)
    changed: list[str] = []
    apps: list[dict] = []

    for app in catalog["apps"]:
        repository = repository_from_url(app["repositoryUrl"])
        try:
            release = fetch_latest_release(repository)
            candidate = apply_release(app, release)
            if not candidate["assets"]:
                print(f"SKIP {app['slug']}: latest release has no supported desktop asset", file=sys.stderr)
                apps.append(app)
                continue
            apps.append(candidate)
            if candidate["release"] != app.get("release") or candidate["assets"] != app.get("assets"):
                changed.append(app["slug"])
        except (HTTPError, URLError, TimeoutError, ValueError) as error:
            print(f"SKIP {app['slug']}: {error}", file=sys.stderr)
            apps.append(app)

    if discover:
        try:
            existing_repositories = {repository_from_url(app["repositoryUrl"]) for app in apps}
            candidates = search_repositories(discovery_limit)
            additions = discover_apps(candidates, fetch_latest_release, existing_repositories)
            apps.extend(additions)
            changed.extend(app["slug"] for app in additions)
            print(f"DISCOVERED {len(additions)} app(s) from {len(candidates)} GitHub candidates", file=sys.stderr)
        except (HTTPError, URLError, TimeoutError, ValueError) as error:
            print(f"DISCOVERY SKIP: {error}", file=sys.stderr)

    refreshed["apps"] = apps
    refreshed["generatedAt"] = datetime.now(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")
    return refreshed, changed


def write_json(path: Path, content: dict) -> None:
    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as handle:
        json.dump(content, handle, indent=2)
        handle.write("\n")
        temporary_path = Path(handle.name)
    temporary_path.replace(path)


def main() -> int:
    parser = argparse.ArgumentParser(description="Refresh and discover ReleaseShelf GitHub-release catalog entries.")
    parser.add_argument("--catalog", type=Path, default=Path("public/catalog.json"))
    parser.add_argument("--discover", action="store_true", help="Append unreviewed repositories that publish desktop release assets")
    parser.add_argument("--discovery-limit", type=int, default=100, help="Maximum GitHub search candidates to inspect")
    parser.add_argument("--dry-run", action="store_true", help="Fetch and report changes without writing the catalog")
    args = parser.parse_args()

    catalog = json.loads(args.catalog.read_text(encoding="utf-8"))
    refreshed, changed = refresh_catalog(catalog, discover=args.discover, discovery_limit=args.discovery_limit)
    if args.dry_run:
        print(f"Dry run: {len(changed)} app(s) would update: {', '.join(changed) or 'none'}")
        return 0
    write_json(args.catalog, refreshed)
    print(f"Updated {args.catalog}: {len(changed)} app(s) changed: {', '.join(changed) or 'none'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
