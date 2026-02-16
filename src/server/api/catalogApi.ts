import {
  ensureDatabaseReady,
} from '@/server/db/init'
import { getDatabase } from '@/server/db/client'
import {
  findAllBrands,
  findBrandById,
} from '@/server/db/repositories/brandsRepo'
import {
  findProductById,
  findProductsByBrand,
} from '@/server/db/repositories/productsRepo'

export type ApiBrand = {
  id: string
  name: string
  category: 'luxury' | 'casual' | 'cheap'
  description?: string
}

export type ApiProduct = {
  id: string
  title: string
  description: string
  price: number
  brandId: string
  image: string
  images: string[]
}

export async function listBrands(): Promise<ApiBrand[]> {
  await ensureDatabaseReady()
  const db = getDatabase()
  const brands = findAllBrands(db)

  return brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    category: brand.category,
    description: brand.description ?? undefined,
  }))
}

export async function listBrandProducts(brandId: string): Promise<ApiProduct[]> {
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
    images:
      product.images && product.images.length > 0
        ? product.images
        : [product.image],
  }))
}

export async function getProduct(
  productId: string,
): Promise<ApiProduct | undefined> {
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
    images:
      product.images && product.images.length > 0
        ? product.images
        : [product.image],
  }
}

export async function hasBrand(brandId: string) {
  await ensureDatabaseReady()
  const db = getDatabase()
  return Boolean(findBrandById(db, brandId))
}
