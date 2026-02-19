import { getLocalBrands, getLocalItems, isCategory } from '../../data/catalog'
import { getDatabase } from './client'
import { countBrands, upsertBrands } from './repositories/brandsRepo'
import { countProducts, upsertProducts } from './repositories/productsRepo'
import type { BrandRow, ProductRow } from './schema'

function nowIso() {
  return new Date().toISOString()
}

function normalizeBrands(rows: ReturnType<typeof getLocalBrands>): BrandRow[] {
  const now = nowIso()
  return rows
    .filter((brand) => Array.isArray(brand.categories) && brand.categories.length > 0)
    .filter((brand) => brand.categories.every(isCategory))
    .map((brand) => ({
      id: brand.id,
      name: brand.name,
      category: brand.category,
      categories: brand.categories,
      description: brand.description || null,
      createdAt: now,
      updatedAt: now,
    }))
}

function normalizeProducts(
  rows: ReturnType<typeof getLocalItems>,
): ProductRow[] {
  const now = nowIso()
  return rows.map((item) => ({
    id: item.id,
    brandId: item.brandId,
    title: item.title,
    description: item.description,
    price: item.price,
    image: item.image,
    images: item.images && item.images.length > 0 ? item.images : [item.image],
    sourceUrl: null,
    lastScrapedAt: null,
    createdAt: now,
    updatedAt: now,
  }))
}

export async function seedCatalogIfEmpty() {
  const db = getDatabase()
  const existingBrandCount = countBrands(db)
  const existingProductCount = countProducts(db)
  const shouldSeed = existingBrandCount === 0 || existingProductCount === 0

  if (!shouldSeed) return false

  const [brands, products] = [getLocalBrands(), getLocalItems()]

  upsertBrands(db, normalizeBrands(brands))
  upsertProducts(db, normalizeProducts(products))
  return true
}

export async function ensureLocalBrandsUpserted() {
  const db = getDatabase()
  const brands = getLocalBrands()
  upsertBrands(db, normalizeBrands(brands))
  return brands.length
}
