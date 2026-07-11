import { parseCatalogDocument, type CatalogDocument } from "./catalog-source";

export type CatalogSource = "remote" | "bundled";

export interface LoadedCatalog {
  document: CatalogDocument;
  source: CatalogSource;
}

type Fetcher = (input: string, init?: RequestInit) => Promise<Response>;

async function fetchDocument(fetcher: Fetcher, url: string): Promise<CatalogDocument> {
  const response = await fetcher(url, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Catalog request failed: ${response.status}`);
  return parseCatalogDocument(await response.json());
}

export async function loadCatalog(
  fetcher: Fetcher = fetch,
  remoteUrl = import.meta.env.VITE_CATALOG_URL as string | undefined,
): Promise<LoadedCatalog> {
  if (remoteUrl) {
    try {
      return { document: await fetchDocument(fetcher, remoteUrl), source: "remote" };
    } catch {
      // The bundled file is intentionally the only fallback source.
    }
  }

  return { document: await fetchDocument(fetcher, "/catalog.json"), source: "bundled" };
}
