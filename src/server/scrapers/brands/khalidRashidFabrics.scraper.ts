import { load } from 'cheerio'
import type { BrandScrapeResult, ScrapeOptions, ScrapedProduct } from '../base/types'
import {
  absoluteUrl,
  dedupeImageUrls,
  fetchJson,
  normalizeWhitespace,
  safeProductId,
  sanitizeHtml,
} from '../base/utils'

const BRAND_ID = 'khalid-rashid-fabrics'
const BASE_URL = 'https://www.sokamal.com'
const COLLECTION_SLUG = 'new-arrival-summer-26'
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
  variants?: Array<CollectionVariant>
  images?: Array<CollectionImage>
}

type CollectionProductsResponse = {
  products?: Array<CollectionProduct>
}

function getCollectionProductsJsonUrl(page: number) {
  const url = new URL(`/collections/${COLLECTION_SLUG}/products.json`, BASE_URL)
  url.searchParams.set('limit', String(COLLECTION_PAGE_SIZE))
  url.searchParams.set('page', String(page))
  return url.toString()
}

function getProductUrl(handle: string) {
  return `${BASE_URL}/products/${encodeURIComponent(handle)}`
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

function parsePrice(product: CollectionProduct): number | null {
  const values: Array<unknown> = []
  if (Array.isArray(product.variants)) {
    for (const variant of product.variants) {
      values.push(variant?.price)
    }
  }

  for (const value of values) {
    const amount = parseAmount(value)
    if (amount !== null) return Math.round(amount)
  }

  return null
}

function parseDescription(product: CollectionProduct, fallbackTitle: string): string {
  const html = product.body_html || ''
  if (!html) return fallbackTitle
  
  const sanitized = sanitizeHtml(html)
  return sanitized || fallbackTitle
}

function parseImages(product: CollectionProduct): Array<string> {
  const values: Array<string> = []
  if (Array.isArray(product.images)) {
    for (const image of product.images) {
      const src = image?.src
      if (!src || src.length === 0) continue
      values.push(absoluteUrl(BASE_URL, src))
    }
  }

  return dedupeImageUrls(values)
}

async function fetchCollectionPageProducts(
  page: number,
): Promise<Array<CollectionProduct> | null> {
  try {
    const payload = await fetchJson<CollectionProductsResponse>(
      getCollectionProductsJsonUrl(page),
    )
    const products = Array.isArray(payload.products) ? payload.products : []
    return products
  } catch {
    if (page > 1) return null
    throw new Error(`Unable to fetch Khalid Rashid collection page ${page}`)
  }
}

async function collectProducts(
  opts: ScrapeOptions,
): Promise<Array<CollectionProduct>> {
  const products: Array<CollectionProduct> = []
  const seenHandles = new Set<string>()

  for (let page = 1; page <= opts.maxPages; page += 1) {
    const rows = await fetchCollectionPageProducts(page)
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

  return products
}

async function parseProduct(row: CollectionProduct): Promise<ScrapedProduct | null> {
  const handle = normalizeWhitespace(row.handle || '').toLowerCase()
  if (!handle) return null

  const title = normalizeWhitespace(row.title || handle)
  const price = parsePrice(row)
  if (price === null || price <= 0) return null

  const images = parseImages(row)
  const primaryImage = images[0]
  if (!primaryImage) return null

  const description = parseDescription(row, title)

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

export async function scrapeKhalidRashidFabrics(
  opts: ScrapeOptions,
): Promise<BrandScrapeResult> {
  const rows = await collectProducts(opts)
  const items: Array<ScrapedProduct> = []

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
