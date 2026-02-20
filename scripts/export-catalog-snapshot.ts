import fs from 'node:fs'
import path from 'node:path'
import Database from 'better-sqlite3'

type BrandRow = {
  id: string
  name: string
  category: string
  categories: string | null
  description: string | null
}

type ProductRow = {
  id: string
  title: string
  description: string
  price: number
  brandId: string
  image: string
  images_json: string
}

function parseCategories(categoriesJson: string | null, fallbackCategory: string): Array<string> {
  if (!categoriesJson) {
    return [fallbackCategory]
  }
  
  try {
    const parsed = JSON.parse(categoriesJson) as unknown
    if (!Array.isArray(parsed)) return [fallbackCategory]
    const cleaned = parsed.filter(
      (item): item is string => typeof item === 'string' && item.length > 0,
    )
    return cleaned.length > 0 ? cleaned : [fallbackCategory]
  } catch {
    return [fallbackCategory]
  }
}

function parseImages(imagesJson: string, fallback: string): Array<string> {
  try {
    const parsed = JSON.parse(imagesJson) as unknown
    if (!Array.isArray(parsed)) return [fallback]
    const cleaned = parsed.filter(
      (item): item is string => typeof item === 'string' && item.length > 0,
    )
    return cleaned.length > 0 ? cleaned : [fallback]
  } catch {
    return [fallback]
  }
}

function resolvePath(...parts: Array<string>) {
  return path.resolve(process.cwd(), ...parts)
}

function exportSnapshot() {
  const dbPath = resolvePath('data', 'folklane.sqlite')
  const outputPath = resolvePath('data', 'catalog.snapshot.json')

  const db = new Database(dbPath, { readonly: true })
  const brands = db
    .prepare(
      `SELECT id, name, category, categories, description
       FROM brands
       ORDER BY name ASC`,
    )
    .all() as Array<BrandRow>

  const products = db
    .prepare(
      `SELECT id, title, description, price, brand_id as brandId, image, images_json
       FROM products
       ORDER BY id ASC`,
    )
    .all() as Array<ProductRow>

  const snapshot = {
    generatedAt: new Date().toISOString(),
    brands: brands.map((row) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      categories: parseCategories(row.categories, row.category),
      description: row.description,
    })),
    products: products.map((row) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      price: row.price,
      brandId: row.brandId,
      image: row.image,
      images: parseImages(row.images_json, row.image),
    })),
  }

  fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2))
  db.close()

  return {
    outputPath,
    brandCount: brands.length,
    productCount: snapshot.products.length,
  }
}

const result = exportSnapshot()
console.log(
  `[snapshot] wrote ${result.productCount} products across ${result.brandCount} brands -> ${result.outputPath}`,
)
