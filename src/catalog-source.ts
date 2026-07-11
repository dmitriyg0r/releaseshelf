export type Verification = "verified" | "community" | "discovered";

export interface CatalogAsset {
  name: string;
  url: string;
}

export interface CatalogApp {
  slug: string;
  name: string;
  description: string;
  category: string;
  repositoryUrl: string;
  release: string;
  verification: Verification;
  accent: string;
  assets: CatalogAsset[];
  updatedAt?: string;
  featured?: boolean;
}

export interface CatalogDocument {
  version: 1;
  generatedAt: string;
  apps: CatalogApp[];
}

function isDirectReleaseUrl(value: unknown): value is string {
  return typeof value === "string" && /^https:\/\/github\.com\/[^/]+\/[^/]+\/releases\/download\//.test(value);
}

function parseApp(value: unknown): CatalogApp {
  if (!value || typeof value !== "object") throw new Error("Invalid catalog app");
  const app = value as Record<string, unknown>;
  const requiredStrings = ["slug", "name", "description", "category", "repositoryUrl", "release", "accent"];

  if (requiredStrings.some((key) => typeof app[key] !== "string")) throw new Error("Invalid catalog app");
  if (!["verified", "community", "discovered"].includes(app.verification as string)) throw new Error("Invalid catalog app");
  if (!Array.isArray(app.assets) || app.assets.length === 0) throw new Error("Invalid catalog app");

  const assets = app.assets.map((asset) => {
    if (!asset || typeof asset !== "object") throw new Error("Invalid catalog app");
    const item = asset as Record<string, unknown>;
    if (typeof item.name !== "string" || !isDirectReleaseUrl(item.url)) throw new Error("Invalid catalog app");
    return { name: item.name, url: item.url };
  });

  return {
    slug: app.slug as string,
    name: app.name as string,
    description: app.description as string,
    category: app.category as string,
    repositoryUrl: app.repositoryUrl as string,
    release: app.release as string,
    updatedAt: typeof app.updatedAt === "string" ? app.updatedAt : undefined,
    verification: app.verification as Verification,
    accent: app.accent as string,
    featured: app.featured === true,
    assets,
  };
}

export function parseCatalogDocument(value: unknown): CatalogDocument {
  if (!value || typeof value !== "object") throw new Error("Invalid catalog document");
  const document = value as Record<string, unknown>;
  if (document.version !== 1 || typeof document.generatedAt !== "string" || !Array.isArray(document.apps)) {
    throw new Error("Invalid catalog document");
  }

  return { version: 1, generatedAt: document.generatedAt, apps: document.apps.map(parseApp) };
}
