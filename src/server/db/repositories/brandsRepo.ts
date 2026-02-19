import type BetterSqlite3 from 'better-sqlite3'
import type { BrandRow } from '../schema'

type BrandRecord = {
  id: string
  name: string
  category: BrandRow['category']
  categories: string
  description: string | null
  created_at: string
  updated_at: string
}

function mapBrand(record: BrandRecord): BrandRow {
  let categories: BrandRow['categories']
  try {
    categories = JSON.parse(record.categories)
  } catch {
    // Fallback if categories is not valid JSON
    categories = [record.category]
  }

  return {
    id: record.id,
    name: record.name,
    category: record.category,
    categories,
    description: record.description,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

export function countBrands(db: BetterSqlite3.Database): number {
  const row = db.prepare('SELECT COUNT(*) as total FROM brands').get() as {
    total: number
  }
  return row.total
}

export function findAllBrands(db: BetterSqlite3.Database): BrandRow[] {
  const rows = db
    .prepare(
      'SELECT id, name, category, categories, description, created_at, updated_at FROM brands ORDER BY name ASC',
    )
    .all() as BrandRecord[]

  return rows.map(mapBrand)
}

export function findBrandById(
  db: BetterSqlite3.Database,
  id: string,
): BrandRow | undefined {
  const row = db
    .prepare(
      'SELECT id, name, category, categories, description, created_at, updated_at FROM brands WHERE id = ?',
    )
    .get(id) as BrandRecord | undefined

  return row ? mapBrand(row) : undefined
}

export function upsertBrands(db: BetterSqlite3.Database, brands: BrandRow[]) {
  const stmt = db.prepare(`
    INSERT INTO brands (id, name, category, categories, description, created_at, updated_at)
    VALUES (@id, @name, @category, @categories, @description, @createdAt, @updatedAt)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      category = excluded.category,
      categories = excluded.categories,
      description = excluded.description,
      updated_at = excluded.updated_at
  `)

  const tx = db.transaction((rows: BrandRow[]) => {
    for (const row of rows) {
      const categoriesJson = JSON.stringify(row.categories)
      stmt.run({ ...row, categories: categoriesJson })
    }
  })

  tx(brands)
}

