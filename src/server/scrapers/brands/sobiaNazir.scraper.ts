import { load } from 'cheerio'
import type { BrandScrapeResult, ScrapeOptions, ScrapedProduct } from '../base/types'
import {
  absoluteUrl,
  dedupeImageUrls,
  dedupeStrings,
  fetchText,
  normalizeWhitespace,
  productHandleFromUrl,
  safeProductId,
} from '../base/utils'

const BRAND_ID = 'sobia-nazir'
const BASE_URL = 'https://sobianazir.net'

type ShopifyProductJson = {
  title?: string
  description?: string
  body_html?: string
  price?: number | string
  variants?: Array<{
    price?: number | string
  }>
  images?: Array<string>
  featured_image?: string | null
}

function getProductJsonUrl(handle: string) {
  return `${BASE_URL}/products/${encodeURIComponent(handle)}.js`
}

function normalizeProductUrl(href: string): string | null {
  try {
    const absolute = new URL(href, BASE_URL)
    const handle = productHandleFromUrl(absolute.toString())
    if (!handle) return null

    absolute.pathname = `/products/${handle}`
    absolute.search = ''
    absolute.hash = ''
    return absolute.toString()
  } catch {
    return null
  }
}

function extractProductUrlsFromHome(html: string): Array<string> {
  const $ = load(html)
  const urls: Array<string> = []

  $('a[href*="/products/"]').each((_, element) => {
    const href = $(element).attr('href')
    if (!href) return
    const normalized = normalizeProductUrl(href)
    if (normalized) urls.push(normalized)
  })

  return dedupeStrings(urls)
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

function parsePrice(data: ShopifyProductJson): number | null {
  const values: Array<unknown> = [data.price]
  if (Array.isArray(data.variants)) {
    for (const variant of data.variants) {
      values.push(variant?.price)
    }
  }

  for (const value of values) {
    const amount = parseAmount(value)
    if (amount !== null) return Math.round(amount)
  }

  return null
}

function parseDescription(data: ShopifyProductJson): string {
  const cleaned = normalizeWhitespace(data.body_html || data.description || '')
  if (!cleaned) return ''

  const $ = load(`<div>${cleaned}</div>`)
  return normalizeWhitespace($.text())
}

function parseImages(data: ShopifyProductJson): Array<string> {
  const images: Array<string> = []

  if (Array.isArray(data.images)) {
    for (const image of data.images) {
      if (typeof image === 'string' && image.length > 0) {
        images.push(absoluteUrl(BASE_URL, image))
      }
    }
  }

  if (typeof data.featured_image === 'string' && data.featured_image.length > 0) {
    images.push(absoluteUrl(BASE_URL, data.featured_image))
  }

  return dedupeImageUrls(images)
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
    const raw = await response.text()
    return JSON.parse(raw) as ShopifyProductJson
  } catch {
    return null
  }
}

async function fallbackDescriptionFromProductPage(handle: string): Promise<string> {
  try {
    const html = await fetchText(`${BASE_URL}/products/${encodeURIComponent(handle)}`)
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

async function parseProduct(sourceUrl: string): Promise<ScrapedProduct | null> {
  const handle = productHandleFromUrl(sourceUrl)
  if (!handle) return null

  const payload = await fetchProductJson(handle)
  if (!payload) return null

  const title = normalizeWhitespace(payload.title || handle)
  const price = parsePrice(payload)
  if (price === null || price <= 0) return null

  const images = parseImages(payload)
  const primaryImage = images[0]
  if (!primaryImage) return null

  let description = parseDescription(payload)
  if (!description) {
    description = await fallbackDescriptionFromProductPage(handle)
  }
  if (!description) {
    description = title
  }

  return {
    id: safeProductId(BRAND_ID, handle),
    brandId: BRAND_ID,
    title,
    description,
    price,
    image: primaryImage,
    images,
    sourceUrl,
  }
}

async function collectProductUrls(opts: ScrapeOptions): Promise<Array<string>> {
  const html = await fetchText(BASE_URL)
  const urls = extractProductUrlsFromHome(html)
  if (urls.length <= opts.maxProducts) return urls
  return urls.slice(0, opts.maxProducts)
}

export async function scrapeSobiaNazir(
  opts: ScrapeOptions,
): Promise<BrandScrapeResult> {
  const productUrls = await collectProductUrls(opts)
  const items: Array<ScrapedProduct> = []

  for (const productUrl of productUrls) {
    try {
      const item = await parseProduct(productUrl)
      if (!item) continue
      items.push(item)
      if (items.length >= opts.maxProducts) break
    } catch {
      // Continue if one product fails.
    }
  }

  return {
    brandId: BRAND_ID,
    items,
  }
}
