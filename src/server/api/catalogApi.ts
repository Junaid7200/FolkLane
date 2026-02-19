import fs from 'node:fs'
import path from 'node:path'
import { getLocalBrands, getLocalItems, isCategory } from '@/data/catalog'

export type ApiBrand = {
  id: string
  name: string
  category: 'luxury' | 'casual' | 'cheap' // Legacy field for routing context
  categories: Array<'luxury' | 'casual' | 'cheap'>
  description?: string
}

export type ApiProduct = {
  id: string
  title: string
  description: string
  price: number
  brandId: string
  image: string
  images: Array<string>
}

type SnapshotPayload = {
  generatedAt?: string
  brands?: Array<{
    id?: string
    name?: string
    category?: string
    categories?: string[]
    description?: string | null
  }>
  products?: Array<{
    id?: string
    title?: string
    description?: string
    price?: number
    brandId?: string
    image?: string
    images?: Array<string>
  }>
}

let snapshotCache: {
  loadedAt: number
  brands: Array<ApiBrand>
  products: Array<ApiProduct>
} | null = null

function shouldPreferSnapshotSource() {
  return Boolean(process.env.NETLIFY)
}

function snapshotPathCandidates() {
  return [
    path.resolve(process.cwd(), 'data', 'catalog.snapshot.json'),
    path.resolve('/var/task/data/catalog.snapshot.json'),
  ]
}

function normalizeSnapshotBrandRows(rows: SnapshotPayload['brands']): Array<ApiBrand> {
  if (!Array.isArray(rows)) return []

  return rows
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .map((row) => {
      const category = typeof row.category === 'string' ? row.category : ''
      const categories = Array.isArray(row.categories)
        ? row.categories.filter((cat): cat is string => typeof cat === 'string' && isCategory(cat))
        : isCategory(category) ? [category] : []

      return {
        id: typeof row.id === 'string' ? row.id : '',
        name: typeof row.name === 'string' ? row.name : '',
        category: categories[0] || '',
        categories,
        description:
          typeof row.description === 'string' ? row.description : undefined,
      }
    })
    .filter((row): row is ApiBrand => 
      row.id.length > 0 && 
      row.name.length > 0 && 
      row.categories.length > 0 &&
      isCategory(row.category)
    )
}

function normalizeSnapshotProductRows(
  rows: SnapshotPayload['products'],
): Array<ApiProduct> {
  if (!Array.isArray(rows)) return []

  return rows
    .filter((row): row is NonNullable<typeof row> => Boolean(row))
    .map((row) => {
      const image = typeof row.image === 'string' ? row.image : ''
      const images = Array.isArray(row.images)
        ? row.images.filter((item): item is string => typeof item === 'string' && item.length > 0)
        : []

      return {
        id: typeof row.id === 'string' ? row.id : '',
        title: typeof row.title === 'string' ? row.title : '',
        description: typeof row.description === 'string' ? row.description : '',
        price:
          typeof row.price === 'number' && Number.isFinite(row.price)
            ? Math.round(row.price)
            : 0,
        brandId: typeof row.brandId === 'string' ? row.brandId : '',
        image,
        images: images.length > 0 ? images : image ? [image] : [],
      }
    })
    .filter(
      (row): row is ApiProduct =>
        row.id.length > 0 &&
        row.brandId.length > 0 &&
        row.title.length > 0 &&
        row.price > 0 &&
        row.image.length > 0,
    )
}

function readSnapshotFromDisk() {
  const cached = snapshotCache
  if (cached) return cached

  for (const candidatePath of snapshotPathCandidates()) {
    try {
      if (!fs.existsSync(candidatePath)) continue
      const raw = fs.readFileSync(candidatePath, 'utf8')
      const parsed = JSON.parse(raw) as SnapshotPayload
      const brands = normalizeSnapshotBrandRows(parsed.brands)
      const products = normalizeSnapshotProductRows(parsed.products)

      if (brands.length === 0 || products.length === 0) continue

      snapshotCache = {
        loadedAt: Date.now(),
        brands,
        products,
      }
      return snapshotCache
    } catch {
      continue
    }
  }

  return null
}

function localBrandsAsApi(): Array<ApiBrand> {
  return getLocalBrands()
    .filter((brand) => Array.isArray(brand.categories) && brand.categories.length > 0)
    .filter((brand) => brand.categories.every(isCategory))
    .map((brand) => ({
      id: brand.id,
      name: brand.name,
      category: brand.category,
      categories: brand.categories,
      description: brand.description,
    }))
}

function localProductsAsApi(): Array<ApiProduct> {
  return getLocalItems().map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    brandId: item.brandId,
    image: item.image,
    images: item.images && item.images.length > 0 ? item.images : [item.image],
  }))
}

async function listBrandsFromDb(): Promise<Array<ApiBrand>> {
  const [{ ensureDatabaseReady }, { getDatabase }, { findAllBrands }] =
    await Promise.all([
      import('@/server/db/init'),
      import('@/server/db/client'),
      import('@/server/db/repositories/brandsRepo'),
    ])

  await ensureDatabaseReady()
  const db = getDatabase()
  const brands = findAllBrands(db)

  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    category: brand.category,
    categories: brand.categories,
    description: brand.description ?? undefined,
  }))
}

async function listBrandProductsFromDb(brandId: string): Promise<Array<ApiProduct>> {
  const [{ ensureDatabaseReady }, { getDatabase }, { findProductsByBrand }] =
    await Promise.all([
      import('@/server/db/init'),
      import('@/server/db/client'),
      import('@/server/db/repositories/productsRepo'),
    ])

  await ensureDatabaseReady()
  const db = getDatabase()
  const products = findProductsByBrand(db, brandId)

  return products.map((product) => ({
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    brandId: product.brandId,
    image: product.image,
    images: product.images.length > 0 ? product.images : [product.image],
  }))
}

async function getProductFromDb(
  productId: string,
): Promise<ApiProduct | undefined> {
  const [{ ensureDatabaseReady }, { getDatabase }, { findProductById }] =
    await Promise.all([
      import('@/server/db/init'),
      import('@/server/db/client'),
      import('@/server/db/repositories/productsRepo'),
    ])

  await ensureDatabaseReady()
  const db = getDatabase()
  const product = findProductById(db, productId)
  if (!product) return undefined

  return {
    id: product.id,
    title: product.title,
    description: product.description,
    price: product.price,
    brandId: product.brandId,
    image: product.image,
    images: product.images.length > 0 ? product.images : [product.image],
  }
}

async function hasBrandInDb(brandId: string): Promise<boolean> {
  const [{ ensureDatabaseReady }, { getDatabase }, { findBrandById }] =
    await Promise.all([
      import('@/server/db/init'),
      import('@/server/db/client'),
      import('@/server/db/repositories/brandsRepo'),
    ])

  await ensureDatabaseReady()
  const db = getDatabase()
  return Boolean(findBrandById(db, brandId))
}

export async function listBrands(): Promise<Array<ApiBrand>> {
  const snapshot = readSnapshotFromDisk()

  if (shouldPreferSnapshotSource() && snapshot) {
    return snapshot.brands
  }

  try {
    return await listBrandsFromDb()
  } catch {
    if (snapshot) return snapshot.brands
    return localBrandsAsApi()
  }
}

export async function listBrandProducts(brandId: string): Promise<Array<ApiProduct>> {
  const snapshot = readSnapshotFromDisk()

  if (shouldPreferSnapshotSource() && snapshot) {
    return snapshot.products.filter((product) => product.brandId === brandId)
  }

  try {
    return await listBrandProductsFromDb(brandId)
  } catch {
    if (snapshot) {
      return snapshot.products.filter((product) => product.brandId === brandId)
    }
    return localProductsAsApi().filter((product) => product.brandId === brandId)
  }
}

export async function getProduct(
  productId: string,
): Promise<ApiProduct | undefined> {
  const snapshot = readSnapshotFromDisk()

  if (shouldPreferSnapshotSource() && snapshot) {
    return snapshot.products.find((product) => product.id === productId)
  }

  try {
    return await getProductFromDb(productId)
  } catch {
    if (snapshot) {
      return snapshot.products.find((product) => product.id === productId)
    }
    return localProductsAsApi().find((product) => product.id === productId)
  }
}

export async function hasBrand(brandId: string) {
  const snapshot = readSnapshotFromDisk()

  if (shouldPreferSnapshotSource() && snapshot) {
    return snapshot.brands.some((brand) => brand.id === brandId)
  }

  try {
    return await hasBrandInDb(brandId)
  } catch {
    if (snapshot) return snapshot.brands.some((brand) => brand.id === brandId)
    return localBrandsAsApi().some((brand) => brand.id === brandId)
  }
}
