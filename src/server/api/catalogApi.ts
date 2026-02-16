import {
  getAllBrands,
  getItemById,
  getItemsByBrand,
  isCategory,
} from '@/data/catalog'

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
  const brands = await getAllBrands()
  return brands.filter((brand): brand is ApiBrand => isCategory(brand.category))
}

export async function listBrandProducts(brandId: string): Promise<ApiProduct[]> {
  const items = await getItemsByBrand(brandId)
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    brandId: item.brandId,
    image: item.image,
    images: item.images && item.images.length > 0 ? item.images : [item.image],
  }))
}

export async function getProduct(
  productId: string,
): Promise<ApiProduct | undefined> {
  const item = await getItemById(productId)
  if (!item) return undefined

  return {
    id: item.id,
    title: item.title,
    description: item.description,
    price: item.price,
    brandId: item.brandId,
    image: item.image,
    images: item.images && item.images.length > 0 ? item.images : [item.image],
  }
}

