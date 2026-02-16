import type BetterSqlite3 from 'better-sqlite3'
import type { ProductRow } from '../schema'

type ProductRecord = {
  id: string
  brand_id: string
  title: string
  description: string
  price: number
  image: string
  images_json: string
  source_url: string | null
  last_scraped_at: string | null
  created_at: string
  updated_at: string
}

function parseImages(imagesJson: string, fallback: string): string[] {
  try {
    const parsed = JSON.parse(imagesJson) as unknown
    if (!Array.isArray(parsed)) return [fallback]
    const cleaned = parsed.filter((item): item is string => typeof item === 'string' && item.length > 0)
    return cleaned.length > 0 ? cleaned : [fallback]
  } catch {
    return [fallback]
  }
}

function mapProduct(record: ProductRecord): ProductRow {
  return {
    id: record.id,
    brandId: record.brand_id,
    title: record.title,
    description: record.description,
    price: record.price,
    image: record.image,
    images: parseImages(record.images_json, record.image),
    sourceUrl: record.source_url,
    lastScrapedAt: record.last_scraped_at,
    createdAt: record.created_at,
    updatedAt: record.updated_at,
  }
}

export function countProducts(db: BetterSqlite3.Database): number {
  const row = db.prepare('SELECT COUNT(*) as total FROM products').get() as {
    total: number
  }
  return row.total
}

export function findProductsByBrand(
  db: BetterSqlite3.Database,
  brandId: string,
): ProductRow[] {
  const rows = db
    .prepare(
      `SELECT id, brand_id, title, description, price, image, images_json, source_url, last_scraped_at, created_at, updated_at
       FROM products
       WHERE brand_id = ?
       ORDER BY id ASC`,
    )
    .all(brandId) as ProductRecord[]

  return rows.map(mapProduct)
}

export function findProductById(
  db: BetterSqlite3.Database,
  id: string,
): ProductRow | undefined {
  const row = db
    .prepare(
      `SELECT id, brand_id, title, description, price, image, images_json, source_url, last_scraped_at, created_at, updated_at
       FROM products
       WHERE id = ?`,
    )
    .get(id) as ProductRecord | undefined

  return row ? mapProduct(row) : undefined
}

export function upsertProducts(
  db: BetterSqlite3.Database,
  products: ProductRow[],
) {
  const stmt = db.prepare(`
    INSERT INTO products (
      id, brand_id, title, description, price, image, images_json, source_url, last_scraped_at, created_at, updated_at
    )
    VALUES (
      @id, @brandId, @title, @description, @price, @image, @imagesJson, @sourceUrl, @lastScrapedAt, @createdAt, @updatedAt
    )
    ON CONFLICT(id) DO UPDATE SET
      brand_id = excluded.brand_id,
      title = excluded.title,
      description = excluded.description,
      price = excluded.price,
      image = excluded.image,
      images_json = excluded.images_json,
      source_url = excluded.source_url,
      last_scraped_at = excluded.last_scraped_at,
      updated_at = excluded.updated_at
  `)

  const tx = db.transaction((rows: ProductRow[]) => {
    for (const row of rows) {
      stmt.run({
        id: row.id,
        brandId: row.brandId,
        title: row.title,
        description: row.description,
        price: row.price,
        image: row.image,
        imagesJson: JSON.stringify(row.images && row.images.length > 0 ? row.images : [row.image]),
        sourceUrl: row.sourceUrl,
        lastScrapedAt: row.lastScrapedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    }
  })

  tx(products)
}

export function deleteProductsByBrand(
  db: BetterSqlite3.Database,
  brandId: string,
) {
  db.prepare('DELETE FROM products WHERE brand_id = ?').run(brandId)
}

export function replaceProductsByBrand(
  db: BetterSqlite3.Database,
  brandId: string,
  products: ProductRow[],
) {
  const insertStmt = db.prepare(`
    INSERT INTO products (
      id, brand_id, title, description, price, image, images_json, source_url, last_scraped_at, created_at, updated_at
    )
    VALUES (
      @id, @brandId, @title, @description, @price, @image, @imagesJson, @sourceUrl, @lastScrapedAt, @createdAt, @updatedAt
    )
  `)

  const tx = db.transaction((rows: ProductRow[]) => {
    db.prepare('DELETE FROM products WHERE brand_id = ?').run(brandId)

    for (const row of rows) {
      insertStmt.run({
        id: row.id,
        brandId: row.brandId,
        title: row.title,
        description: row.description,
        price: row.price,
        image: row.image,
        imagesJson: JSON.stringify(
          row.images && row.images.length > 0 ? row.images : [row.image],
        ),
        sourceUrl: row.sourceUrl,
        lastScrapedAt: row.lastScrapedAt,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      })
    }
  })

  tx(products)
}
