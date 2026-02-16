import { getDatabase } from './client'
import { seedCatalogIfEmpty } from './seed'

let initPromise: Promise<void> | null = null

function initializeSchema() {
  const db = getDatabase()

  db.exec(`
    CREATE TABLE IF NOT EXISTS brands (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK (category IN ('luxury', 'casual', 'cheap')),
      description TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      brand_id TEXT NOT NULL REFERENCES brands(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      price INTEGER NOT NULL,
      image TEXT NOT NULL,
      images_json TEXT NOT NULL,
      source_url TEXT,
      last_scraped_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS scrape_runs (
      id TEXT PRIMARY KEY,
      brand_id TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'success', 'failed')),
      started_at TEXT,
      finished_at TEXT,
      items_found INTEGER,
      error_message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
    CREATE INDEX IF NOT EXISTS idx_scrape_runs_brand_id ON scrape_runs(brand_id);
  `)
}

export async function ensureDatabaseReady() {
  if (!initPromise) {
    initPromise = (async () => {
      initializeSchema()
      await seedCatalogIfEmpty()
    })()
  }

  return initPromise
}

