import { getDatabase } from './client'
import { seedCatalogIfEmpty } from './seed'

let initPromise: Promise<void> | null = null

function hasColumn(db: ReturnType<typeof getDatabase>, table: string, column: string) {
  const rows = db.prepare(`PRAGMA table_info(${table})`).all() as Array<{
    name: string
  }>
  return rows.some((row) => row.name === column)
}

function ensureScrapeRunsColumns(db: ReturnType<typeof getDatabase>) {
  if (!hasColumn(db, 'scrape_runs', 'triggered_by')) {
    db.exec(
      `ALTER TABLE scrape_runs ADD COLUMN triggered_by TEXT NOT NULL DEFAULT 'manual' CHECK (triggered_by IN ('manual', 'schedule'))`,
    )
  }

  if (!hasColumn(db, 'scrape_runs', 'queue_job_id')) {
    db.exec(`ALTER TABLE scrape_runs ADD COLUMN queue_job_id TEXT`)
  }

  if (!hasColumn(db, 'scrape_runs', 'attempts')) {
    db.exec(`ALTER TABLE scrape_runs ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0`)
  }

  if (!hasColumn(db, 'scrape_runs', 'max_attempts')) {
    db.exec(`ALTER TABLE scrape_runs ADD COLUMN max_attempts INTEGER NOT NULL DEFAULT 1`)
  }
}

function migrateAmeenaToSaima(db: ReturnType<typeof getDatabase>) {
  const legacyBrand = db
    .prepare(
      `SELECT id, name, category, description, created_at, updated_at
       FROM brands
       WHERE id = 'ameena'`,
    )
    .get() as
    | {
        id: string
        name: string
        category: string
        description: string | null
        created_at: string
        updated_at: string
      }
    | undefined

  if (!legacyBrand) return

  const saimaBrandExists = Boolean(
    db
      .prepare(`SELECT 1 FROM brands WHERE id = 'saima' LIMIT 1`)
      .get(),
  )
  const now = new Date().toISOString()

  const tx = db.transaction(() => {
    if (!saimaBrandExists) {
      db.prepare(
        `INSERT INTO brands (id, name, category, description, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      ).run(
        'saima',
        'Saima',
        legacyBrand.category,
        legacyBrand.description,
        legacyBrand.created_at || now,
        now,
      )
    } else {
      db.prepare(`UPDATE brands SET name = ?, updated_at = ? WHERE id = ?`).run(
        'Saima',
        now,
        'saima',
      )
    }

    db.prepare(`UPDATE products SET brand_id = 'saima' WHERE brand_id = 'ameena'`).run()
    db.prepare(
      `UPDATE scrape_runs SET brand_id = 'saima' WHERE brand_id = 'ameena'`,
    ).run()

    const legacyProducts = db
      .prepare(
        `SELECT id FROM products WHERE brand_id = 'saima' AND id LIKE 'ameena-%'`,
      )
      .all() as Array<{ id: string }>

    const hasProductIdStmt = db.prepare(
      `SELECT 1 FROM products WHERE id = ? LIMIT 1`,
    )
    const renameProductIdStmt = db.prepare(
      `UPDATE products SET id = ? WHERE id = ?`,
    )

    for (const product of legacyProducts) {
      const candidateId = `saima-${product.id.slice('ameena-'.length)}`
      const idTaken = Boolean(hasProductIdStmt.get(candidateId))
      if (idTaken) continue
      renameProductIdStmt.run(candidateId, product.id)
    }

    db.prepare(`DELETE FROM brands WHERE id = 'ameena'`).run()
  })

  tx()
}

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
      triggered_by TEXT NOT NULL CHECK (triggered_by IN ('manual', 'schedule')),
      queue_job_id TEXT,
      status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'success', 'failed')),
      attempts INTEGER NOT NULL DEFAULT 0,
      max_attempts INTEGER NOT NULL DEFAULT 1,
      started_at TEXT,
      finished_at TEXT,
      items_found INTEGER,
      error_message TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
    CREATE INDEX IF NOT EXISTS idx_scrape_runs_brand_id ON scrape_runs(brand_id);
  `)

  ensureScrapeRunsColumns(db)
  migrateAmeenaToSaima(db)
  db.exec(
    `CREATE INDEX IF NOT EXISTS idx_scrape_runs_queue_job_id ON scrape_runs(queue_job_id);`,
  )
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
