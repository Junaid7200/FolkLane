import { load } from 'cheerio'
import type {
  BrandScrapeResult,
  ScrapeOptions,
  ScrapedProduct,
} from '../base/types'
import {
  absoluteUrl,
  dedupeImageUrls,
  fetchText,
  normalizeWhitespace,
  safeProductId,
} from '../base/utils'

const BRAND_ID = 'mtf'
const BASE_URL = 'https://mtfestore.com'
const COLLECTION_SLUG = 'new-arrivals'
const COLLECTION_PAGE_SIZE = 250

type ShopifyCollectionVariant = {
  price?: number | string
}

type ShopifyCollectionImage = {
  src?: string
}

type ShopifyCollectionProduct = {
  id?: number
  title?: string
  handle?: string
  body_html?: string
  variants?: Array<ShopifyCollectionVariant>
  images?: Array<ShopifyCollectionImage>
}

type ShopifyCollectionResponse = {
  products?: Array<ShopifyCollectionProduct>
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

function parsePrice(product: ShopifyCollectionProduct): number | null {
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

function parseDescription(product: ShopifyCollectionProduct): string {
  const html = normalizeWhitespace(product.body_html || '')
  if (!html) return ''

  const $ = load(`<div>${html}</div>`)
  const text = normalizeWhitespace($.text())
  return text
}

function parseImages(product: ShopifyCollectionProduct): Array<string> {
  const images: Array<string> = []

  if (Array.isArray(product.images)) {
    for (const image of product.images) {
      const src = image?.src
      if (!src || src.length === 0) continue
      images.push(absoluteUrl(BASE_URL, src))
    }
  }

  return dedupeImageUrls(images)
}

async function fetchCollectionPageProducts(
  page: number,
): Promise<Array<ShopifyCollectionProduct> | null> {
  const response = await fetch(getCollectionProductsJsonUrl(page), {
    headers: {
      'user-agent':
        'Mozilla/5.0 (compatible; FolkLaneScraper/1.0; +https://folklane.local)',
      accept: 'application/json,text/plain;q=0.9,*/*;q=0.8',
    },
  })

  if (!response.ok) {
    if (page > 1) return null
    throw new Error(
      `Collection request failed (${response.status}) for page ${page}`,
    )
  }

  const contentType = response.headers.get('content-type') || ''
  if (!contentType.toLowerCase().includes('application/json')) {
    if (page > 1) return null
    throw new Error(`Expected JSON collection response for page ${page}`)
  }

  let payload: ShopifyCollectionResponse | null = null
  try {
    payload = (await response.json()) as ShopifyCollectionResponse
  } catch {
    if (page > 1) return null
    throw new Error(`Invalid JSON collection response for page ${page}`)
  }

  const products = Array.isArray(payload?.products) ? payload.products : []
  return products
}

async function collectProducts(
  opts: ScrapeOptions,
): Promise<Array<ShopifyCollectionProduct>> {
  const products: Array<ShopifyCollectionProduct> = []
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

async function fallbackDescriptionFromProductPage(
  handle: string,
): Promise<string> {
  try {
    const html = await fetchText(getProductUrl(handle))
    const $ = load(html)
    const text = normalizeWhitespace(
      $('.product__description').first().text() ||
        $('[class*="description"]').first().text() ||
        $('meta[name="description"]').attr('content') ||
        '',
    )
    return text
  } catch {
    return ''
  }
}

async function parseProduct(
  product: ShopifyCollectionProduct,
): Promise<ScrapedProduct | null> {
  const handle = normalizeWhitespace(product.handle || '').toLowerCase()
  if (!handle) return null

  const title = normalizeWhitespace(product.title || handle)
  const price = parsePrice(product)
  if (price === null || price <= 0) return null

  const images = parseImages(product)
  const primaryImage = images[0]
  if (!primaryImage) return null

  let description = parseDescription(product)
  if (!description) {
    description = await fallbackDescriptionFromProductPage(handle)
  }

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

export async function scrapeMtf(
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
