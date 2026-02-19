import { load } from 'cheerio'
import type { BrandScrapeResult, ScrapeOptions, ScrapedProduct } from '../base/types'
import {
  absoluteUrl,
  dedupeImageUrls,
  fetchText,
  normalizeWhitespace,
  safeProductId,
  sanitizeHtml,
} from '../base/utils'

const BRAND_ID = 'cosset'
const BASE_URL = 'https://www.cosset.pk'
const COLLECTION_SLUGS = ['co-ord-set', 'maxi', 'chikankari'] as const
const COLLECTION_PAGE_SIZE = 250

type CollectionVariant = {
  price?: number | string
}

type CollectionImage = {
  src?: string
}

type CollectionProduct = {
  title?: string
  handle?: string
  body_html?: string
  variants?: CollectionVariant[]
  images?: CollectionImage[]
}

type CollectionProductsResponse = {
  products?: CollectionProduct[]
}

type ShopifyProductJson = {
  title?: string
  description?: string
  body_html?: string
  price?: number | string
  variants?: Array<{
    price?: number | string
  }>
  images?: string[]
  featured_image?: string | null
}

function getCollectionProductsJsonUrl(collectionSlug: string, page: number) {
  const url = new URL(`/collections/${collectionSlug}/products.json`, BASE_URL)
  url.searchParams.set('limit', String(COLLECTION_PAGE_SIZE))
  url.searchParams.set('page', String(page))
  return url.toString()
}

function getProductUrl(handle: string) {
  return `${BASE_URL}/products/${encodeURIComponent(handle)}`
}

function getProductJsonUrl(handle: string) {
  return `${BASE_URL}/products/${encodeURIComponent(handle)}.js`
}

function parseAmount(value: unknown): number | null {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) return null
    if (Number.isInteger(value) && value >= 1000) return value / 100
    return value
  }

  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[^\d.,]/g, '')
  if (!cleaned) return null
  const normalized = cleaned.replace(/,/g, '')
  const parsed = Number.parseFloat(normalized)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}

function parsePriceFromValues(values: unknown[]): number | null {
  for (const value of values) {
    const amount = parseAmount(value)
    if (amount !== null) return Math.round(amount)
  }

  return null
}

function parsePriceFromCollectionProduct(product: CollectionProduct): number | null {
  const values: unknown[] = []
  if (Array.isArray(product.variants)) {
    for (const variant of product.variants) {
      values.push(variant?.price)
    }
  }
  return parsePriceFromValues(values)
}

function parseDescriptionFromHtml(html: string): string {  if (!html) return ''
  return sanitizeHtml(html)
}

function parseCollectionDescription(product: CollectionProduct): string {
  return parseDescriptionFromHtml(product.body_html || '')
}

function parseCollectionImages(product: CollectionProduct): string[] {
  const images: string[] = []
  if (Array.isArray(product.images)) {
    for (const image of product.images) {
      const src = image?.src
      if (!src || src.length === 0) continue
      images.push(absoluteUrl(BASE_URL, src))
    }
  }

  return dedupeImageUrls(images)
}

function parseProductJsonDescription(product: ShopifyProductJson): string {
  return parseDescriptionFromHtml(product.body_html || product.description || '')
}

function parseProductJsonPrice(product: ShopifyProductJson): number | null {
  const values: unknown[] = [product.price]
  if (Array.isArray(product.variants)) {
    for (const variant of product.variants) {
      values.push(variant?.price)
    }
  }
  return parsePriceFromValues(values)
}

function parseProductJsonImages(product: ShopifyProductJson): string[] {
  const values: string[] = []
  if (Array.isArray(product.images)) {
    for (const image of product.images) {
      if (typeof image === 'string' && image.length > 0) {
        values.push(absoluteUrl(BASE_URL, image))
      }
    }
  }
  if (typeof product.featured_image === 'string' && product.featured_image.length > 0) {
    values.push(absoluteUrl(BASE_URL, product.featured_image))
  }

  return dedupeImageUrls(values)
}

async function fetchCollectionPageProducts(
  collectionSlug: string,
  page: number,
): Promise<CollectionProduct[] | null> {
  const response = await fetch(getCollectionProductsJsonUrl(collectionSlug, page), {
    headers: {
      'user-agent':
        'Mozilla/5.0 (compatible; FolkLaneScraper/1.0; +https://folklane.local)',
      accept: 'application/json,text/plain;q=0.9,*/*;q=0.8',
    },
  })

  if (!response.ok) {
    if (page > 1) return null
    throw new Error(
      `Collection request failed (${response.status}) for ${collectionSlug} page ${page}`,
    )
  }

  const contentType = (response.headers.get('content-type') || '').toLowerCase()
  if (!contentType.includes('application/json')) {
    if (page > 1) return null
    throw new Error(
      `Expected JSON collection response for ${collectionSlug} page ${page}`,
    )
  }

  let payload: CollectionProductsResponse | null = null
  try {
    payload = (await response.json()) as CollectionProductsResponse
  } catch {
    if (page > 1) return null
    throw new Error(
      `Invalid JSON collection response for ${collectionSlug} page ${page}`,
    )
  }

  const products = Array.isArray(payload?.products) ? payload.products : []
  return products
}

async function fetchProductJson(handle: string): Promise<ShopifyProductJson | null> {
  try {
    const response = await fetch(getProductJsonUrl(handle), {
      headers: {
        'user-agent':
          'Mozilla/5.0 (compatible; FolkLaneScraper/1.0; +https://folklane.local)',
        accept: 'application/json,text/plain;q=0.9,*/*;q=0.8',
      },
    })
    if (!response.ok) return null

    const text = await response.text()
    return JSON.parse(text) as ShopifyProductJson
  } catch {
    return null
  }
}

async function fallbackDescriptionFromProductPage(handle: string): Promise<string> {
  try {
    const html = await fetchText(getProductUrl(handle))
    const $ = load(html)
    return normalizeWhitespace(
      $('.product__description').first().text() ||
        $('[class*="description"]').first().text() ||
        $('meta[name="description"]').attr('content') ||
        '',
    )
  } catch {
    return ''
  }
}

async function collectCollectionProducts(
  opts: ScrapeOptions,
): Promise<CollectionProduct[]> {
  const products: CollectionProduct[] = []
  const seenHandles = new Set<string>()

  for (const collectionSlug of COLLECTION_SLUGS) {
    for (let page = 1; page <= opts.maxPages; page += 1) {
      const rows = await fetchCollectionPageProducts(collectionSlug, page)
      if (!rows || rows.length === 0) break

      let addedOnPage = 0
      for (const row of rows) {
        const handle = normalizeWhitespace(row.handle || '').toLowerCase()
        if (!handle) continue
        if (seenHandles.has(handle)) continue
        seenHandles.add(handle)
        products.push(row)
        addedOnPage += 1

        if (products.length >= opts.maxProducts) return products
      }

      if (addedOnPage === 0) break
    }
  }

  return products
}

async function parseProduct(
  row: CollectionProduct,
): Promise<ScrapedProduct | null> {
  const handle = normalizeWhitespace(row.handle || '').toLowerCase()
  if (!handle) return null

  let title = normalizeWhitespace(row.title || handle)
  let description = parseCollectionDescription(row)
  let price = parsePriceFromCollectionProduct(row)
  let images = parseCollectionImages(row)

  if (!description || price === null || images.length === 0) {
    const productJson = await fetchProductJson(handle)
    if (productJson) {
      if (!title) {
        title = normalizeWhitespace(productJson.title || handle)
      }

      if (!description) {
        description = parseProductJsonDescription(productJson)
      }

      if (price === null) {
        price = parseProductJsonPrice(productJson)
      }

      if (images.length === 0) {
        images = parseProductJsonImages(productJson)
      } else {
        images = dedupeImageUrls([...images, ...parseProductJsonImages(productJson)])
      }
    }
  }

  if (!description) {
    description = await fallbackDescriptionFromProductPage(handle)
  }
  if (!description) {
    description = title
  }

  const primaryImage = images[0]
  if (!primaryImage) return null
  if (price === null || price <= 0) return null

  return {
    id: safeProductId(BRAND_ID, handle),
    brandId: BRAND_ID,
    title,
    description,
    price,
    image: primaryImage,
    images,
    sourceUrl: getProductUrl(handle),
  }
}

export async function scrapeCosset(
  opts: ScrapeOptions,
): Promise<BrandScrapeResult> {
  const rows = await collectCollectionProducts(opts)
  const items: ScrapedProduct[] = []

  for (const row of rows) {
    const item = await parseProduct(row)
    if (!item) continue
    items.push(item)
    if (items.length >= opts.maxProducts) break
  }

  return {
    brandId: BRAND_ID,
    items,
  }
}
