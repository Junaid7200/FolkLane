import { load } from 'cheerio'
import { serverConfig } from '../../config/env'
import type { BrandScrapeResult, ScrapeOptions, ScrapedProduct } from '../base/types'
import {
  absoluteUrl,
  dedupeImageUrls,
  dedupeStrings,
  fetchJson,
  fetchText,
  normalizeWhitespace,
  productHandleFromUrl,
  safeProductId,
} from '../base/utils'

const BRAND_ID = 'd-m-collection'
const BASE_URL = 'https://mydmcollection.com'
const COLLECTION_SLUGS = ['small', 'medium', 'large'] as const
const MAX_PRODUCTS_PER_COLLECTION = 30
const IMAGE_FILE_PATTERN = /\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i

type ShopifyProductJson = {
  images?: string[]
  featured_image?: string | null
  price?: number | string
  variants?: Array<{
    price?: number | string
  }>
}

function getCollectionPageUrl(collectionSlug: string, page: number) {
  const url = new URL(`/collections/${collectionSlug}`, BASE_URL)
  url.searchParams.set('page', String(page))
  return url.toString()
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

function extractProductUrlsFromListing(html: string): string[] {
  const $ = load(html)
  const urls: string[] = []

  $('a[href*="/products/"]').each((_, element) => {
    const href = $(element).attr('href')
    if (!href) return
    const normalized = normalizeProductUrl(href)
    if (normalized) urls.push(normalized)
  })

  return dedupeStrings(urls)
}

function parseUsdAmount(value: unknown): number | null {
  if (typeof value === 'number') {
    if (!Number.isFinite(value) || value <= 0) return null
    if (Number.isInteger(value) && value >= 1000) return value / 100
    return value
  }

  if (typeof value !== 'string') return null
  const cleaned = value.replace(/[^\d.,]/g, '')
  if (!cleaned) return null

  const hasDecimal = cleaned.includes('.')
  const normalized = cleaned.replace(/,/g, '')
  const parsed = Number.parseFloat(normalized)
  if (!Number.isFinite(parsed) || parsed <= 0) return null

  if (!hasDecimal && parsed >= 1000) return parsed / 100
  return parsed
}

function usdToPkr(usdAmount: number): number {
  const rate =
    Number.isFinite(serverConfig.usdToPkrRate) && serverConfig.usdToPkrRate > 0
      ? serverConfig.usdToPkrRate
      : 280
  return Math.round(usdAmount * rate)
}

function extractUrlsFromSet(value: string): string[] {
  return value
    .split(',')
    .map((part) => part.trim().split(/\s+/)[0] || '')
    .filter((item) => item.length > 0)
}

function extractUrlsFromStyle(styleValue: string): string[] {
  const urls: string[] = []
  const pattern = /url\((['"]?)(.*?)\1\)/gi
  let match: RegExpExecArray | null = pattern.exec(styleValue)

  while (match) {
    const candidate = match[2]?.trim()
    if (candidate) urls.push(candidate)
    match = pattern.exec(styleValue)
  }

  return urls
}

function toAbsoluteImageUrl(href: string): string | null {
  try {
    return absoluteUrl(BASE_URL, href)
  } catch {
    return null
  }
}

function isLikelyProductImage(url: string): boolean {
  const value = url.toLowerCase()
  return value.includes('/cdn/shop/files/') && IMAGE_FILE_PATTERN.test(value)
}

function isPreferredShopifyImage(url: string): boolean {
  try {
    const parsed = new URL(url)
    const host = parsed.hostname.toLowerCase()
    return host === 'cdn.shopify.com' && parsed.pathname.includes('/s/files/')
  } catch {
    return false
  }
}

function isLowQualityPlaceholderImage(url: string): boolean {
  return /_1x1(?=\.[a-z0-9]+(?:\?|$))/i.test(url)
}

function sanitizeGalleryImages(images: string[]): string[] {
  const normalized = dedupeImageUrls(images)
  const withoutPlaceholders = normalized.filter(
    (image) => !isLowQualityPlaceholderImage(image),
  )
  if (withoutPlaceholders.length === 0) return normalized

  const preferred = withoutPlaceholders.filter(isPreferredShopifyImage)
  if (preferred.length > 0) {
    return dedupeImageUrls(preferred)
  }

  return dedupeImageUrls(withoutPlaceholders)
}

function parseJsonLdProductImages($: ReturnType<typeof load>): string[] {
  const images: string[] = []

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).html()
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as unknown
      const blocks = Array.isArray(parsed) ? parsed : [parsed]

      for (const block of blocks) {
        if (!block || typeof block !== 'object') continue
        const obj = block as Record<string, unknown>
        const typeValue = obj['@type']
        const isProduct =
          typeValue === 'Product' ||
          (Array.isArray(typeValue) && typeValue.includes('Product'))
        if (!isProduct) continue

        const imageValue = obj.image
        if (Array.isArray(imageValue)) {
          for (const image of imageValue) {
            if (typeof image === 'string') {
              images.push(absoluteUrl(BASE_URL, image))
            }
          }
        } else if (typeof imageValue === 'string') {
          images.push(absoluteUrl(BASE_URL, imageValue))
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  })

  return sanitizeGalleryImages(images)
}

function parseJsonLdPriceToPkr($: ReturnType<typeof load>): number | null {
  let priceInPkr: number | null = null

  $('script[type="application/ld+json"]').each((_, element) => {
    if (priceInPkr !== null) return

    const raw = $(element).html()
    if (!raw) return

    try {
      const parsed = JSON.parse(raw) as unknown
      const blocks = Array.isArray(parsed) ? parsed : [parsed]

      for (const block of blocks) {
        if (!block || typeof block !== 'object') continue
        const obj = block as Record<string, unknown>
        const typeValue = obj['@type']
        const isProduct =
          typeValue === 'Product' ||
          (Array.isArray(typeValue) && typeValue.includes('Product'))
        if (!isProduct) continue

        const offers = obj.offers
        if (!offers) continue

        const offerBlocks = Array.isArray(offers) ? offers : [offers]
        for (const offer of offerBlocks) {
          if (!offer || typeof offer !== 'object') continue
          const priceValue = (offer as Record<string, unknown>).price
          const usdAmount = parseUsdAmount(priceValue)
          if (usdAmount === null) continue
          priceInPkr = usdToPkr(usdAmount)
          return
        }
      }
    } catch {
      // Ignore malformed JSON-LD blocks.
    }
  })

  return priceInPkr
}

function parseDomGalleryImages($: ReturnType<typeof load>): string[] {
  const rawValues: string[] = []

  $('a.product_thumb, a[href*="/cdn/shop/files/"], [data-bgset], [data-src], [data-zoom], img[src*="/cdn/shop/files/"]').each(
    (_, element) => {
      const el = $(element)
      const attrs = [
        el.attr('href'),
        el.attr('data-bgset'),
        el.attr('data-src'),
        el.attr('data-zoom'),
        el.attr('srcset'),
        el.attr('src'),
        el.attr('style'),
      ]
      for (const attr of attrs) {
        if (attr && attr.trim().length > 0) rawValues.push(attr.trim())
      }
    },
  )

  const candidates: string[] = []
  for (const value of rawValues) {
    if (value.includes('url(')) {
      candidates.push(...extractUrlsFromStyle(value))
      continue
    }

    if (
      value.includes(',') ||
      /\s\d+w\b/.test(value) ||
      /\s\d+x\b/.test(value)
    ) {
      candidates.push(...extractUrlsFromSet(value))
      continue
    }

    candidates.push(value)
  }

  const normalized = candidates
    .map((candidate) => toAbsoluteImageUrl(candidate))
    .filter((value): value is string => Boolean(value))
    .filter(isLikelyProductImage)

  return sanitizeGalleryImages(normalized)
}

async function fetchShopifyProductData(handle: string) {
  return fetchJson<ShopifyProductJson>(getProductJsonUrl(handle))
}

function parseShopifyProductPriceToPkr(data: ShopifyProductJson): number | null {
  const candidatePrices: unknown[] = [data.price]
  if (Array.isArray(data.variants)) {
    for (const variant of data.variants) {
      candidatePrices.push(variant?.price)
    }
  }

  for (const candidate of candidatePrices) {
    const usdAmount = parseUsdAmount(candidate)
    if (usdAmount !== null) return usdToPkr(usdAmount)
  }

  return null
}

function parseShopifyProductImages(data: ShopifyProductJson): string[] {
  const images: string[] = []
  if (Array.isArray(data.images)) {
    for (const image of data.images) {
      if (typeof image === 'string') {
        images.push(absoluteUrl(BASE_URL, image))
      }
    }
  }
  if (typeof data.featured_image === 'string') {
    images.push(absoluteUrl(BASE_URL, data.featured_image))
  }

  return sanitizeGalleryImages(images)
}

function parseDomPriceToPkr($: ReturnType<typeof load>): number | null {
  const values = [
    normalizeWhitespace($('meta[property="product:price:amount"]').attr('content') || ''),
    normalizeWhitespace($('[itemprop="price"]').attr('content') || ''),
    normalizeWhitespace($('.price .money').first().text() || ''),
    normalizeWhitespace($('[class*="price"]').first().text() || ''),
  ]

  for (const value of values) {
    const usdAmount = parseUsdAmount(value)
    if (usdAmount !== null) return usdToPkr(usdAmount)
  }

  return null
}

async function parseProduct(
  html: string,
  sourceUrl: string,
): Promise<ScrapedProduct | null> {
  const $ = load(html)
  const handle = productHandleFromUrl(sourceUrl)
  if (!handle) return null

  const title =
    normalizeWhitespace(
      $('meta[property="og:title"]').attr('content') ||
        $('h1').first().text() ||
        $('title').text(),
    ) || handle

  const description = normalizeWhitespace(
    $('meta[name="description"]').attr('content') ||
      $('.product__description').first().text() ||
      $('[class*="description"]').first().text() ||
      '',
  )

  let shopifyImages: string[] = []
  let shopifyPriceInPkr: number | null = null
  try {
    const shopifyData = await fetchShopifyProductData(handle)
    shopifyImages = parseShopifyProductImages(shopifyData)
    shopifyPriceInPkr = parseShopifyProductPriceToPkr(shopifyData)
  } catch {
    // Continue with DOM/JSON-LD fallbacks if this endpoint is unavailable.
  }

  const domImages = parseDomGalleryImages($)
  const jsonLdImages = parseJsonLdProductImages($)
  const ogImage = $('meta[property="og:image"]').attr('content')
  const images = sanitizeGalleryImages([
    ...shopifyImages,
    ...domImages,
    ...jsonLdImages,
    ...(ogImage ? [absoluteUrl(BASE_URL, ogImage)] : []),
  ])

  const primaryImage = images[0]
  if (!primaryImage) return null

  const price =
    shopifyPriceInPkr ?? parseJsonLdPriceToPkr($) ?? parseDomPriceToPkr($)
  if (price === null || price <= 0) return null

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

async function collectProductUrls(opts: ScrapeOptions): Promise<string[]> {
  const urls: string[] = []
  const seen = new Set<string>()

  for (const collectionSlug of COLLECTION_SLUGS) {
    let collectedInCollection = 0
    const maxForThisCollection = Math.min(
      MAX_PRODUCTS_PER_COLLECTION,
      opts.maxProducts - urls.length,
    )
    if (maxForThisCollection <= 0) break

    for (let page = 1; page <= opts.maxPages; page += 1) {
      const html = await fetchText(getCollectionPageUrl(collectionSlug, page))
      const pageUrls = extractProductUrlsFromListing(html)
      let addedOnPage = 0

      for (const url of pageUrls) {
        if (seen.has(url)) continue
        seen.add(url)
        urls.push(url)
        addedOnPage += 1
        collectedInCollection += 1

        if (collectedInCollection >= maxForThisCollection) break
        if (urls.length >= opts.maxProducts) return urls
      }

      if (collectedInCollection >= maxForThisCollection) break
      if (addedOnPage === 0) break
    }
  }

  return urls
}

export async function scrapeDmCollection(
  opts: ScrapeOptions,
): Promise<BrandScrapeResult> {
  const productUrls = await collectProductUrls(opts)
  const items: ScrapedProduct[] = []

  for (const productUrl of productUrls) {
    try {
      const html = await fetchText(productUrl)
      const item = await parseProduct(html, productUrl)
      if (!item) continue
      items.push(item)
      if (items.length >= opts.maxProducts) break
    } catch {
      // Continue if one product page fails.
    }
  }

  return {
    brandId: BRAND_ID,
    items,
  }
}
