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


def fetch_latest_release(repository: str) -> dict:
    headers = {"Accept": "application/vnd.github+json", "User-Agent": "ReleaseShelf-catalog-indexer"}
    token = os.environ.get("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"Bearer {token}"
    request = Request(f"https://api.github.com/repos/{repository}/releases/latest", headers=headers)
    with urlopen(request, timeout=30) as response:
        return json.load(response)


def refresh_catalog(catalog: dict) -> tuple[dict, list[str]]:
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
    parser = argparse.ArgumentParser(description="Refresh a reviewed ReleaseShelf GitHub-release catalog.")
    parser.add_argument("--catalog", type=Path, default=Path("public/catalog.json"))
    parser.add_argument("--dry-run", action="store_true", help="Fetch and report changes without writing the catalog")
    args = parser.parse_args()

    catalog = json.loads(args.catalog.read_text(encoding="utf-8"))
    refreshed, changed = refresh_catalog(catalog)
    if args.dry_run:
        print(f"Dry run: {len(changed)} app(s) would update: {', '.join(changed) or 'none'}")
        return 0
    write_json(args.catalog, refreshed)
    print(f"Updated {args.catalog}: {len(changed)} app(s) changed: {', '.join(changed) or 'none'}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
