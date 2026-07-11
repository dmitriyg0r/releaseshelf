# Remote Catalog Implementation Plan

> **For Hermes:** Implement this plan with test-first vertical slices.

**Goal:** Decouple the marketplace catalog from the desktop bundle so its entries and release links can be updated without shipping a new app version.

**Architecture:** A versioned JSON document provides the curated entries. The React client validates it before rendering, loads `VITE_CATALOG_URL` when configured, and falls back to the bundled `/catalog.json` document if that endpoint is unavailable. GitHub crawling remains a future server/CI responsibility; the client consumes only reviewed catalog data.

**Tech Stack:** React, TypeScript, Vite public assets, Vitest.

---

### Task 1: Define and validate catalog JSON

**Files:** `public/catalog.json`, `src/catalog-source.ts`, `src/catalog-source.test.ts`

Write failing tests for accepting a versioned valid document and rejecting malformed records. Implement a small parser with no external schema dependency.

### Task 2: Fetch catalog with controlled fallback

**Files:** `src/catalog-client.ts`, `src/catalog-client.test.ts`

Write a failing test for a configured remote endpoint and an unavailable remote endpoint. Implement fetching with an injected `fetch` dependency and fallback only to the local catalog URL.

### Task 3: Wire asynchronous catalog state into the marketplace

**Files:** `src/App.tsx`, `src/App.test.tsx`

Render loading and source metadata while preserving search/platform compatibility behavior.

### Task 4: Verify and package

Run `npm test`, `npm run build`, `cargo test --manifest-path src-tauri/Cargo.toml`, and `npm run tauri build -- --debug`.
