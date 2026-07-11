import unittest

from scripts.update_catalog import apply_release, select_release_assets


class CatalogIndexerTests(unittest.TestCase):
    def test_select_release_assets_excludes_source_archives_and_keeps_desktop_packages(self):
        assets = [
            {"name": "project-1.0.0-arm64.dmg", "browser_download_url": "https://example/dmg"},
            {"name": "project-1.0.0-x86_64.AppImage", "browser_download_url": "https://example/appimage"},
            {"name": "project-1.0.0-source.tar.gz", "browser_download_url": "https://example/source"},
            {"name": "Source code (zip)", "browser_download_url": "https://example/source.zip"},
        ]

        selected = select_release_assets(assets)

        self.assertEqual([asset["name"] for asset in selected], [
            "project-1.0.0-arm64.dmg",
            "project-1.0.0-x86_64.AppImage",
        ])

    def test_apply_release_updates_release_assets_but_preserves_marketplace_metadata(self):
        app = {
            "slug": "example",
            "category": "Utilities",
            "verification": "verified",
            "release": "v1.0.0",
            "assets": [],
        }
        release = {
            "tag_name": "v1.1.0",
            "published_at": "2026-07-11T15:00:00Z",
            "assets": [{"name": "example.dmg", "browser_download_url": "https://example/dmg"}],
        }

        updated = apply_release(app, release)

        self.assertEqual(updated["release"], "v1.1.0")
        self.assertEqual(updated["updatedAt"], "2026-07-11T15:00:00Z")
        self.assertEqual(updated["assets"], [{"name": "example.dmg", "url": "https://example/dmg"}])
        self.assertEqual(updated["category"], "Utilities")
        self.assertEqual(updated["verification"], "verified")


if __name__ == "__main__":
    unittest.main()
